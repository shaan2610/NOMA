// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/INomaTypes.sol";
import "./LeaseNFT.sol";
import "./NomaVault.sol";
import "./ReputationRegistry.sol";

/**
 * @title NomaPayment
 * @notice Core payment processing contract for NOMA protocol
 * @dev Handles rent payments, USDC settlement, and event emission
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │                         PAYMENT FLOW                                     │
 * │                                                                          │
 * │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐              │
 * │  │ TENANT  │───▶│  PAY    │───▶│ CONVERT │───▶│ SETTLE  │              │
 * │  │         │    │  RENT   │    │ TO USDC │    │ ON ARC  │              │
 * │  └─────────┘    └─────────┘    └─────────┘    └─────────┘              │
 * │       │              │              │              │                    │
 * │       │              ▼              ▼              ▼                    │
 * │       │        ┌─────────┐    ┌─────────┐    ┌─────────┐              │
 * │       │        │  EMIT   │    │  VAULT  │    │  UPDATE │              │
 * │       └───────▶│ EVENTS  │    │ DEPOSIT │    │  LEASE  │              │
 * │                └─────────┘    └─────────┘    └─────────┘              │
 * │                     │                              │                    │
 * │                     ▼                              ▼                    │
 * │               ┌─────────────────────────────────────────┐              │
 * │               │    REPUTATION UPDATE + AI TRIGGERS      │              │
 * │               └─────────────────────────────────────────┘              │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
contract NomaPayment is Ownable, ReentrancyGuard, INomaTypes {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    /// @notice USDC token contract
    IERC20 public immutable usdc;

    /// @notice LeaseNFT contract
    LeaseNFT public leaseNFT;

    /// @notice NomaVault contract
    NomaVault public vault;

    /// @notice ReputationRegistry contract
    ReputationRegistry public reputation;

    /// @notice Payment ID counter
    uint256 private _paymentIdCounter;

    /// @notice Mapping of payment ID to payment data
    mapping(uint256 => RentPayment) public payments;

    /// @notice Mapping of lease ID to payment IDs
    mapping(uint256 => uint256[]) public leasePayments;

    /// @notice Settlement chain identifier
    string public constant SETTLEMENT_CHAIN = "Arc";

    /// @notice Grace period for late payments (in seconds)
    uint256 public gracePeriod = 5 days;

    // ============ Errors ============

    error LeaseNotActive();
    error InsufficientAllowance();
    error InsufficientBalance();
    error PaymentAlreadyMade();
    error InvalidAmount();
    error NotTenant();

    // ============ Constructor ============

    /**
     * @notice Initialize payment contract
     * @param _usdc USDC token address
     */
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        _paymentIdCounter = 1;
    }

    // ============ Admin Functions ============

    /**
     * @notice Set contract references
     * @param _leaseNFT LeaseNFT contract address
     * @param _vault NomaVault contract address
     * @param _reputation ReputationRegistry contract address
     */
    function setContracts(address _leaseNFT, address _vault, address _reputation) external onlyOwner {
        leaseNFT = LeaseNFT(_leaseNFT);
        vault = NomaVault(_vault);
        reputation = ReputationRegistry(_reputation);
    }

    /**
     * @notice Set grace period for late payments
     * @param _gracePeriod New grace period in seconds
     */
    function setGracePeriod(uint256 _gracePeriod) external onlyOwner {
        gracePeriod = _gracePeriod;
    }

    // ============ Payment Functions ============

    /**
     * @notice Pay rent for a lease
     * @param leaseId The lease ID to pay rent for
     * @return paymentId The ID of the payment record
     *
     * @dev This is the main entry point for rent payments
     * Flow: Tenant → USDC → Vault → Lease Update → Reputation Update
     */
    function payRent(uint256 leaseId) external nonReentrant returns (uint256 paymentId) {
        // Get lease data
        Lease memory lease = leaseNFT.getLease(leaseId);

        // Validations
        if (lease.status != LeaseStatus.Active) revert LeaseNotActive();
        if (msg.sender != lease.tenant) revert NotTenant();

        uint256 amount = lease.monthlyRent;

        // Check allowance and balance
        if (usdc.allowance(msg.sender, address(this)) < amount) {
            revert InsufficientAllowance();
        }
        if (usdc.balanceOf(msg.sender) < amount) {
            revert InsufficientBalance();
        }

        // Calculate if payment is early
        uint256 dueDate = _calculateCurrentDueDate(lease.dueDay);
        bool isEarly = block.timestamp < dueDate;

        // Transfer USDC from tenant
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Approve vault and deposit
        usdc.approve(address(vault), amount);
        uint256 yieldEarned = vault.depositRent(leaseId, amount, isEarly);

        // Create payment record
        paymentId = _paymentIdCounter++;

        PaymentStatus status = isEarly
            ? PaymentStatus.Paid
            : (block.timestamp <= dueDate + gracePeriod ? PaymentStatus.Paid : PaymentStatus.Late);

        payments[paymentId] = RentPayment({
            paymentId: paymentId,
            leaseId: leaseId,
            amount: amount,
            dueDate: dueDate,
            paidDate: block.timestamp,
            status: status,
            isEarly: isEarly,
            yieldEarned: yieldEarned
        });

        leasePayments[leaseId].push(paymentId);

        // Update lease
        leaseNFT.recordPayment(leaseId, amount);

        // Update reputation
        reputation.recordPayment(lease.tenant, leaseId, isEarly, status == PaymentStatus.Late);

        // Emit events
        emit RentPaid(leaseId, paymentId, lease.tenant, amount, isEarly, yieldEarned);

        emit PaymentSettled(paymentId, leaseId, amount, SETTLEMENT_CHAIN);

        // AI Agent trigger for payment analysis
        emit AIAgentTrigger("PAYMENT_RECEIVED", leaseId, abi.encode(paymentId, amount, isEarly, yieldEarned));

        // Transfer to landlord (in production, could be held in vault for yield)
        vault.withdrawToLandlord(leaseId, lease.landlord, amount);

        return paymentId;
    }

    /**
     * @notice Pay rent with custom amount (partial or advance)
     * @param leaseId The lease ID
     * @param amount Amount to pay
     * @return paymentId The payment ID
     */
    function payRentCustomAmount(uint256 leaseId, uint256 amount) external nonReentrant returns (uint256 paymentId) {
        if (amount == 0) revert InvalidAmount();

        Lease memory lease = leaseNFT.getLease(leaseId);
        if (lease.status != LeaseStatus.Active) revert LeaseNotActive();
        if (msg.sender != lease.tenant) revert NotTenant();

        // Transfer USDC
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Calculate timing
        uint256 dueDate = _calculateCurrentDueDate(lease.dueDay);
        bool isEarly = block.timestamp < dueDate;

        // Deposit to vault
        usdc.approve(address(vault), amount);
        uint256 yieldEarned = vault.depositRent(leaseId, amount, isEarly);

        // Create payment record
        paymentId = _paymentIdCounter++;

        payments[paymentId] = RentPayment({
            paymentId: paymentId,
            leaseId: leaseId,
            amount: amount,
            dueDate: dueDate,
            paidDate: block.timestamp,
            status: PaymentStatus.Paid,
            isEarly: isEarly,
            yieldEarned: yieldEarned
        });

        leasePayments[leaseId].push(paymentId);
        leaseNFT.recordPayment(leaseId, amount);
        reputation.recordPayment(lease.tenant, leaseId, isEarly, false);

        emit RentPaid(leaseId, paymentId, lease.tenant, amount, isEarly, yieldEarned);
        emit PaymentSettled(paymentId, leaseId, amount, SETTLEMENT_CHAIN);

        // Transfer to landlord
        vault.withdrawToLandlord(leaseId, lease.landlord, amount);

        return paymentId;
    }

    // ============ Internal Functions ============

    /**
     * @notice Calculate current due date based on due day
     * @param dueDay Day of month (1-28)
     * @return dueDate Timestamp of current due date
     */
    function _calculateCurrentDueDate(uint256 dueDay) internal view returns (uint256) {
        // Simplified calculation for MVP
        // In production, use proper date library
        uint256 currentMonth = block.timestamp / 30 days;
        return (currentMonth * 30 days) + (dueDay * 1 days);
    }

    // ============ View Functions ============

    /**
     * @notice Get payment details
     * @param paymentId The payment ID
     * @return The payment data
     */
    function getPayment(uint256 paymentId) external view returns (RentPayment memory) {
        return payments[paymentId];
    }

    /**
     * @notice Get all payments for a lease
     * @param leaseId The lease ID
     * @return Array of payment IDs
     */
    function getLeasePayments(uint256 leaseId) external view returns (uint256[] memory) {
        return leasePayments[leaseId];
    }

    /**
     * @notice Get payment history for a lease
     * @param leaseId The lease ID
     * @return paymentList Array of payment data
     */
    function getPaymentHistory(uint256 leaseId) external view returns (RentPayment[] memory) {
        uint256[] memory paymentIds = leasePayments[leaseId];
        RentPayment[] memory paymentList = new RentPayment[](paymentIds.length);

        for (uint256 i = 0; i < paymentIds.length; i++) {
            paymentList[i] = payments[paymentIds[i]];
        }

        return paymentList;
    }

    /**
     * @notice Check if rent is due for a lease
     * @param leaseId The lease ID
     * @return isDue Whether rent is due
     * @return daysUntilDue Days until due (negative if overdue)
     */
    function checkRentDue(uint256 leaseId) external view returns (bool isDue, int256 daysUntilDue) {
        Lease memory lease = leaseNFT.getLease(leaseId);
        uint256 dueDate = _calculateCurrentDueDate(lease.dueDay);

        if (block.timestamp >= dueDate) {
            isDue = true;
            daysUntilDue = -int256((block.timestamp - dueDate) / 1 days);
        } else {
            isDue = false;
            daysUntilDue = int256((dueDate - block.timestamp) / 1 days);
        }
    }

    /**
     * @notice Estimate yield for early payment
     * @param leaseId The lease ID
     * @return estimatedYield Estimated yield amount
     */
    function estimateEarlyPaymentYield(uint256 leaseId) external view returns (uint256) {
        Lease memory lease = leaseNFT.getLease(leaseId);
        uint256 dueDate = _calculateCurrentDueDate(lease.dueDay);

        if (block.timestamp >= dueDate) {
            return 0; // No yield for on-time or late payments
        }

        uint256 daysEarly = (dueDate - block.timestamp) / 1 days;
        return vault.estimateYield(lease.monthlyRent, daysEarly);
    }
}

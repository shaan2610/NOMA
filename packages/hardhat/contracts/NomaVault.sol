// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/INomaTypes.sol";

/**
 * @title NomaVault
 * @notice Vault for USDC deposits, yield generation, and fund management
 * @dev Handles yield routing for early rent payments
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                        NOMA VAULT                                │
 * │                                                                  │
 * │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
 * │  │   DEPOSIT    │───▶│  YIELD POOL  │───▶│  DISTRIBUTE  │      │
 * │  │   (USDC)     │    │              │    │              │      │
 * │  └──────────────┘    └──────────────┘    └──────────────┘      │
 * │         │                   │                   │               │
 * │         ▼                   ▼                   ▼               │
 * │  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
 * │  │   Tenant     │    │  AI Routing  │    │   Landlord   │      │
 * │  │   Balance    │    │  (Mock MVP)  │    │   Balance    │      │
 * │  └──────────────┘    └──────────────┘    └──────────────┘      │
 * └─────────────────────────────────────────────────────────────────┘
 */
contract NomaVault is Ownable, ReentrancyGuard, INomaTypes {
    using SafeERC20 for IERC20;

    // ============ State Variables ============

    /// @notice USDC token contract
    IERC20 public immutable usdc;

    /// @notice Payment contract address
    address public paymentContract;

    /// @notice Total USDC in vault
    uint256 public totalDeposits;

    /// @notice Total yield generated
    uint256 public totalYieldGenerated;

    /// @notice Yield rate for early payments (basis points, e.g., 50 = 0.5%)
    uint256 public earlyPaymentYieldBps = 50; // 0.5% yield for early payment

    /// @notice Mapping of lease ID to deposited amount
    mapping(uint256 => uint256) public leaseDeposits;

    /// @notice Mapping of address to claimable yield
    mapping(address => uint256) public claimableYield;

    /// @notice Mapping of lease ID to yield earned
    mapping(uint256 => uint256) public leaseYield;

    // ============ Yield Strategy (Mock for MVP) ============

    /// @notice Current yield strategy
    string public currentStrategy = "STABLE_YIELD";

    /// @notice Mock APY for demo (in basis points, 500 = 5%)
    uint256 public mockAPY = 500;

    // ============ Errors ============

    error Unauthorized();
    error InsufficientBalance();
    error InvalidAmount();
    error TransferFailed();

    // ============ Modifiers ============

    modifier onlyPaymentContract() {
        if (msg.sender != paymentContract) revert Unauthorized();
        _;
    }

    // ============ Constructor ============

    /**
     * @notice Initialize the vault with USDC address
     * @param _usdc Address of USDC token contract
     */
    constructor(address _usdc) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
    }

    // ============ Admin Functions ============

    /**
     * @notice Set the payment contract address
     * @param _paymentContract Address of NomaPayment contract
     */
    function setPaymentContract(address _paymentContract) external onlyOwner {
        paymentContract = _paymentContract;
    }

    /**
     * @notice Update early payment yield rate
     * @param _yieldBps New yield rate in basis points
     */
    function setEarlyPaymentYield(uint256 _yieldBps) external onlyOwner {
        earlyPaymentYieldBps = _yieldBps;
    }

    /**
     * @notice Update mock APY for demo
     * @param _apyBps New APY in basis points
     */
    function setMockAPY(uint256 _apyBps) external onlyOwner {
        mockAPY = _apyBps;
    }

    // ============ Deposit Functions ============

    /**
     * @notice Deposit rent payment into vault
     * @param leaseId The lease ID for the payment
     * @param amount Amount of USDC to deposit
     * @param isEarly Whether this is an early payment
     * @return yieldEarned Amount of yield earned (if early)
     */
    function depositRent(
        uint256 leaseId,
        uint256 amount,
        bool isEarly
    ) external onlyPaymentContract nonReentrant returns (uint256 yieldEarned) {
        if (amount == 0) revert InvalidAmount();

        // Transfer USDC from payment contract
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        // Update deposits
        leaseDeposits[leaseId] += amount;
        totalDeposits += amount;

        // Calculate yield for early payments
        if (isEarly) {
            yieldEarned = _calculateEarlyPaymentYield(amount);
            leaseYield[leaseId] += yieldEarned;
            totalYieldGenerated += yieldEarned;

            // Route yield (mock for MVP)
            emit YieldRouted(leaseId, yieldEarned, currentStrategy);

            // AI Agent trigger for yield routing
            emit AIAgentTrigger("YIELD_ROUTING", leaseId, abi.encode(amount, yieldEarned, currentStrategy));
        }

        return yieldEarned;
    }

    /**
     * @notice Withdraw funds to landlord
     * @param leaseId The lease ID
     * @param landlord Landlord address
     * @param amount Amount to withdraw
     */
    function withdrawToLandlord(
        uint256 leaseId,
        address landlord,
        uint256 amount
    ) external onlyPaymentContract nonReentrant {
        if (leaseDeposits[leaseId] < amount) revert InsufficientBalance();

        leaseDeposits[leaseId] -= amount;
        totalDeposits -= amount;

        usdc.safeTransfer(landlord, amount);
    }

    // ============ Yield Functions ============

    /**
     * @notice Calculate yield for early payment
     * @param amount Payment amount
     * @return yield Amount of yield earned
     */
    function _calculateEarlyPaymentYield(uint256 amount) internal view returns (uint256) {
        // Simple yield calculation: amount * yield rate / 10000
        return (amount * earlyPaymentYieldBps) / 10000;
    }

    /**
     * @notice Get estimated yield for an amount
     * @param amount The deposit amount
     * @param daysEarly Days before due date
     * @return estimatedYield Estimated yield amount
     */
    function estimateYield(uint256 amount, uint256 daysEarly) external view returns (uint256 estimatedYield) {
        // Base yield + bonus for days early
        uint256 baseYield = (amount * earlyPaymentYieldBps) / 10000;
        uint256 earlyBonus = (amount * daysEarly * 2) / 10000; // 0.02% per day early

        return baseYield + earlyBonus;
    }

    /**
     * @notice Claim accumulated yield
     * @param recipient Address to send yield to
     */
    function claimYield(address recipient) external nonReentrant {
        uint256 amount = claimableYield[msg.sender];
        if (amount == 0) revert InsufficientBalance();

        claimableYield[msg.sender] = 0;
        usdc.safeTransfer(recipient, amount);
    }

    // ============ AI Agent Integration Points ============

    /**
     * @notice Update yield strategy (AI agent would call this)
     * @param strategy New strategy identifier
     * @dev In production, this would integrate with actual DeFi protocols
     */
    function updateYieldStrategy(string calldata strategy) external onlyOwner {
        currentStrategy = strategy;

        emit AIAgentTrigger("STRATEGY_UPDATE", 0, abi.encode(strategy, mockAPY));
    }

    /**
     * @notice Simulate yield accrual (for demo purposes)
     * @param leaseId The lease to accrue yield for
     */
    function accrueYield(uint256 leaseId) external onlyOwner {
        uint256 deposits = leaseDeposits[leaseId];
        if (deposits > 0) {
            // Simulate daily yield accrual
            uint256 dailyYield = (deposits * mockAPY) / 10000 / 365;
            leaseYield[leaseId] += dailyYield;
            totalYieldGenerated += dailyYield;

            emit YieldRouted(leaseId, dailyYield, currentStrategy);
        }
    }

    // ============ View Functions ============

    /**
     * @notice Get vault stats
     * @return deposits Total deposits
     * @return yield_ Total yield generated
     * @return strategy Current strategy
     * @return apy Current APY
     */
    function getVaultStats()
        external
        view
        returns (uint256 deposits, uint256 yield_, string memory strategy, uint256 apy)
    {
        return (totalDeposits, totalYieldGenerated, currentStrategy, mockAPY);
    }

    /**
     * @notice Get lease vault info
     * @param leaseId The lease ID
     * @return deposited Amount deposited
     * @return yieldEarned Yield earned
     */
    function getLeaseVaultInfo(uint256 leaseId) external view returns (uint256 deposited, uint256 yieldEarned) {
        return (leaseDeposits[leaseId], leaseYield[leaseId]);
    }
}

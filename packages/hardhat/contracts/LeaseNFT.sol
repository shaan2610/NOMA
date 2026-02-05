// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/INomaTypes.sol";

/**
 * @title LeaseNFT
 * @notice NFT representation of rental leases for the NOMA protocol
 * @dev Each lease is minted as an NFT owned by the tenant
 * 
 * ┌─────────────────────────────────────────────────────────────┐
 * │                      LEASE NFT                               │
 * │  ┌─────────────────────────────────────────────────────┐   │
 * │  │ Lease ID: #1234                                      │   │
 * │  │ Tenant: 0x...abc                                     │   │
 * │  │ Landlord: 0x...def                                   │   │
 * │  │ Monthly Rent: 1,500 USDC                             │   │
 * │  │ Due Day: 1st of month                                │   │
 * │  │ Status: Active                                       │   │
 * │  │ Payments: 6 | Reputation: Trusted                    │   │
 * │  └─────────────────────────────────────────────────────┘   │
 * └─────────────────────────────────────────────────────────────┘
 */
contract LeaseNFT is ERC721, ERC721URIStorage, Ownable, INomaTypes {
    // ============ State Variables ============

    /// @notice Counter for lease IDs
    uint256 private _leaseIdCounter;

    /// @notice Mapping from lease ID to lease data
    mapping(uint256 => Lease) public leases;

    /// @notice Mapping from tenant address to their lease IDs
    mapping(address => uint256[]) public tenantLeases;

    /// @notice Mapping from landlord address to their lease IDs
    mapping(address => uint256[]) public landlordLeases;

    /// @notice Payment contract address (authorized to update leases)
    address public paymentContract;

    // ============ Errors ============

    error Unauthorized();
    error InvalidDueDay();
    error InvalidRentAmount();
    error LeaseNotActive();
    error InvalidAddress();

    // ============ Modifiers ============

    modifier onlyPaymentContract() {
        if (msg.sender != paymentContract) revert Unauthorized();
        _;
    }

    modifier onlyLeaseParty(uint256 leaseId) {
        Lease storage lease = leases[leaseId];
        if (msg.sender != lease.tenant && msg.sender != lease.landlord) {
            revert Unauthorized();
        }
        _;
    }

    // ============ Constructor ============

    constructor() ERC721("NOMA Lease", "NOMA-LEASE") Ownable(msg.sender) {
        _leaseIdCounter = 1; // Start from 1
    }

    // ============ Admin Functions ============

    /**
     * @notice Set the payment contract address
     * @param _paymentContract Address of the NomaPayment contract
     */
    function setPaymentContract(address _paymentContract) external onlyOwner {
        if (_paymentContract == address(0)) revert InvalidAddress();
        paymentContract = _paymentContract;
    }

    // ============ Lease Management ============

    /**
     * @notice Create a new lease as a tenant
     * @param landlord Address of the landlord
     * @param monthlyRent Monthly rent amount in USDC (6 decimals)
     * @param dueDay Day of month rent is due (1-28)
     * @return leaseId The ID of the created lease
     */
    function createLeaseAsTenant(
        address landlord,
        uint256 monthlyRent,
        uint256 dueDay
    ) external returns (uint256 leaseId) {
        return _createLease(msg.sender, landlord, monthlyRent, dueDay);
    }

    /**
     * @notice Create a new lease as a landlord
     * @param tenant Address of the tenant
     * @param monthlyRent Monthly rent amount in USDC (6 decimals)
     * @param dueDay Day of month rent is due (1-28)
     * @return leaseId The ID of the created lease
     */
    function createLeaseAsLandlord(
        address tenant,
        uint256 monthlyRent,
        uint256 dueDay
    ) external returns (uint256 leaseId) {
        return _createLease(tenant, msg.sender, monthlyRent, dueDay);
    }

    /**
     * @notice Internal function to create a lease
     */
    function _createLease(
        address tenant,
        address landlord,
        uint256 monthlyRent,
        uint256 dueDay
    ) internal returns (uint256 leaseId) {
        if (tenant == address(0) || landlord == address(0)) revert InvalidAddress();
        if (dueDay < 1 || dueDay > 28) revert InvalidDueDay();
        if (monthlyRent == 0) revert InvalidRentAmount();

        leaseId = _leaseIdCounter++;

        leases[leaseId] = Lease({
            leaseId: leaseId,
            tenant: tenant,
            landlord: landlord,
            monthlyRent: monthlyRent,
            dueDay: dueDay,
            startDate: block.timestamp,
            endDate: 0, // Indefinite for MVP
            status: LeaseStatus.Active,
            totalPaid: 0,
            paymentCount: 0
        });

        tenantLeases[tenant].push(leaseId);
        landlordLeases[landlord].push(leaseId);

        // Mint NFT to tenant
        _safeMint(tenant, leaseId);

        emit LeaseCreated(leaseId, tenant, landlord, monthlyRent, dueDay);

        // AI Agent trigger for new lease
        emit AIAgentTrigger(
            "NEW_LEASE",
            leaseId,
            abi.encode(tenant, landlord, monthlyRent)
        );
    }

    /**
     * @notice Update lease payment data (called by payment contract)
     * @param leaseId The lease to update
     * @param amount Amount paid
     */
    function recordPayment(
        uint256 leaseId,
        uint256 amount
    ) external onlyPaymentContract {
        Lease storage lease = leases[leaseId];
        if (lease.status != LeaseStatus.Active) revert LeaseNotActive();

        lease.totalPaid += amount;
        lease.paymentCount += 1;
    }

    /**
     * @notice Terminate a lease
     * @param leaseId The lease to terminate
     */
    function terminateLease(uint256 leaseId) external onlyLeaseParty(leaseId) {
        Lease storage lease = leases[leaseId];
        if (lease.status != LeaseStatus.Active) revert LeaseNotActive();

        lease.status = LeaseStatus.Terminated;
        lease.endDate = block.timestamp;

        // AI Agent trigger for lease termination
        emit AIAgentTrigger(
            "LEASE_TERMINATED",
            leaseId,
            abi.encode(lease.tenant, lease.totalPaid, lease.paymentCount)
        );
    }

    // ============ View Functions ============

    /**
     * @notice Get lease details
     * @param leaseId The lease ID
     * @return The lease data
     */
    function getLease(uint256 leaseId) external view returns (Lease memory) {
        return leases[leaseId];
    }

    /**
     * @notice Get all leases for a tenant
     * @param tenant The tenant address
     * @return Array of lease IDs
     */
    function getTenantLeases(address tenant) external view returns (uint256[] memory) {
        return tenantLeases[tenant];
    }

    /**
     * @notice Get all leases for a landlord
     * @param landlord The landlord address
     * @return Array of lease IDs
     */
    function getLandlordLeases(address landlord) external view returns (uint256[] memory) {
        return landlordLeases[landlord];
    }

    /**
     * @notice Check if lease is active
     * @param leaseId The lease ID
     * @return True if lease is active
     */
    function isLeaseActive(uint256 leaseId) external view returns (bool) {
        return leases[leaseId].status == LeaseStatus.Active;
    }

    /**
     * @notice Get the current due date for a lease
     * @param leaseId The lease ID
     * @return The next due date timestamp
     */
    function getNextDueDate(uint256 leaseId) external view returns (uint256) {
        Lease storage lease = leases[leaseId];
        
        // Calculate next due date based on current time and due day
        uint256 currentMonth = (block.timestamp / 30 days);
        uint256 dueDate = (currentMonth * 30 days) + (lease.dueDay * 1 days);
        
        // If we're past this month's due date, return next month's
        if (block.timestamp > dueDate) {
            dueDate += 30 days;
        }
        
        return dueDate;
    }

    // ============ ERC721 Overrides ============

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}

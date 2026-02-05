// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title INomaTypes
 * @notice Common types and interfaces for the NOMA protocol
 * @dev Used across LeaseNFT, NomaVault, NomaPayment, and ReputationRegistry
 */
interface INomaTypes {
    // ============ Enums ============

    /// @notice Status of a lease
    enum LeaseStatus {
        Active,      // Lease is active and accepting payments
        Completed,   // Lease term completed
        Terminated   // Lease terminated early
    }

    /// @notice Status of a rent payment
    enum PaymentStatus {
        Pending,     // Payment expected but not received
        Paid,        // Payment received and settled
        Late,        // Payment received after due date
        Missed       // Payment window passed without payment
    }

    /// @notice Reputation tier for tenants
    enum ReputationTier {
        New,         // 0-2 payments
        Basic,       // 3-5 payments
        Trusted,     // 6-11 payments
        Premium      // 12+ payments
    }

    // ============ Structs ============

    /// @notice Lease information stored on-chain
    struct Lease {
        uint256 leaseId;           // Unique lease identifier
        address tenant;            // Tenant wallet address
        address landlord;          // Landlord wallet address
        uint256 monthlyRent;       // Monthly rent amount in USDC (6 decimals)
        uint256 dueDay;            // Day of month rent is due (1-28)
        uint256 startDate;         // Lease start timestamp
        uint256 endDate;           // Lease end timestamp (0 = indefinite)
        LeaseStatus status;        // Current lease status
        uint256 totalPaid;         // Total rent paid to date
        uint256 paymentCount;      // Number of payments made
    }

    /// @notice Individual rent payment record
    struct RentPayment {
        uint256 paymentId;         // Unique payment identifier
        uint256 leaseId;           // Associated lease ID
        uint256 amount;            // Amount paid in USDC
        uint256 dueDate;           // When payment was due
        uint256 paidDate;          // When payment was made
        PaymentStatus status;      // Payment status
        bool isEarly;              // Paid before due date
        uint256 yieldEarned;       // Yield earned from early payment
    }

    /// @notice Tenant reputation data
    struct Reputation {
        address tenant;            // Tenant wallet
        uint256 totalPayments;     // Total payments made
        uint256 onTimePayments;    // Payments made on/before due date
        uint256 earlyPayments;     // Payments made early
        uint256 latePayments;      // Late payments
        uint256 missedPayments;    // Missed payments
        uint256 totalYieldEarned;  // Total yield from early payments
        ReputationTier tier;       // Current reputation tier
        uint256 score;             // Numeric score (0-1000)
    }

    // ============ Events ============

    /// @notice Emitted when a new lease is created
    event LeaseCreated(
        uint256 indexed leaseId,
        address indexed tenant,
        address indexed landlord,
        uint256 monthlyRent,
        uint256 dueDay
    );

    /// @notice Emitted when rent is paid
    event RentPaid(
        uint256 indexed leaseId,
        uint256 indexed paymentId,
        address indexed tenant,
        uint256 amount,
        bool isEarly,
        uint256 yieldEarned
    );

    /// @notice Emitted when payment is settled on Arc
    event PaymentSettled(
        uint256 indexed paymentId,
        uint256 indexed leaseId,
        uint256 amount,
        string settlementChain
    );

    /// @notice Emitted when reputation is updated
    event ReputationUpdated(
        address indexed tenant,
        uint256 newScore,
        ReputationTier newTier
    );

    /// @notice Emitted when yield is routed
    event YieldRouted(
        uint256 indexed leaseId,
        uint256 amount,
        string strategy
    );

    /// @notice Emitted for AI agent trigger points
    event AIAgentTrigger(
        string indexed triggerType,
        uint256 indexed leaseId,
        bytes data
    );
}

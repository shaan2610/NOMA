// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/INomaTypes.sol";

/**
 * @title ReputationRegistry
 * @notice On-chain reputation tracking for NOMA tenants
 * @dev Tracks payment history and calculates reputation scores
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │                    REPUTATION SYSTEM                            │
 * │                                                                  │
 * │  Score Calculation:                                              │
 * │  ┌─────────────────────────────────────────────────────────┐   │
 * │  │ Base Score: 500                                          │   │
 * │  │ + On-time payment: +50 points                            │   │
 * │  │ + Early payment: +75 points                              │   │
 * │  │ - Late payment: -100 points                              │   │
 * │  │ - Missed payment: -200 points                            │   │
 * │  │ Max Score: 1000                                          │   │
 * │  └─────────────────────────────────────────────────────────┘   │
 * │                                                                  │
 * │  Tiers:                                                          │
 * │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐              │
 * │  │   NEW   │ │  BASIC  │ │ TRUSTED │ │ PREMIUM │              │
 * │  │  0-2    │ │   3-5   │ │  6-11   │ │   12+   │              │
 * │  │payments │ │payments │ │payments │ │payments │              │
 * │  └─────────┘ └─────────┘ └─────────┘ └─────────┘              │
 * └─────────────────────────────────────────────────────────────────┘
 */
contract ReputationRegistry is Ownable, INomaTypes {
    // ============ Constants ============

    uint256 public constant BASE_SCORE = 500;
    uint256 public constant MAX_SCORE = 1000;
    uint256 public constant ON_TIME_BONUS = 50;
    uint256 public constant EARLY_BONUS = 75;
    uint256 public constant LATE_PENALTY = 100;
    uint256 public constant MISSED_PENALTY = 200;

    // Tier thresholds (payment counts)
    uint256 public constant BASIC_THRESHOLD = 3;
    uint256 public constant TRUSTED_THRESHOLD = 6;
    uint256 public constant PREMIUM_THRESHOLD = 12;

    // ============ State Variables ============

    /// @notice Payment contract address
    address public paymentContract;

    /// @notice Mapping of tenant to reputation data
    mapping(address => Reputation) public reputations;

    /// @notice Mapping of tenant to lease-specific stats
    mapping(address => mapping(uint256 => LeaseStats)) public leaseStats;

    /// @notice Lease-specific payment stats
    struct LeaseStats {
        uint256 totalPayments;
        uint256 onTimePayments;
        uint256 earlyPayments;
        uint256 latePayments;
    }

    // ============ Errors ============

    error Unauthorized();
    error TenantNotFound();

    // ============ Modifiers ============

    modifier onlyPaymentContract() {
        if (msg.sender != paymentContract) revert Unauthorized();
        _;
    }

    // ============ Constructor ============

    constructor() Ownable(msg.sender) {}

    // ============ Admin Functions ============

    /**
     * @notice Set the payment contract address
     * @param _paymentContract Address of NomaPayment contract
     */
    function setPaymentContract(address _paymentContract) external onlyOwner {
        paymentContract = _paymentContract;
    }

    // ============ Reputation Management ============

    /**
     * @notice Record a payment and update reputation
     * @param tenant Tenant address
     * @param leaseId Lease ID
     * @param isEarly Whether payment was early
     * @param isLate Whether payment was late
     */
    function recordPayment(address tenant, uint256 leaseId, bool isEarly, bool isLate) external onlyPaymentContract {
        Reputation storage rep = reputations[tenant];
        LeaseStats storage stats = leaseStats[tenant][leaseId];

        // Initialize if first payment
        if (rep.tenant == address(0)) {
            rep.tenant = tenant;
            rep.score = BASE_SCORE;
        }

        // Update counts
        rep.totalPayments++;
        stats.totalPayments++;

        if (isEarly) {
            rep.earlyPayments++;
            rep.onTimePayments++;
            stats.earlyPayments++;
            stats.onTimePayments++;
            rep.score = _addScore(rep.score, EARLY_BONUS);
        } else if (isLate) {
            rep.latePayments++;
            stats.latePayments++;
            rep.score = _subtractScore(rep.score, LATE_PENALTY);
        } else {
            rep.onTimePayments++;
            stats.onTimePayments++;
            rep.score = _addScore(rep.score, ON_TIME_BONUS);
        }

        // Update tier
        rep.tier = _calculateTier(rep.totalPayments, rep.score);

        emit ReputationUpdated(tenant, rep.score, rep.tier);

        // AI Agent trigger for reputation milestone
        if (_isMilestone(rep.totalPayments)) {
            emit AIAgentTrigger(
                "REPUTATION_MILESTONE",
                leaseId,
                abi.encode(tenant, rep.totalPayments, rep.score, rep.tier)
            );
        }
    }

    /**
     * @notice Record a missed payment
     * @param tenant Tenant address
     * @param leaseId Lease ID
     */
    function recordMissedPayment(address tenant, uint256 leaseId) external onlyPaymentContract {
        Reputation storage rep = reputations[tenant];

        if (rep.tenant == address(0)) {
            rep.tenant = tenant;
            rep.score = BASE_SCORE;
        }

        rep.missedPayments++;
        rep.score = _subtractScore(rep.score, MISSED_PENALTY);
        rep.tier = _calculateTier(rep.totalPayments, rep.score);

        emit ReputationUpdated(tenant, rep.score, rep.tier);

        emit AIAgentTrigger("MISSED_PAYMENT", leaseId, abi.encode(tenant, rep.missedPayments, rep.score));
    }

    /**
     * @notice Add yield earned to tenant's record
     * @param tenant Tenant address
     * @param yieldAmount Amount of yield earned
     */
    function addYieldEarned(address tenant, uint256 yieldAmount) external onlyPaymentContract {
        reputations[tenant].totalYieldEarned += yieldAmount;
    }

    // ============ Internal Functions ============

    /**
     * @notice Add to score with cap at MAX_SCORE
     */
    function _addScore(uint256 current, uint256 bonus) internal pure returns (uint256) {
        uint256 newScore = current + bonus;
        return newScore > MAX_SCORE ? MAX_SCORE : newScore;
    }

    /**
     * @notice Subtract from score with floor at 0
     */
    function _subtractScore(uint256 current, uint256 penalty) internal pure returns (uint256) {
        return current > penalty ? current - penalty : 0;
    }

    /**
     * @notice Calculate reputation tier
     */
    function _calculateTier(uint256 paymentCount, uint256 score) internal pure returns (ReputationTier) {
        // Must have minimum score to advance tiers
        if (score < 300) return ReputationTier.New;

        if (paymentCount >= PREMIUM_THRESHOLD && score >= 700) {
            return ReputationTier.Premium;
        } else if (paymentCount >= TRUSTED_THRESHOLD && score >= 550) {
            return ReputationTier.Trusted;
        } else if (paymentCount >= BASIC_THRESHOLD && score >= 400) {
            return ReputationTier.Basic;
        }
        return ReputationTier.New;
    }

    /**
     * @notice Check if payment count is a milestone
     */
    function _isMilestone(uint256 count) internal pure returns (bool) {
        return count == BASIC_THRESHOLD || count == TRUSTED_THRESHOLD || count == PREMIUM_THRESHOLD;
    }

    // ============ View Functions ============

    /**
     * @notice Get tenant reputation
     * @param tenant Tenant address
     * @return Reputation data
     */
    function getReputation(address tenant) external view returns (Reputation memory) {
        return reputations[tenant];
    }

    /**
     * @notice Get tenant reputation score
     * @param tenant Tenant address
     * @return score Current reputation score
     */
    function getScore(address tenant) external view returns (uint256) {
        return reputations[tenant].score;
    }

    /**
     * @notice Get tenant reputation tier
     * @param tenant Tenant address
     * @return tier Current reputation tier
     */
    function getTier(address tenant) external view returns (ReputationTier) {
        return reputations[tenant].tier;
    }

    /**
     * @notice Get tier name as string
     * @param tier The tier enum
     * @return name Tier name
     */
    function getTierName(ReputationTier tier) external pure returns (string memory) {
        if (tier == ReputationTier.Premium) return "Premium";
        if (tier == ReputationTier.Trusted) return "Trusted";
        if (tier == ReputationTier.Basic) return "Basic";
        return "New";
    }

    /**
     * @notice Get lease-specific stats
     * @param tenant Tenant address
     * @param leaseId Lease ID
     * @return stats Lease payment stats
     */
    function getLeaseStats(address tenant, uint256 leaseId) external view returns (LeaseStats memory) {
        return leaseStats[tenant][leaseId];
    }

    /**
     * @notice Check if tenant is eligible for lending access
     * @param tenant Tenant address
     * @return eligible Whether tenant can access lending
     * @return reason Eligibility reason
     */
    function checkLendingEligibility(address tenant) external view returns (bool eligible, string memory reason) {
        Reputation memory rep = reputations[tenant];

        if (rep.tier == ReputationTier.Premium) {
            return (true, "Premium tier - Full lending access");
        } else if (rep.tier == ReputationTier.Trusted) {
            return (true, "Trusted tier - Standard lending access");
        } else if (rep.tier == ReputationTier.Basic && rep.score >= 500) {
            return (true, "Basic tier - Limited lending access");
        }

        return (false, "Build more reputation to unlock lending");
    }

    /**
     * @notice Calculate payments needed for next tier
     * @param tenant Tenant address
     * @return paymentsNeeded Number of payments to next tier
     * @return nextTier The next tier to achieve
     */
    function getNextTierProgress(
        address tenant
    ) external view returns (uint256 paymentsNeeded, ReputationTier nextTier) {
        Reputation memory rep = reputations[tenant];

        if (rep.tier == ReputationTier.Premium) {
            return (0, ReputationTier.Premium);
        } else if (rep.tier == ReputationTier.Trusted) {
            return (PREMIUM_THRESHOLD - rep.totalPayments, ReputationTier.Premium);
        } else if (rep.tier == ReputationTier.Basic) {
            return (TRUSTED_THRESHOLD - rep.totalPayments, ReputationTier.Trusted);
        }
        return (BASIC_THRESHOLD - rep.totalPayments, ReputationTier.Basic);
    }
}

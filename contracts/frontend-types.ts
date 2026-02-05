/**
 * NOMA Protocol - TypeScript Types for Frontend
 * 
 * Copy this file to your frontend project for type safety
 */

// ═══════════════════════════════════════════════════════════════
// Contract Addresses (Sepolia)
// ═══════════════════════════════════════════════════════════════

export const NOMA_CONTRACTS = {
  MockUSDC: "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b",
  LeaseNFT: "0x8f0237b2076887988b796C6054A9a5a6Cf5cA058",
  NomaVault: "0xc8a37Bd0B65862e9e38F7568621e4349d84De007",
  ReputationRegistry: "0x54063F6114cCDD076f60a5AB3729a8C89B0264ad",
  NomaPayment: "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4",
} as const;

export const CHAIN_ID = 11155111; // Sepolia
export const USDC_DECIMALS = 6;

// ═══════════════════════════════════════════════════════════════
// Enums
// ═══════════════════════════════════════════════════════════════

export enum LeaseStatus {
  Active = 0,
  Completed = 1,
  Terminated = 2,
}

export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Late = 2,
  Missed = 3,
}

export enum ReputationTier {
  New = 0,
  Basic = 1,
  Trusted = 2,
  Premium = 3,
}

// ═══════════════════════════════════════════════════════════════
// Structs (matching Solidity)
// ═══════════════════════════════════════════════════════════════

export interface Lease {
  leaseId: bigint;
  tenant: `0x${string}`;
  landlord: `0x${string}`;
  monthlyRent: bigint;
  dueDay: bigint;
  startDate: bigint;
  endDate: bigint;
  status: LeaseStatus;
  totalPaid: bigint;
  paymentCount: bigint;
}

export interface RentPayment {
  paymentId: bigint;
  leaseId: bigint;
  amount: bigint;
  dueDate: bigint;
  paidDate: bigint;
  status: PaymentStatus;
  isEarly: boolean;
  yieldEarned: bigint;
}

export interface Reputation {
  tenant: `0x${string}`;
  totalPayments: bigint;
  onTimePayments: bigint;
  earlyPayments: bigint;
  latePayments: bigint;
  missedPayments: bigint;
  totalYieldEarned: bigint;
  tier: ReputationTier;
  score: bigint;
}

// ═══════════════════════════════════════════════════════════════
// Event Types
// ═══════════════════════════════════════════════════════════════

export interface RentPaidEvent {
  leaseId: bigint;
  paymentId: bigint;
  tenant: `0x${string}`;
  amount: bigint;
  isEarly: boolean;
  yieldEarned: bigint;
}

export interface PaymentSettledEvent {
  paymentId: bigint;
  leaseId: bigint;
  amount: bigint;
  settlementChain: string; // Always "Arc"
}

export interface ReputationUpdatedEvent {
  tenant: `0x${string}`;
  newScore: bigint;
  newTier: ReputationTier;
}

export interface LeaseCreatedEvent {
  leaseId: bigint;
  tenant: `0x${string}`;
  landlord: `0x${string}`;
  monthlyRent: bigint;
  dueDay: bigint;
}

// ═══════════════════════════════════════════════════════════════
// Helper Functions
// ═══════════════════════════════════════════════════════════════

/**
 * Format USDC amount for display (6 decimals)
 */
export function formatUSDC(amount: bigint): string {
  return (Number(amount) / 1_000_000).toFixed(2);
}

/**
 * Parse USDC amount from string to bigint
 */
export function parseUSDC(amount: string): bigint {
  return BigInt(Math.floor(parseFloat(amount) * 1_000_000));
}

/**
 * Get tier display name
 */
export function getTierName(tier: ReputationTier): string {
  const names = ["New", "Basic", "Trusted", "Premium"];
  return names[tier] || "Unknown";
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: ReputationTier): string {
  const colors = {
    [ReputationTier.New]: "#6B7280",     // gray
    [ReputationTier.Basic]: "#3B82F6",   // blue
    [ReputationTier.Trusted]: "#10B981", // green
    [ReputationTier.Premium]: "#F59E0B", // gold
  };
  return colors[tier] || "#6B7280";
}

/**
 * Get payment status display name
 */
export function getPaymentStatusName(status: PaymentStatus): string {
  const names = ["Pending", "Paid", "Late", "Missed"];
  return names[status] || "Unknown";
}

/**
 * Get lease status display name
 */
export function getLeaseStatusName(status: LeaseStatus): string {
  const names = ["Active", "Completed", "Terminated"];
  return names[status] || "Unknown";
}

/**
 * Calculate days until due date
 */
export function getDaysUntilDue(dueDay: number): number {
  const today = new Date();
  const currentDay = today.getDate();
  
  if (currentDay <= dueDay) {
    return dueDay - currentDay;
  } else {
    // Next month
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    return daysInMonth - currentDay + dueDay;
  }
}

// ═══════════════════════════════════════════════════════════════
// Constants for UI
// ═══════════════════════════════════════════════════════════════

export const TIER_THRESHOLDS = {
  BASIC: 3,    // 3+ payments
  TRUSTED: 6,  // 6+ payments
  PREMIUM: 12, // 12+ payments
};

export const SCORE_CHANGES = {
  ON_TIME: 50,
  EARLY: 75,
  LATE: -100,
  MISSED: -200,
};

export const BASE_SCORE = 500;
export const MAX_SCORE = 1000;

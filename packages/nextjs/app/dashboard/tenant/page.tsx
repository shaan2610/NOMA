"use client";

import { useState } from "react";
import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const Dashboard: NextPage = () => {
  const { address } = useAccount();

  // Read tenant's leases
  const { data: leaseIds } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getTenantLeases",
    args: [address],
  });

  // State for selected lease
  const [selectedLeaseIndex, setSelectedLeaseIndex] = useState(0);
  const selectedLeaseId = leaseIds && leaseIds.length > 0 ? leaseIds[selectedLeaseIndex] : undefined;

  // Read lease data for selected lease
  const { data: lease } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getLease",
    args: [selectedLeaseId],
  });

  // Read reputation
  const { data: reputation } = useScaffoldReadContract({
    contractName: "ReputationRegistry",
    functionName: "getReputation",
    args: [address],
  });

  // Get payment history directly from contract instead of events
  const { data: paymentHistory } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [selectedLeaseId],
    watch: true,
  });

  // Helper functions
  const formatAddress = (addr: string | undefined) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
  };

  const formatAmount = (amount: bigint | undefined) => {
    if (!amount) return "0";
    // USDC has 6 decimals
    return (Number(amount) / 1e6).toLocaleString();
  };

  const calculateReputationScore = () => {
    if (!reputation) return 0;
    const total = Number(reputation.totalPayments || 0n);
    const early = Number(reputation.earlyPayments || 0n);
    const late = Number(reputation.latePayments || 0n);

    if (total === 0) return 300; // Starting score

    // Score calculation: base 300 + (early * 50) - (late * 100) + (total * 10)
    const score = 300 + early * 50 - late * 100 + total * 10;
    return Math.min(Math.max(score, 300), 850); // Clamp between 300-850
  };

  const getScoreRating = (score: number) => {
    if (score >= 800) return "Excellent Credit Score";
    if (score >= 700) return "Good Credit Score";
    if (score >= 600) return "Fair Credit Score";
    return "Building Credit";
  };

  const getStarCount = (score: number) => {
    if (score >= 800) return 5;
    if (score >= 700) return 4;
    if (score >= 600) return 3;
    if (score >= 500) return 2;
    return 1;
  };

  const reputationScore = calculateReputationScore();
  const onTimePercentage =
    reputation && Number(reputation.totalPayments || 0n) > 0
      ? ((Number(reputation.totalPayments || 0n) - Number(reputation.latePayments || 0n)) /
          Number(reputation.totalPayments || 0n)) *
        100
      : 0;

  if (!address) {
    return (
      <div className="min-h-screen bg-base-300 px-8 py-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="alert alert-warning">
            <span>Please connect your wallet to view your dashboard</span>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedLeaseId || !lease) {
    return (
      <div className="min-h-screen bg-base-300 px-8 py-8">
        <div className="w-full max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Tenant Dashboard</h1>
            <p className="text-gray-300">No active lease found. Contact your landlord to create a lease.</p>
          </div>
        </div>
      </div>
    );
  }

  const hasMultipleLeases = leaseIds && leaseIds.length > 1;

  return (
    <div className="min-h-screen bg-base-300 px-8 py-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Tenant Dashboard</h1>
              <p className="text-gray-300">Manage your lease, pay rent, and track your reputation on-chain.</p>
            </div>
            <div className="text-right">
              <div className="badge badge-lg badge-primary text-white font-bold">
                📋 Viewing Lease #{selectedLeaseId?.toString()}
              </div>
              {hasMultipleLeases && (
                <p className="text-sm text-gray-400 mt-1">You have {leaseIds.length} active leases</p>
              )}
            </div>
          </div>
        </div>

        {/* Property Selector - Dropdown */}
        {leaseIds && leaseIds.length > 0 && (
          <div className="mb-6 flex items-center gap-4">
            <label className="text-white font-semibold">Select Property:</label>
            <select
              className="select select-bordered select-primary bg-base-100 text-white font-bold"
              value={selectedLeaseIndex}
              onChange={e => setSelectedLeaseIndex(Number(e.target.value))}
            >
              {leaseIds.map((leaseId, index) => (
                <option key={leaseId.toString()} value={index}>
                  Lease #{leaseId.toString()}
                </option>
              ))}
            </select>
            {hasMultipleLeases && <span className="text-sm text-gray-400">({leaseIds.length} leases available)</span>}
          </div>
        )}

        {/* Main Property Card */}
        <div className="card bg-white shadow-xl mb-6 border-4 border-blue-400">
          <div className="card-body p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-black">Your Rental Property</h2>
                  <div className={`badge gap-1 text-white ${lease.status === 0 ? "badge-success" : "badge-error"}`}>
                    <span className="w-2 h-2 bg-white rounded-full"></span>
                    {lease.status === 0 ? "ACTIVE" : lease.status === 1 ? "COMPLETED" : "TERMINATED"}
                  </div>
                </div>
                <div className="flex gap-4 text-xs text-gray-500">
                  <span>Lease ID: #{selectedLeaseId.toString()}</span>
                  <span>Landlord: {formatAddress(lease.landlord)}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
                <p className="text-2xl font-bold text-black">{formatAmount(lease.monthlyRent)} USDC</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Next Due Date</p>
                <p className="text-2xl font-bold text-black">Day {lease.dueDay?.toString()}</p>
                <p className="text-xs text-gray-500">of each month</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Payments Made</p>
                <p className="text-2xl font-bold text-black">{lease.paymentCount?.toString()}</p>
                <p className="text-xs text-gray-500">Total payments</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-black">
                  {formatAmount(lease.monthlyRent && lease.paymentCount ? lease.monthlyRent * lease.paymentCount : 0n)}{" "}
                  USDC
                </p>
                <p className="text-xs text-success">On-chain verified</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pay Rent Card */}
          <div className="card bg-white shadow-xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Pay Rent</h3>
                <div className="bg-purple-100 rounded-lg p-2">
                  <span className="text-2xl">💵</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Pay from any token, any chain</p>

              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">Amount</p>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-3xl font-bold text-black">{formatAmount(lease.monthlyRent)} USDC</p>
                  <p className="text-xs text-gray-500">≈ ${formatAmount(lease.monthlyRent)}</p>
                </div>
              </div>

              {/* Payment Steps */}
              <div className="bg-purple-50 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-purple-900 mb-2">
                  <span className="text-purple-600">⚡</span>
                  <span className="font-semibold">LI.FI powered cross-chain payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-700">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">1</span>
                    <span>Swap</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">2</span>
                    <span>Bridge</span>
                  </div>
                  <span>→</span>
                  <div className="flex items-center gap-1">
                    <span className="font-semibold">3</span>
                    <span>Pay</span>
                  </div>
                </div>
              </div>

              <Link href="/pay-rent" className="btn btn-primary w-full bg-purple-600 hover:bg-purple-700 border-none">
                Pay Rent Now →
              </Link>

              <p className="text-xs text-center text-gray-500 mt-3">Pay early to earn more yield 💰</p>
            </div>
          </div>

          {/* Active Rent Session Card */}
          <div className="card bg-white shadow-xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Lease Status</h3>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <span className="text-2xl">⚡</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Your current lease information</p>

              {/* Lease Status */}
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">📋</span>
                    <span className="font-semibold text-blue-900">LEASE ACTIVE</span>
                  </div>
                  <span className="text-xs text-gray-500">On-chain</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Lease ID</span>
                  <span className="font-bold text-black">#{selectedLeaseId.toString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <span className={`font-bold ${lease.status === 0 ? "text-success" : "text-error"}`}>
                    {lease.status === 0 ? "Active" : lease.status === 1 ? "Completed" : "Terminated"}
                  </span>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">Payments Made</span>
                  <span className="font-bold text-black">{lease.paymentCount?.toString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${Math.min((Number(lease.paymentCount || 0n) / 12) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">{lease.paymentCount?.toString()} of 12 months paid</p>
              </div>

              {/* Landlord Info */}
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">👤</span>
                  <span className="text-sm font-semibold text-green-900">Landlord Address</span>
                </div>
                <p className="text-sm font-mono text-green-900 mt-1">{formatAddress(lease.landlord)}</p>
              </div>

              <Link href={`/lease/${selectedLeaseId.toString()}`} className="btn w-full border-blue-600 text-blue-600">
                View Lease Details →
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Yield & Vault Card - Mock data for now */}
          <div className="card bg-white shadow-xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Yield & Vault</h3>
                <div className="bg-green-100 rounded-lg p-2">
                  <span className="text-2xl">📈</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Earn yield while rent is locked</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Deposited</p>
                  <p className="text-xl font-bold text-black">
                    {formatAmount(
                      lease.monthlyRent && lease.paymentCount ? lease.monthlyRent * lease.paymentCount : 0n,
                    )}{" "}
                    USDC
                  </p>
                  <p className="text-xs text-gray-500">{lease.paymentCount?.toString()} payments locked</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Yield Earned</p>
                  <p className="text-xl font-bold text-success">+0 USDC</p>
                  <p className="text-xs text-success">Coming soon</p>
                </div>
              </div>

              {/* Vault Over Time Chart */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Payment History</p>
                <div className="flex items-end gap-2 h-32">
                  {[40, 55, 85, 50, 55].map((height, i) => (
                    <div
                      key={i}
                      className="bg-success flex-1 rounded-t"
                      style={{ height: `${height}%`, opacity: i < Number(lease.paymentCount || 0n) ? 1 : 0.3 }}
                    ></div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <span className="font-bold">Note:</span> Yield feature powered by NomaVault will be activated soon.
                  Your rent payments are securely held on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Reputation Score Card */}
          <div className="card bg-white shadow-xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">Reputation Score</h3>
                <div className="bg-blue-100 rounded-lg p-2">
                  <span className="text-2xl">🏆</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                On-chain verified rental history • <span className="text-blue-600">On-chain</span>
              </p>

              {/* Score Display */}
              <div className="text-center mb-6">
                <p className="text-6xl font-bold text-primary mb-2">{reputationScore}</p>
                <p className="text-sm font-semibold text-black mb-2">{getScoreRating(reputationScore)}</p>
                <div className="flex justify-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`text-2xl ${i < getStarCount(reputationScore) ? "text-yellow-400" : "text-gray-300"}`}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">On-Time Payments</span>
                    <span className="font-bold text-success">{onTimePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-success h-2 rounded-full" style={{ width: `${onTimePercentage}%` }}></div>
                  </div>
                  <p className="text-xs text-success mt-1">{reputation?.totalPayments?.toString() || "0"} payments</p>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Early Payments</span>
                    <span className="font-bold text-blue-600">{reputation?.earlyPayments?.toString() || "0"}</span>
                  </div>
                  <div className="w-full bg-blue-500 rounded-full h-2"></div>
                </div>

                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Late Payments</span>
                    <span className="font-bold text-error">{reputation?.latePayments?.toString() || "0"}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-error h-2 rounded-full"
                      style={{
                        width: `${Number(reputation?.latePayments || 0n) > 0 ? (Number(reputation?.latePayments || 0n) / Number(reputation?.totalPayments || 1n)) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <span className="font-bold">Note:</span> Your reputation is updated on-chain after each successful
                  payment. Higher scores unlock better rates and rental opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Card */}
        <div className="card bg-white shadow-xl">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-black">Payment History</h3>
              <span className="text-sm font-semibold text-gray-500">{paymentHistory?.length || 0} transactions</span>
            </div>
            <p className="text-sm text-gray-600 mb-6">All transactions verified on-chain</p>

            {/* Payment Items */}
            <div className="space-y-4">
              {paymentHistory && paymentHistory.length > 0 ? (
                paymentHistory.map((payment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-success/20 rounded-full p-3">
                        <span className="text-success text-xl">✓</span>
                      </div>
                      <div>
                        <p className="font-bold text-black">Rent Payment #{payment.paymentId?.toString()}</p>
                        <p className="text-sm text-gray-500">
                          Lease #{payment.leaseId?.toString()} • {payment.isEarly ? "Early Payment 🎉" : "On-time"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Paid at block {payment.paidAt?.toString()}{" "}
                          <Link href="#" className="text-blue-600">
                            View on Explorer ↗
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black">{payment.amount ? formatAmount(payment.amount) : "0"} USDC</p>
                      {payment.yieldEarned && Number(payment.yieldEarned) > 0 && (
                        <p className="text-xs text-success">+{formatAmount(payment.yieldEarned)} yield</p>
                      )}
                      <span className="text-xs text-success">✓ On-chain</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No payment history yet</p>
                  <p className="text-sm">Make your first rent payment to start building your reputation!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

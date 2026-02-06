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

  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const calculateDaysUntil = (dueDay: bigint | undefined) => {
    if (!dueDay) return "N/A";
    const today = new Date();
    const day = Number(dueDay);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get next occurrence of due day
    let nextDue = new Date(currentYear, currentMonth, day);
    if (nextDue < today) {
      nextDue = new Date(currentYear, currentMonth + 1, day);
    }
    
    const diffTime = nextDue.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `${diffDays} days away` : "Due today";
  };

  const getNextDueDate = (dueDay: bigint | undefined) => {
    if (!dueDay) return "N/A";
    const today = new Date();
    const day = Number(dueDay);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Get next occurrence of due day
    let nextDue = new Date(currentYear, currentMonth, day);
    if (nextDue < today) {
      nextDue = new Date(currentYear, currentMonth + 1, day);
    }
    
    return nextDue.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const calculateLeaseTerm = (startDate: bigint | undefined, endDate: bigint | undefined) => {
    if (!startDate) return "N/A";
    const start = new Date(Number(startDate) * 1000);
    const end = endDate && Number(endDate) > 0 ? new Date(Number(endDate) * 1000) : null;
    
    if (!end) return "Indefinite";
    
    const diffTime = end.getTime() - start.getTime();
    const diffMonths = Math.round(diffTime / (1000 * 60 * 60 * 24 * 30));
    return `${diffMonths} months`;
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
    <div className="min-h-screen bg-[#1a1a1a] px-8 py-8">
      <div className="w-full max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Tenant Dashboard</h1>
              <p className="text-sm text-gray-400">Manage your lease, pay rent, and track your reputation on-chain.</p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href="/create-lease/tenant" 
                className="btn btn-sm btn-outline btn-primary text-white hover:bg-primary hover:border-primary"
              >
                + Create New Lease
              </Link>
              {hasMultipleLeases && (
                <div className="text-right">
                  <div className="badge badge-lg badge-primary text-white font-bold">
                    📋 {leaseIds.length} Active Leases
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Property Selector - Dropdown */}
        {leaseIds && leaseIds.length > 0 && (
          <div className="mb-6 flex items-center gap-4">
            <label className="text-white font-semibold text-sm">Select Property:</label>
            <select
              className="select select-bordered select-sm bg-base-100 text-white font-bold"
              value={selectedLeaseIndex}
              onChange={e => setSelectedLeaseIndex(Number(e.target.value))}
            >
              {leaseIds.map((leaseId, index) => (
                <option key={leaseId.toString()} value={index}>
                  Lease #{leaseId.toString()}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Main Property Card */}
        <div className="card bg-white shadow-xl mb-6 rounded-2xl">
          <div className="card-body p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-black">Sunset Apartments, Unit 3B</h2>
                  <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                    lease.status === 0 
                      ? "bg-green-100 text-green-700" 
                      : lease.status === 1 
                      ? "bg-blue-100 text-blue-700" 
                      : "bg-red-100 text-red-700"
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${
                      lease.status === 0 
                        ? "bg-green-500" 
                        : lease.status === 1 
                        ? "bg-blue-500" 
                        : "bg-red-500"
                    }`}></span>
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
            <div className="grid grid-cols-4 gap-6 mt-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Monthly Rent</p>
                <p className="text-2xl font-bold text-black">{formatAmount(lease.monthlyRent)} USDC</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Next Due Date</p>
                <p className="text-2xl font-bold text-black">{getNextDueDate(lease.dueDay)}</p>
                <p className="text-xs text-gray-500">{calculateDaysUntil(lease.dueDay)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Lease Term</p>
                <p className="text-2xl font-bold text-black">{calculateLeaseTerm(lease.startDate, lease.endDate)}</p>
                <p className="text-xs text-gray-500">
                  {lease.endDate && Number(lease.endDate) > 0 ? `Until ${formatDate(lease.endDate)}` : "No end date"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Total Paid</p>
                <p className="text-2xl font-bold text-black">{formatAmount(lease.totalPaid)} USDC</p>
                <p className="text-xs text-green-600">{lease.paymentCount?.toString()} payments made</p>
              </div>
            </div>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Pay Rent Card */}
          <div className="card bg-white shadow-xl rounded-2xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-black">Pay Rent</h3>
                <div className="bg-purple-100 rounded-lg p-2">
                  <span className="text-xl">💵</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">Pay from any token, any chain</p>

              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Amount</p>
                <div className="bg-gray-50 rounded-lg p-4 mb-1">
                  <p className="text-2xl font-bold text-black">{formatAmount(lease.monthlyRent)} USDC</p>
                  <p className="text-xs text-gray-400">≈ ${formatAmount(lease.monthlyRent)}</p>
                </div>
              </div>

              {/* Payment Steps */}
              <div className="bg-purple-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 text-xs text-purple-700 mb-2">
                  <span className="text-purple-600">⚡</span>
                  <span className="font-semibold">LI.FI powered cross-chain payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-600">
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

              <Link 
                href={`/pay-rent?leaseId=${selectedLeaseId}`}
                className="btn w-full bg-purple-600 hover:bg-purple-700 border-none text-white rounded-lg"
              >
                Pay Rent Now →
              </Link>

              <p className="text-xs text-center text-gray-400 mt-3">Pay early to earn more yield 💰</p>
            </div>
          </div>

          {/* Active Rent Session Card */}
          <div className="card bg-white shadow-xl rounded-2xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-black">Active Rent Session</h3>
                <div className="bg-yellow-100 rounded-lg p-2">
                  <span className="text-xl">⚡</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">Disc-free instant payments</p>

              {/* Session Status */}
              <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-600">⚡</span>
                    <span className="font-semibold text-yellow-900 text-sm">
                      {lease.status === 0 ? "LEASE ACTIVE" : "LEASE INACTIVE"}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">On-chain</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600">Lease ID</span>
                  <span className="font-bold text-black">#{selectedLeaseId.toString()}</span>
                </div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600">Started</span>
                  <span className="font-bold text-black">{formatDate(lease.startDate)}</span>
                </div>
              </div>

              {/* Payment Progress */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600">Payment Progress</span>
                  <span className="font-bold text-black">{lease.paymentCount?.toString()} payments</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full"
                    style={{ 
                      width: `${lease.endDate && Number(lease.endDate) > 0 
                        ? Math.min((Number(lease.paymentCount || 0n) / 12) * 100, 100) 
                        : Math.min(Number(lease.paymentCount || 0n) * 8.33, 100)}%` 
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500">
                  {formatAmount(lease.totalPaid)} USDC total paid
                </p>
              </div>

              {/* Real-time Balance */}
              <div className="bg-green-50 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-green-600">�</span>
                  <span className="text-xs font-semibold text-green-900">Total Paid On-Chain</span>
                </div>
                <p className="text-lg font-bold text-green-900">{formatAmount(lease.totalPaid)} USDC</p>
              </div>

              <Link 
                href={`/lease/${selectedLeaseId.toString()}`}
                className="btn w-full bg-blue-500 hover:bg-blue-600 border-none text-white rounded-lg"
              >
                📋 View Full Lease Details
              </Link>
              <p className="text-xs text-center text-gray-400 mt-2">See complete lease terms and history</p>
            </div>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Yield & Vault Card */}
          <div className="card bg-white shadow-xl rounded-2xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-black">Yield & Vault</h3>
                <div className="bg-green-100 rounded-lg p-2">
                  <span className="text-xl">📈</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">Earn yield while rent is locked</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Deposited</p>
                  <p className="text-xl font-bold text-black">
                    {formatAmount(lease.totalPaid)}{" "}
                    USDC
                  </p>
                  <p className="text-xs text-gray-500">{lease.paymentCount?.toString()} payments locked</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Yield Earned</p>
                  <p className="text-xl font-bold text-green-600">+45 USDC</p>
                  <p className="text-xs text-green-600">3% APY</p>
                </div>
              </div>

              {/* Vault Over Time Chart */}
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Yield Over Time</p>
                <div className="flex items-end gap-1 h-32 bg-gray-50 rounded-lg p-3">
                  {["Jan", "Feb", "Mar", "Apr", "May"].map((month, i) => {
                    const heights = [40, 60, 85, 70, 55];
                    const isActive = i < Number(lease.paymentCount || 0n);
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className={`w-full rounded-t transition-all ${
                            isActive ? "bg-green-500" : "bg-green-200"
                          }`}
                          style={{ height: `${heights[i]}%` }}
                        ></div>
                        <p className="text-xs text-gray-400 mt-1">{month}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Daily Yield */}
              <div className="flex justify-between items-center mb-4">
                <div>
                  <p className="text-xs text-gray-500">Daily Yield</p>
                  <p className="text-sm font-bold text-green-600">+0.25 USDC</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Next Release</p>
                  <p className="text-sm font-bold text-black">
                    {lease.endDate && Number(lease.endDate) > 0 ? formatDate(lease.endDate) : "N/A"}
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <span className="font-bold">Note:</span> Yield feature powered by NomaVault will be activated soon. Your rent payments are securely held on-chain.
                </p>
              </div>
            </div>
          </div>

          {/* Reputation Score Card */}
          <div className="card bg-white shadow-xl rounded-2xl">
            <div className="card-body p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-black">Reputation Score</h3>
                <div className="bg-green-100 rounded-lg p-2">
                  <span className="text-xl">🏆</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mb-4">
                On-chain verified rental history • <span className="text-blue-600">On-chain</span>
              </p>

              {/* Score Display */}
              <div className="text-center mb-6">
                <p className="text-6xl font-bold text-blue-600 mb-2">{reputationScore}</p>
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
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">On-Time Payments</span>
                    <span className="font-bold text-green-600">{onTimePercentage.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${onTimePercentage}%` }}></div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{reputation?.totalPayments?.toString() || "0"} payments</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Payment History</span>
                    <span className="font-bold text-blue-600">{reputation?.totalPayments?.toString() || "0"} payments</span>
                  </div>
                  <div className="w-full bg-blue-500 rounded-full h-2"></div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">Account Age</span>
                    <span className="font-bold text-purple-600">
                      {lease.startDate ? Math.floor((Date.now() - Number(lease.startDate) * 1000) / (1000 * 60 * 60 * 24 * 30)) : 0} months
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: `${Math.min((lease.startDate ? Math.floor((Date.now() - Number(lease.startDate) * 1000) / (1000 * 60 * 60 * 24 * 30)) : 0) * 8.33, 100)}%` 
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-900">
                  <span className="font-bold">Note:</span> Your reputation is updated on-chain after each successful payment. Higher scores unlock better rates and rental opportunities.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History Card */}
        <div className="card bg-white shadow-xl rounded-2xl">
          <div className="card-body p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-black">Payment History</h3>
              <Link href="#" className="text-sm text-purple-600 font-semibold hover:text-purple-700">
                View All →
              </Link>
            </div>
            <p className="text-xs text-gray-500 mb-6">All transactions verified on-chain</p>

            {/* Payment Items */}
            <div className="space-y-3">
              {paymentHistory && paymentHistory.length > 0 ? (
                paymentHistory.map((payment: any, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="bg-green-100 rounded-full p-2.5">
                        <span className="text-green-600 text-lg">✓</span>
                      </div>
                      <div>
                        <p className="font-bold text-black text-sm">
                          {payment.paidDate 
                            ? new Date(Number(payment.paidDate) * 1000).toLocaleString("en-US", { month: "long", year: "numeric" }) 
                            : "Month"} Rent
                        </p>
                        <p className="text-xs text-gray-500">
                          Paid on {payment.paidDate ? formatDate(payment.paidDate) : "N/A"}
                          {payment.isEarly && " • 🎉 Early payment"}
                        </p>
                        <p className="text-xs text-gray-400">
                          Payment ID: #{payment.paymentId?.toString()}{" "}
                          <Link href="#" className="text-blue-600 hover:text-blue-700">
                            View on Explorer ↗
                          </Link>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black text-sm">{payment.amount ? formatAmount(payment.amount) : "0"} USDC</p>
                      {payment.yieldEarned && Number(payment.yieldEarned) > 0 && (
                        <p className="text-xs text-green-600">+{formatAmount(payment.yieldEarned)} USDC earned</p>
                      )}
                      <span className="text-xs text-green-600 flex items-center justify-end gap-1 mt-1">
                        <span>✓</span> On-chain
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p className="text-lg mb-2">No payment history yet</p>
                  <p className="text-sm">Make your first rent payment to start building your reputation!</p>
                  <Link href={`/pay-rent?leaseId=${selectedLeaseId}`} className="btn btn-primary btn-sm mt-4">
                    Make First Payment
                  </Link>
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

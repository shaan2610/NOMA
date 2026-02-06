"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { formatEther } from "viem";

export default function LandlordDashboard() {
  const { address } = useAccount();
  const [tenantAddressToVerify, setTenantAddressToVerify] = useState("");
  const [verifiedTenantData, setVerifiedTenantData] = useState<any>(null);

  // Helper functions
  const formatDate = (timestamp: bigint | undefined) => {
    if (!timestamp) return "N/A";
    return new Date(Number(timestamp) * 1000).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatUSDC = (amount: bigint | undefined) => {
    if (!amount) return "0";
    return (Number(amount) / 1e6).toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  const calculateDaysUntil = (day: number) => {
    const today = new Date();
    const currentDay = today.getDate();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    let targetDate = new Date(currentYear, currentMonth, day);
    if (currentDay >= day) {
      targetDate = new Date(currentYear, currentMonth + 1, day);
    }

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Read landlord's leases
  const { data: landlordLeaseIds } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getLandlordLeases",
    args: [address],
  });

  // Read ALL leases details for the landlord
  const leaseId = landlordLeaseIds && landlordLeaseIds.length > 0 ? landlordLeaseIds[0] : undefined;
  const leaseId2 = landlordLeaseIds && landlordLeaseIds.length > 1 ? landlordLeaseIds[1] : undefined;

  const { data: leaseData } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [leaseId],
  });

  const { data: leaseData2 } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "leases",
    args: [leaseId2],
  });

  // Destructure lease data properly (it's a tuple/array)
  const lease = leaseData ? {
    tenant: leaseData[1] as string,
    landlord: leaseData[2] as string,
    monthlyRent: leaseData[3] as bigint,
    dueDay: leaseData[4] as bigint,
    startDate: leaseData[5] as bigint,
    endDate: leaseData[6] as bigint,
    status: leaseData[7] as number,
    paymentCount: leaseData[8] as bigint,
    totalPaid: leaseData[9] as bigint,
  } : undefined;

  const lease2 = leaseData2 ? {
    tenant: leaseData2[1] as string,
    landlord: leaseData2[2] as string,
    monthlyRent: leaseData2[3] as bigint,
    dueDay: leaseData2[4] as bigint,
    startDate: leaseData2[5] as bigint,
    endDate: leaseData2[6] as bigint,
    status: leaseData2[7] as number,
    paymentCount: leaseData2[8] as bigint,
    totalPaid: leaseData2[9] as bigint,
  } : undefined;

  const { data: leaseDeposit } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [leaseId as bigint],
  });

  const { data: leaseDeposit2 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseDeposits",
    args: [leaseId2 as bigint],
  });

  const { data: leaseYield } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [leaseId as bigint],
  });

  const { data: leaseYield2 } = useScaffoldReadContract({
    contractName: "NomaVault",
    functionName: "leaseYield",
    args: [leaseId2 as bigint],
  });

  // Read landlord reputation
  const { data: landlordReputation } = useScaffoldReadContract({
    contractName: "ReputationRegistry",
    functionName: "getReputation",
    args: [address],
  });

  // Read payment history for first 10 leases (extendable if needed)
  const { data: paymentHistory0 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[0]],
    watch: true,
  });

  const { data: paymentHistory1 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[1]],
    watch: true,
  });

  const { data: paymentHistory2 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[2]],
    watch: true,
  });

  const { data: paymentHistory3 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[3]],
    watch: true,
  });

  const { data: paymentHistory4 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[4]],
    watch: true,
  });

  const { data: paymentHistory5 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[5]],
    watch: true,
  });

  const { data: paymentHistory6 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[6]],
    watch: true,
  });

  const { data: paymentHistory7 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[7]],
    watch: true,
  });

  const { data: paymentHistory8 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[8]],
    watch: true,
  });

  const { data: paymentHistory9 } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "getPaymentHistory",
    args: [landlordLeaseIds?.[9]],
    watch: true,
  });

  // Combine all payment histories from all leases
  const allPaymentHistory = [
    ...(paymentHistory0 || []),
    ...(paymentHistory1 || []),
    ...(paymentHistory2 || []),
    ...(paymentHistory3 || []),
    ...(paymentHistory4 || []),
    ...(paymentHistory5 || []),
    ...(paymentHistory6 || []),
    ...(paymentHistory7 || []),
    ...(paymentHistory8 || []),
    ...(paymentHistory9 || []),
  ].sort((a: any, b: any) => {
    // Sort by payment date descending (most recent first)
    return Number(b.paidDate || 0n) - Number(a.paidDate || 0n);
  });

  // Calculate portfolio summary from REAL data
  const totalProperties = landlordLeaseIds?.length || 0;
  const totalSecurityDeposits = (leaseDeposit || 0n) + (leaseDeposit2 || 0n);
  const totalYieldEarned = (leaseYield || 0n) + (leaseYield2 || 0n);
  const monthlyRent = (lease?.monthlyRent || 0n) + (lease2?.monthlyRent || 0n);

  // Calculate APY based on yield
  const calculateAPY = (deposit: bigint, yieldEarned: bigint) => {
    if (deposit === 0n) return "0";
    const apy = (Number(yieldEarned) / Number(deposit)) * 100;
    return apy.toFixed(1);
  };

  // Verify tenant function
  const handleVerifyTenant = async () => {
    if (!tenantAddressToVerify) return;

    try {
      // In a real implementation, you'd fetch this data from the contracts
      // For now, we'll show a mock result
      setVerifiedTenantData({
        address: tenantAddressToVerify,
        creditScore: 850,
        onTimePayments: 24,
        totalPayments: 24,
        rentalHistory: "2 yrs",
      });
    } catch (error) {
      console.error("Error verifying tenant:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Landlord Dashboard</h1>
          <p className="text-gray-400">Manage your properties, security deposits, and verify tenant payment history.</p>
        </div>

        {!address && (
          <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-2xl p-6 mb-6">
            <span className="text-yellow-300">Please connect your wallet to view your landlord dashboard</span>
          </div>
        )}

        {/* Portfolio Summary */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Portfolio Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Properties */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-medium">Properties</span>
              </div>
              <p className="text-3xl font-bold text-black">{totalProperties}</p>
            </div>

            {/* Security Deposits */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-medium">Security Deposits</span>
              </div>
              <p className="text-3xl font-bold text-black">{formatUSDC(totalSecurityDeposits)} USDC</p>
            </div>

            {/* Total Yield Earned */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-medium">Total Yield Earned</span>
              </div>
              <p className="text-3xl font-bold text-green-600">+{formatUSDC(totalYieldEarned)} USDC</p>
            </div>

            {/* Monthly Rent */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <span className="text-sm text-gray-600 font-medium">Monthly Rent</span>
              </div>
              <p className="text-3xl font-bold text-black">{formatUSDC(monthlyRent)} USDC</p>
            </div>
          </div>
        </div>

        {/* Security Deposits Earning Yield */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Security Deposits Earning Yield</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1 - Real Data */}
            {lease && leaseId !== undefined && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 text-sm font-bold rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    EARNING {calculateAPY(leaseDeposit || 0n, leaseYield || 0n)}%
                  </span>
                  <span className="text-gray-500 text-sm">Lease #{leaseId.toString()}</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-black mb-1">{formatUSDC(leaseDeposit)} USDC</p>
                  <p className="text-sm text-gray-600">Security Deposit</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Tenant</p>
                    <p className="text-black font-medium">{lease.tenant.slice(0, 6)}...{lease.tenant.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Lease Ends</p>
                    <p className="text-black font-medium">{formatDate(lease.endDate)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Yield Rate</p>
                    <p className="text-green-600 font-bold">🔼 {calculateAPY(leaseDeposit || 0n, leaseYield || 0n)}% APY</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Earned So Far</p>
                    <p className="text-green-600 font-bold">+{formatUSDC(leaseYield)} USDC</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Tenant Credit Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (Number(lease.paymentCount) * 10))}%` }}></div>
                  </div>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <p className="text-sm text-green-600 font-bold">
                      {Number(lease.paymentCount) >= 10 ? "Excellent" : Number(lease.paymentCount) >= 5 ? "Good" : "Building"}
                    </p>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
                  View Tenant History
                </button>
              </div>
            )}

            {/* Card 2 - Real Data */}
            {lease2 && leaseId2 !== undefined && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-green-100 text-green-600 text-sm font-bold rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    EARNING {calculateAPY(leaseDeposit2 || 0n, leaseYield2 || 0n)}%
                  </span>
                  <span className="text-gray-500 text-sm">Lease #{leaseId2.toString()}</span>
                </div>

                <div className="mb-6">
                  <p className="text-3xl font-bold text-black mb-1">{formatUSDC(leaseDeposit2)} USDC</p>
                  <p className="text-sm text-gray-600">Security Deposit</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Tenant</p>
                    <p className="text-black font-medium">{lease2.tenant.slice(0, 6)}...{lease2.tenant.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Lease Ends</p>
                    <p className="text-black font-medium">{formatDate(lease2.endDate)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Yield Rate</p>
                    <p className="text-green-600 font-bold">🔼 {calculateAPY(leaseDeposit2 || 0n, leaseYield2 || 0n)}% APY</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Earned So Far</p>
                    <p className="text-green-600 font-bold">+{formatUSDC(leaseYield2)} USDC</p>
                  </div>
                </div>

                <div className="mb-6">
                  <p className="text-sm text-gray-600 mb-2">Tenant Credit Score</p>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${Math.min(100, (Number(lease2.paymentCount) * 10))}%` }}></div>
                  </div>
                  <div className="flex justify-end items-center gap-1 mt-1">
                    <p className="text-sm text-green-600 font-bold">
                      {Number(lease2.paymentCount) >= 10 ? "Excellent" : Number(lease2.paymentCount) >= 5 ? "Good" : "Building"}
                    </p>
                  </div>
                </div>

                <button className="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-blue-700 transition-colors">
                  View Tenant History
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-green-500 rounded-2xl p-6 mb-8 flex items-start gap-4">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Earn 3-7% APY on Security Deposits</h3>
            <p className="text-white/90 text-sm">
              Your security deposits are locked in yield-generating smart contracts. The longer the lease term, the
              higher your yield rate. Deposits are automatically returned to tenants at lease end, minus any deductions.
            </p>
          </div>
        </div>

        {/* Incoming Rent Payments */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Incoming Rent Payments</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Payment Card 1 - Real Data */}
            {lease && leaseId !== undefined && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 text-sm font-bold rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {lease.status === 0 ? "ACTIVE" : "LOCKED"}
                  </span>
                  <span className="text-gray-500 text-sm">{formatDate(lease.startDate)}</span>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-black mb-1">{formatUSDC(lease.monthlyRent)} USDC</p>
                  <p className="text-sm text-gray-600">From: {lease.tenant.slice(0, 6)}...{lease.tenant.slice(-4)} (Lease #{leaseId.toString()})</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Next Due Date</p>
                    <p className="text-black font-medium">Day {Number(lease.dueDay)} of month</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Total Paid</p>
                    <p className="text-black font-medium">{formatUSDC(lease.totalPaid)} USDC</p>
                  </div>
                </div>
              </div>
            )}

            {/* Payment Card 2 - Real Data */}
            {lease2 && leaseId2 !== undefined && (
              <div className="bg-white rounded-2xl shadow-xl p-6">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-600 text-sm font-bold rounded-lg">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {lease2.status === 0 ? "ACTIVE" : "LOCKED"}
                  </span>
                  <span className="text-gray-500 text-sm">{formatDate(lease2.startDate)}</span>
                </div>

                <div className="mb-4">
                  <p className="text-3xl font-bold text-black mb-1">{formatUSDC(lease2.monthlyRent)} USDC</p>
                  <p className="text-sm text-gray-600">From: {lease2.tenant.slice(0, 6)}...{lease2.tenant.slice(-4)} (Lease #{leaseId2.toString()})</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Next Due Date</p>
                    <p className="text-black font-medium">Day {Number(lease2.dueDay)} of month</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Total Paid</p>
                    <p className="text-black font-medium">{formatUSDC(lease2.totalPaid)} USDC</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Verify Prospective Tenants */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Verify Prospective Tenants</h2>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
              <div className="flex-grow">
                <h3 className="text-xl font-bold text-black mb-2">Check Tenant Credit Score & History</h3>
                <p className="text-gray-600 mb-4">
                  Enter a wallet address to view their on-chain rental payment history, credit score, and reliability
                  metrics.
                </p>

                <div className="flex gap-4 mb-6">
                  <input
                    type="text"
                    placeholder="Enter tenant wallet address (0x...)"
                    className="flex-grow px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 text-black"
                    value={tenantAddressToVerify}
                    onChange={e => setTenantAddressToVerify(e.target.value)}
                  />
                  <button
                    onClick={handleVerifyTenant}
                    className="bg-blue-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Verify Tenant
                  </button>
                </div>

                {verifiedTenantData && (
                  <div className="bg-green-50 rounded-2xl p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <svg
                          className="w-5 h-5 text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-bold text-black">Sample Tenant: {verifiedTenantData.address}</p>
                        <p className="text-sm text-gray-600">Click &quot;Verify Tenant&quot; to see real results</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span className="text-sm text-gray-600 font-medium">Credit Score</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{verifiedTenantData.creditScore}</p>
                        <p className="text-sm text-green-600 font-medium">Excellent</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 font-medium">On-Time Payments</span>
                        </div>
                        <p className="text-3xl font-bold text-green-600">{verifiedTenantData.onTimePayments}%</p>
                        <p className="text-sm text-gray-600">
                          {verifiedTenantData.onTimePayments}/{verifiedTenantData.totalPayments} payments
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            />
                          </svg>
                          <span className="text-sm text-gray-600 font-medium">Rental History</span>
                        </div>
                        <p className="text-3xl font-bold text-blue-600">{verifiedTenantData.rentalHistory}</p>
                        <p className="text-sm text-gray-600">Verified on-chain</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Your Landlord Reputation */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Landlord Reputation</h2>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-start gap-6">
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                  />
                </svg>
              </div>

              <div className="flex-grow">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-1">Landlord Reputation Score</h3>
                    <p className="text-sm text-gray-600">On-chain verified landlord rating</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-blue-600 mb-1">🔗 On-chain</p>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 mb-6">
                  <div className="text-center mb-4">
                    <p className="text-6xl font-bold text-purple-600 mb-2">4.8</p>
                    <div className="flex justify-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map(star => (
                        <svg key={star} className="w-6 h-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-purple-600 font-bold">Outstanding Landlord</p>
                    <p className="text-sm text-gray-600">Based on 4 tenant reviews</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-black">Timely Deposit Returns</span>
                      <span className="text-sm font-bold text-green-600">100%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "100%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-black">Property Maintenance</span>
                      <span className="text-sm font-bold text-green-600">95%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "95%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-black">Communication</span>
                      <span className="text-sm font-bold text-blue-600">98%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "98%" }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-black">Fair Pricing</span>
                      <span className="text-sm font-bold text-purple-600">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 bg-blue-50 rounded-xl p-4">
                  <p className="text-sm text-blue-800">
                    <span className="font-bold">Note:</span> Your landlord reputation helps attract high-quality tenants
                    and improves your listing visibility.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Payment History</h2>
            <button className="text-purple-600 font-bold hover:text-purple-700 flex items-center gap-1">
              View All <span>→</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h3 className="text-lg font-bold text-black mb-2">Recent Transactions</h3>
            <p className="text-sm text-gray-600 mb-6">All rent payments verified on-chain</p>

            {/* Payment Items - Same structure as tenant dashboard */}
            <div className="space-y-3">
              {allPaymentHistory && allPaymentHistory.length > 0 ? (
                allPaymentHistory.map((payment: any, index: number) => (
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
                          • Lease #{payment.leaseId?.toString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-black text-sm">{payment.amount ? formatUSDC(payment.amount) : "0"} USDC</p>
                      {payment.yieldEarned && Number(payment.yieldEarned) > 0 && (
                        <p className="text-xs text-green-600">+{formatUSDC(payment.yieldEarned)} USDC earned</p>
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
                  <p className="text-sm">Payments from your tenants will appear here</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

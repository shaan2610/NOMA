"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowRightIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function PayRent() {
  const { address } = useAccount();
  const searchParams = useSearchParams();
  const leaseIdFromUrl = searchParams.get("leaseId");
  
  const [leaseId, setLeaseId] = useState("1");
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Set leaseId from URL parameter when component mounts
  useEffect(() => {
    if (leaseIdFromUrl) {
      setLeaseId(leaseIdFromUrl);
    }
  }, [leaseIdFromUrl]);

  // Read lease data
  const { data: lease } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getLease",
    args: [BigInt(leaseId || "0")],
  });

  // Get estimated yield
  const { data: estimatedYield } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "estimateEarlyPaymentYield",
    args: [BigInt(leaseId || "0")],
  });

  // Get NomaPayment contract info
  const { data: nomaPaymentContract } = useDeployedContractInfo("NomaPayment");
  const nomaPaymentAddress = nomaPaymentContract?.address;

  // Check current allowance
  const { data: allowance, refetch: refetchAllowance } = useScaffoldReadContract({
    contractName: "MockUSDC",
    functionName: "allowance",
    args: [address, nomaPaymentAddress],
  });

  // Check USDC balance
  const { data: usdcBalance, refetch: refetchBalance } = useScaffoldReadContract({
    contractName: "MockUSDC",
    functionName: "balanceOf",
    args: [address],
  });

  // Write: Approve USDC
  const { writeContractAsync: approveUSDC, isMining: isApproving } = useScaffoldWriteContract("MockUSDC");

  // Write: Pay rent
  const { writeContractAsync: payRent, isMining: isPaying } = useScaffoldWriteContract("NomaPayment");

  // Write: Get test USDC (using same hook as approve)
  const { writeContractAsync: getTestUSDC, isMining: isGettingUSDC } = useScaffoldWriteContract("MockUSDC");

  const handleGetTestUSDC = async () => {
    try {
      await getTestUSDC({
        functionName: "getFaucetDrip",
      });
      alert("Success! You received 1,000 test USDC");
      // Refetch balance after getting USDC
      setTimeout(() => refetchBalance(), 2000);
    } catch (e) {
      console.error("Error getting test USDC:", e);
      alert("Error getting test USDC. Check console for details.");
    }
  };

  const handleApprove = async () => {
    if (!lease || !nomaPaymentAddress) {
      alert("Please wait for lease data to load");
      return;
    }

    try {
      // Approve enough for multiple payments (12 months worth)
      // This way user doesn't need to approve every month
      const approvalAmount = lease.monthlyRent * 12n;

      console.log("Approving USDC:", {
        amount: approvalAmount.toString(),
        amountInUSDC: (Number(approvalAmount) / 1e6).toLocaleString(),
        monthlyRent: lease.monthlyRent.toString(),
        monthlyRentInUSDC: (Number(lease.monthlyRent) / 1e6).toLocaleString(),
      });

      await approveUSDC({
        functionName: "approve",
        args: [nomaPaymentAddress, approvalAmount],
      });
      alert(
        `USDC approval successful! Approved ${(Number(approvalAmount) / 1e6).toLocaleString()} USDC for rent payments.`,
      );
      // Refetch allowance after approval
      setTimeout(() => refetchAllowance(), 2000);
    } catch (e) {
      console.error("Error approving USDC:", e);
      alert("Error approving USDC. Check console for details.");
    }
  };

  const handlePayRent = async () => {
    if (!leaseId) {
      alert("Please enter a valid lease ID");
      return;
    }

    if (!lease) {
      alert("Lease data not loaded");
      return;
    }

    // Check if approval is sufficient for this payment
    const requiredAmount = lease.monthlyRent;
    if (!allowance || allowance < requiredAmount) {
      alert(
        `Insufficient allowance! Need ${(Number(requiredAmount) / 1e6).toLocaleString()} USDC approved. Current: ${(Number(allowance || 0n) / 1e6).toLocaleString()} USDC`,
      );
      return;
    }

    // Check if user has enough USDC balance
    if (!usdcBalance || usdcBalance < requiredAmount) {
      alert(
        `Insufficient USDC balance!\n\n` +
          `Required: ${(Number(requiredAmount) / 1e6).toLocaleString()} USDC\n` +
          `Your Balance: ${(Number(usdcBalance || 0n) / 1e6).toLocaleString()} USDC\n\n` +
          `Please get more USDC tokens to pay rent.`,
      );
      return;
    }

    console.log("Paying rent:", {
      leaseId,
      requiredAmount: requiredAmount.toString(),
      requiredAmountInUSDC: (Number(requiredAmount) / 1e6).toLocaleString(),
      currentAllowance: allowance.toString(),
      currentAllowanceInUSDC: (Number(allowance) / 1e6).toLocaleString(),
      usdcBalance: usdcBalance.toString(),
      usdcBalanceInUSDC: (Number(usdcBalance) / 1e6).toLocaleString(),
    });

    try {
      // Show modal with loading animation
      setShowModal(true);
      setShowSuccess(false);

      await payRent({
        functionName: "payRent",
        args: [BigInt(leaseId)],
      });
      
      // Payment successful - show success screen
      setShowSuccess(true);
      
      // Refetch allowance and balance after payment
      setTimeout(() => {
        refetchAllowance();
        refetchBalance();
      }, 2000);
    } catch (e) {
      console.error("Error paying rent:", e);
      alert("Error paying rent. Check console for details.");
      setShowModal(false);
      setShowSuccess(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setShowSuccess(false);
  };

  const needsApproval = !allowance || allowance < (lease?.monthlyRent || 0n);

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-base-300 px-8 py-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Pay Your Rent</h1>
          <p className="text-gray-300">
            Complete your monthly rent payment and earn rewards while building credit.
          </p>
        </div>

        {!address && (
          <div className="alert alert-warning mb-6">
            <span>Please connect your wallet to pay rent</span>
          </div>
        )}

        {/* How it works Card */}
        <div className="card bg-white shadow-xl mb-6">
          <div className="card-body p-8">
            <h2 className="text-xl font-bold text-center mb-8 text-black">How it works</h2>

            {/* Steps */}
            <div className="flex items-start justify-between gap-4 mb-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="bg-purple-100 rounded-full p-4 mb-3 relative">
                  <span className="text-2xl">💵</span>
                  <div className="absolute -top-2 -left-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-2 text-black">Deposit USDC</h3>
                <p className="text-xs text-gray-600">
                  Send your rent payment securely on-chain to the smart contract
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pt-8">
                <ArrowRightIcon className="w-6 h-6 text-gray-300" />
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="bg-blue-100 rounded-full p-4 mb-3 relative">
                  <span className="text-2xl">🔒</span>
                  <div className="absolute -top-2 -left-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-2 text-black">Funds Locked</h3>
                <p className="text-xs text-gray-600">
                  Payment locked until rental period ends, protecting both parties
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pt-8">
                <ArrowRightIcon className="w-6 h-6 text-gray-300" />
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="bg-green-100 rounded-full p-4 mb-3 relative">
                  <span className="text-2xl">📈</span>
                  <div className="absolute -top-2 -left-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-2 text-black">Earn Yield</h3>
                <p className="text-xs text-gray-600">
                  Earn yield while rent is locked. Pay early to earn more!
                </p>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pt-8">
                <ArrowRightIcon className="w-6 h-6 text-gray-300" />
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center text-center flex-1">
                <div className="bg-purple-100 rounded-full p-4 mb-3 relative">
                  <span className="text-2xl">📅</span>
                  <div className="absolute -top-2 -left-2 bg-purple-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
                    4
                  </div>
                </div>
                <h3 className="font-bold text-sm mb-2 text-black">Auto Release</h3>
                <p className="text-xs text-gray-600">
                  Landlord receives rent automatically on release date
                </p>
              </div>
            </div>

            {/* Pro Tip */}
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <p className="text-sm text-purple-900">
                <span className="font-bold">💡 Pro Tip:</span> Your payment builds credit score, creates
                verifiable rental history, and earns you passive income through yield rewards.
              </p>
            </div>
          </div>
        </div>

        {/* Lease Selection Card */}
        <div className="card bg-white shadow-xl mb-6">
          <div className="card-body p-8">
            <h2 className="text-xl font-bold mb-4 text-black">Select Your Lease</h2>
            
            {/* Lease ID Input */}
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-semibold text-black">Lease ID</span>
              </label>
              <div className="bg-purple-50 rounded-lg p-4">
                <input
                  type="number"
                  placeholder="Enter your lease ID"
                  value={leaseId}
                  onChange={e => setLeaseId(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none text-black font-semibold"
                />
              </div>
            </div>

            {/* Lease Info */}
            {lease && lease.tenant !== "0x0000000000000000000000000000000000000000" && (
              <div className="bg-purple-50 rounded-lg p-6 mt-4">
                <h3 className="text-lg font-bold mb-4 text-black">Lease #{leaseId} Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Landlord</p>
                    <p className="font-mono font-semibold text-black">{lease.landlord.slice(0, 6)}...{lease.landlord.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Tenant</p>
                    <p className="font-mono font-semibold text-black">{lease.tenant.slice(0, 6)}...{lease.tenant.slice(-4)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Monthly Rent</p>
                    <p className="font-bold text-black">{(Number(lease.monthlyRent) / 1e6).toLocaleString()} USDC</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Due Day</p>
                    <p className="font-bold text-black">Day {lease.dueDay?.toString()} of month</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Payments Made</p>
                    <p className="font-bold text-black">{lease.paymentCount?.toString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Status</p>
                    <p className={`font-bold ${lease.status === 0 ? "text-green-600" : "text-red-600"}`}>
                      {lease.status === 0 ? "Active" : lease.status === 1 ? "Completed" : "Terminated"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Start Date</p>
                    <p className="font-bold text-black">{formatDate(lease.startDate)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">End Date</p>
                    <p className="font-bold text-black">{formatDate(lease.endDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Allowance Status */}
            {lease && address && (
              <div className={`mt-4 p-4 rounded-lg ${needsApproval ? "bg-yellow-50 border border-yellow-200" : "bg-green-50 border border-green-200"}`}>
                <p className={`text-sm font-semibold ${needsApproval ? "text-yellow-900" : "text-green-900"}`}>
                  {needsApproval
                    ? "⚠️ USDC approval required before payment"
                    : `✅ Approved: ${(Number(allowance || 0n) / 1e6).toLocaleString()} USDC`}
                </p>
              </div>
            )}

            {/* USDC Balance Status */}
            {lease && address && usdcBalance !== undefined && (
              <div className={`mt-4 p-4 rounded-lg ${usdcBalance < lease.monthlyRent ? "bg-red-50 border border-red-200" : "bg-blue-50 border border-blue-200"}`}>
                <div className="flex justify-between items-center">
                  <div>
                    <p className={`text-sm font-semibold ${usdcBalance < lease.monthlyRent ? "text-red-900" : "text-blue-900"}`}>
                      💰 Your USDC Balance: {(Number(usdcBalance) / 1e6).toLocaleString()} USDC
                    </p>
                    {usdcBalance < lease.monthlyRent && (
                      <p className="text-xs text-red-800 mt-1">
                        ⚠️ Insufficient balance! Need {(Number(lease.monthlyRent) / 1e6).toLocaleString()} USDC to pay rent.
                      </p>
                    )}
                  </div>
                  {usdcBalance < lease.monthlyRent && (
                    <button className="btn btn-sm btn-warning" onClick={handleGetTestUSDC} disabled={isGettingUSDC}>
                      {isGettingUSDC ? (
                        <>
                          <span className="loading loading-spinner loading-xs"></span>
                          Getting...
                        </>
                      ) : (
                        "Get Test USDC"
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Yield Estimate */}
            {estimatedYield && estimatedYield > 0n && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-green-900 font-semibold">
                  📈 Pay early and earn {(Number(estimatedYield) / 1e6).toLocaleString()} USDC yield!
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 mt-6">
              {needsApproval && (
                <button
                  className="btn btn-secondary btn-lg"
                  onClick={handleApprove}
                  disabled={isApproving || !address || !lease}
                >
                  {isApproving ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Approving...
                    </>
                  ) : (
                    "1️⃣ Approve USDC"
                  )}
                </button>
              )}

              <button
                className="btn btn-lg bg-purple-600 hover:bg-purple-700 border-none text-white"
                onClick={handlePayRent}
                disabled={isPaying || !address || !leaseId || needsApproval}
              >
                {isPaying ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Processing...
                  </>
                ) : (
                  `${needsApproval ? "2️⃣" : ""} Pay Rent and Earn Yield`
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        {lease && lease.tenant !== "0x0000000000000000000000000000000000000000" && (
          <div className="card bg-white shadow-xl">
            <div className="card-body p-8">
              <h2 className="text-xl font-bold mb-6 text-black">Your Rent Summary</h2>

              {/* Summary Items */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Rent Amount</span>
                  <span className="font-bold text-black">{(Number(lease.monthlyRent) / 1e6).toLocaleString()} USDC</span>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Lease Period</span>
                  <span className="font-bold text-black">{formatDate(lease.startDate)} - {formatDate(lease.endDate)}</span>
                </div>

                <div className="divider my-2"></div>

                {estimatedYield && estimatedYield > 0n && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Projected Yield</span>
                      <span className="font-bold text-success">+{(Number(estimatedYield) / 1e6).toLocaleString()} USDC</span>
                    </div>
                    <div className="divider my-2"></div>
                  </>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Payments Made</span>
                  <span className="font-bold text-black">{lease.paymentCount?.toString()}</span>
                </div>

                <div className="divider my-2"></div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Due Day</span>
                  <span className="font-bold text-black">Day {lease.dueDay?.toString()} of month</span>
                </div>
              </div>

              {/* Info Box */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-6">
                <p className="text-sm text-green-900">
                  Your rent payment will be locked until the end of the period, earning you yield while
                  building your rental history.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-2xl bg-base-100">
            {!showSuccess ? (
              <>
                {/* Loading Spinner */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="w-24 h-24 border-8 border-blue-200 rounded-full"></div>
                    <div className="w-24 h-24 border-8 border-blue-600 rounded-full absolute top-0 left-0 animate-spin border-t-transparent"></div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-center mb-3">Processing your payment...</h3>
                <p className="text-center text-base-content/70 mb-8">
                  Your payment is being confirmed on-chain. This may take a few seconds.
                </p>

                {/* Simple Loading Message */}
                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 justify-center">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-blue-600 font-semibold">
                      Waiting for blockchain confirmation...
                    </span>
                  </div>
                </div>

                {/* Transaction Details */}
                {lease && (
                  <>
                    <div className="divider"></div>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-base-content/70">Rent Amount:</span>
                        <span className="font-bold">{(Number(lease.monthlyRent) / 1e6).toLocaleString()} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-base-content/70">Lease ID:</span>
                        <span className="font-bold">#{leaseId}</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            ) : (
              <>
                {/* Success Screen */}
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                  <div className="bg-success/20 rounded-full p-6">
                    <CheckCircleIcon className="w-16 h-16 text-success" />
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-center mb-3">
                  Rent Payment Successful! 🎉
                </h3>
                <p className="text-center text-base-content/70 mb-8">
                  Your rent has been locked and is now earning yield. Here's what this means for you:
                </p>

                {/* Benefits Cards */}
                <div className="space-y-4 mb-8">
                  {/* Building Credit Score */}
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="text-2xl">⭐</div>
                      <div>
                        <h4 className="font-bold text-purple-900 mb-1">Building Your Credit Score</h4>
                        <p className="text-sm text-purple-800">
                          This on-time payment is permanently recorded on-chain, strengthening your
                          creditworthiness for future rentals and loans.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reputation Boost */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="text-2xl">🏆</div>
                      <div>
                        <h4 className="font-bold text-blue-900 mb-1">Reputation Boost</h4>
                        <p className="text-sm text-blue-800">
                          Your verified payment history makes you a more attractive tenant, giving you better
                          options for future rentals.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Earning Yield */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex gap-3">
                      <div className="text-2xl">📈</div>
                      <div>
                        <h4 className="font-bold text-green-900 mb-1">Earning Yield</h4>
                        <p className="text-sm text-green-800">
                          {estimatedYield && estimatedYield > 0n ? (
                            <>You'll earn <span className="font-bold text-success">+{(Number(estimatedYield) / 1e6).toLocaleString()} USDC</span> on this payment. Pay early next time to maximize your earnings!</>
                          ) : (
                            <>You're earning yield on your rent payment while it's locked. Pay early to maximize earnings!</>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary */}
                {lease && (
                  <div className="bg-purple-50 rounded-lg p-4 mb-6">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rent Amount</span>
                        <span className="font-bold text-gray-900">{(Number(lease.monthlyRent) / 1e6).toLocaleString()} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Lock Period</span>
                        <span className="font-bold text-gray-900">31 days</span>
                      </div>
                      {estimatedYield && estimatedYield > 0n && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Expected Yield</span>
                          <span className="font-bold text-green-600">+{(Number(estimatedYield) / 1e6).toLocaleString()} USDC</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Button */}
                <Link href="/dashboard/tenant" className="btn btn-primary w-full text-lg mb-4">
                  View Your Dashboard →
                </Link>

                {/* Tip */}
                <p className="text-center text-xs text-base-content/60">
                  💡 Tip: Pay your rent early to maximize yield rewards and build stronger credit!
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

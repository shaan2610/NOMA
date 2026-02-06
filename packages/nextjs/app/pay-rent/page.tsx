"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function PayRent() {
  const { address } = useAccount();
  const [leaseId, setLeaseId] = useState("1");

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
      await payRent({
        functionName: "payRent",
        args: [BigInt(leaseId)],
      });
      alert("Rent payment successful!");
      // Refetch allowance and balance after payment
      setTimeout(() => {
        refetchAllowance();
        refetchBalance();
      }, 2000);
    } catch (e) {
      console.error("Error paying rent:", e);
      alert("Error paying rent. Check console for details.");
    }
  };

  const needsApproval = !allowance || allowance < (lease?.monthlyRent || 0n);

  return (
    <div className="flex flex-col gap-6 p-8 max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold">Pay Rent</h1>

      {!address && (
        <div className="alert alert-warning">
          <span>Please connect your wallet to pay rent</span>
        </div>
      )}

      {/* Lease ID Input */}
      <div className="form-control">
        <label className="label">
          <span className="label-text text-lg">Lease ID</span>
        </label>
        <input
          type="number"
          placeholder="Enter your lease ID"
          className="input input-bordered w-full"
          value={leaseId}
          onChange={e => setLeaseId(e.target.value)}
        />
      </div>

      {/* Lease Info */}
      {lease && lease.tenant !== "0x0000000000000000000000000000000000000000" && (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Lease #{leaseId}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-semibold">Landlord:</p>
                <p className="font-mono text-sm">{lease.landlord}</p>
              </div>
              <div>
                <p className="font-semibold">Tenant:</p>
                <p className="font-mono text-sm">{lease.tenant}</p>
              </div>
              <div>
                <p className="font-semibold">Monthly Rent:</p>
                <p>{(Number(lease.monthlyRent) / 1e6).toLocaleString()} USDC</p>
              </div>
              <div>
                <p className="font-semibold">Due Day:</p>
                <p>Day {lease.dueDay?.toString()} of month</p>
              </div>
              <div>
                <p className="font-semibold">Payments Made:</p>
                <p>{lease.paymentCount?.toString()}</p>
              </div>
              <div>
                <p className="font-semibold">Status:</p>
                <p className={lease.status === 0 ? "text-success" : "text-error"}>
                  {lease.status === 0 ? "Active" : lease.status === 1 ? "Completed" : "Terminated"}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Allowance Status */}
      {lease && address && (
        <div className={`alert ${needsApproval ? "alert-warning" : "alert-success"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>
            {needsApproval
              ? "⚠️ USDC approval required before payment"
              : `✅ Approved: ${(Number(allowance || 0n) / 1e6).toLocaleString()} USDC`}
          </span>
        </div>
      )}

      {/* USDC Balance Status */}
      {lease && address && usdcBalance !== undefined && (
        <div className={`alert ${usdcBalance < lease.monthlyRent ? "alert-error" : "alert-info"}`}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div className="flex flex-col gap-2 flex-1">
            <span className="font-semibold">
              💰 Your USDC Balance: {(Number(usdcBalance) / 1e6).toLocaleString()} USDC
            </span>
            {usdcBalance < lease.monthlyRent && (
              <span className="text-sm">
                ⚠️ Insufficient balance! Need {(Number(lease.monthlyRent) / 1e6).toLocaleString()} USDC to pay rent.
              </span>
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
                "Get 1,000 Test USDC"
              )}
            </button>
          )}
        </div>
      )}

      {/* Yield Estimate */}
      {estimatedYield && estimatedYield > 0n && (
        <div className="alert alert-success">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="stroke-current shrink-0 h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>📈 Pay early and earn {(Number(estimatedYield) / 1e6).toLocaleString()} USDC yield!</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col gap-3">
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
          className="btn btn-primary btn-lg"
          onClick={handlePayRent}
          disabled={isPaying || !address || !leaseId || needsApproval}
        >
          {isPaying ? (
            <>
              <span className="loading loading-spinner"></span>
              Processing...
            </>
          ) : (
            `${needsApproval ? "2️⃣" : ""} Pay Rent`
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="alert alert-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          className="stroke-current shrink-0 w-6 h-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <h3 className="font-bold">How it works:</h3>
          <div className="text-sm">
            1. Enter your lease ID
            <br />
            2. Click &quot;Approve USDC&quot; to allow the NomaPayment contract to spend your USDC
            <br />
            3. Click &quot;Pay Rent&quot; to submit the payment
            <br />
            4. Early payments earn yield and boost your reputation!
          </div>
        </div>
      </div>
    </div>
  );
}

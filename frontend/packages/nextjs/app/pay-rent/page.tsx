"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

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

  // Write: Pay rent
  const { writeContractAsync: payRent, isMining } = useScaffoldWriteContract("NomaPayment");

  const handlePayRent = async () => {
    if (!leaseId) {
      alert("Please enter a valid lease ID");
      return;
    }

    try {
      await payRent({
        functionName: "payRent",
        args: [BigInt(leaseId)],
      });
      alert("Rent payment successful!");
    } catch (e) {
      console.error("Error paying rent:", e);
      alert("Error paying rent. Check console for details.");
    }
  };

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
                <p>{lease.monthlyRent?.toString()} USDC</p>
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
                <p className={lease.status === 1 ? "text-success" : "text-error"}>
                  {lease.status === 1 ? "Active" : "Inactive"}
                </p>
              </div>
            </div>
          </div>
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
          <span>📈 Pay early and earn {estimatedYield.toString()} USDC yield!</span>
        </div>
      )}

      {/* Pay Button */}
      <button
        className="btn btn-primary btn-lg"
        onClick={handlePayRent}
        disabled={isMining || !address || !leaseId}
      >
        {isMining ? (
          <>
            <span className="loading loading-spinner"></span>
            Processing...
          </>
        ) : (
          "Pay Rent"
        )}
      </button>

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
            2. Make sure you have enough USDC and have approved the NomaPayment contract
            <br />
            3. Click "Pay Rent" to submit the payment
            <br />
            4. Early payments earn yield and boost your reputation!
          </div>
        </div>
      </div>
    </div>
  );
}

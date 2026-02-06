"use client";

import { useState } from "react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function CreateLeaseAsLandlord() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    tenant: "",
    monthlyRent: "",
    dueDay: "1",
  });

  // Write: Create lease as landlord
  const { writeContractAsync: createLease, isMining } = useScaffoldWriteContract("LeaseNFT");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenant || !formData.monthlyRent) {
      alert("Please fill all required fields");
      return;
    }

    try {
      // Convert USDC amount to proper format with 6 decimals
      const monthlyRentWithDecimals = BigInt(Math.floor(Number(formData.monthlyRent) * 1e6));

      await createLease({
        functionName: "createLeaseAsLandlord",
        args: [formData.tenant as `0x${string}`, monthlyRentWithDecimals, BigInt(formData.dueDay)],
      });
      alert("Lease created successfully!");
      // Reset form
      setFormData({
        tenant: "",
        monthlyRent: "",
        dueDay: "1",
      });
    } catch (e) {
      console.error("Error creating lease:", e);
      alert("Error creating lease. Check console for details.");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a] px-8 py-8">
      <div className="w-full max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Create New Lease (Landlord)</h1>
              <p className="text-sm text-gray-400">Set up a new lease agreement for your tenant</p>
            </div>
            <Link
              href="/"
              className="btn btn-sm btn-outline btn-primary text-white hover:bg-primary hover:border-primary"
            >
              ← Back to Home
            </Link>
          </div>

          {!address && (
            <div className="alert alert-warning rounded-2xl">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <span>Please connect your wallet to create a lease</span>
            </div>
          )}
        </div>

        {/* Main Form Card */}
        <div className="card bg-white shadow-xl rounded-2xl mb-6">
          <div className="card-body p-8">
            <h2 className="text-2xl font-bold text-black mb-6">Lease Details</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Tenant Address */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black font-semibold">Tenant Address *</span>
                </label>
                <input
                  type="text"
                  name="tenant"
                  placeholder="0x..."
                  className="input input-bordered w-full bg-gray-50 text-black border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                  value={formData.tenant}
                  onChange={handleChange}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">Enter your tenant&apos;s Ethereum wallet address</span>
                </label>
              </div>

              {/* Monthly Rent */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black font-semibold">Monthly Rent (USDC) *</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="monthlyRent"
                    placeholder="1500"
                    step="0.01"
                    min="0"
                    className="input input-bordered w-full bg-gray-50 text-black border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg pr-16"
                    value={formData.monthlyRent}
                    onChange={handleChange}
                    required
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                    USDC
                  </span>
                </div>
                <label className="label">
                  <span className="label-text-alt text-gray-500">
                    Set the monthly rent amount (e.g., 1500 for $1,500)
                  </span>
                </label>
              </div>

              {/* Due Day */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text text-black font-semibold">Due Day of Month *</span>
                </label>
                <input
                  type="number"
                  name="dueDay"
                  min="1"
                  max="28"
                  placeholder="1"
                  className="input input-bordered w-full bg-gray-50 text-black border-gray-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 rounded-lg"
                  value={formData.dueDay}
                  onChange={handleChange}
                  required
                />
                <label className="label">
                  <span className="label-text-alt text-gray-500">Day of the month rent is due (1-28)</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn w-full bg-purple-600 hover:bg-purple-700 border-none text-white rounded-lg h-14 text-lg"
                disabled={isMining || !address}
              >
                {isMining ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating Lease...
                  </>
                ) : (
                  "Create Lease 🎉"
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Instructions Card */}
        <div className="card bg-white shadow-xl rounded-2xl">
          <div className="card-body p-8">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 rounded-lg p-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  className="w-6 h-6 text-blue-600"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-black mb-3">How it works (Landlord)</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                      1
                    </span>
                    <p>Enter your tenant&apos;s Ethereum address</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                      2
                    </span>
                    <p>Set the monthly rent amount in USDC</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                      3
                    </span>
                    <p>Choose the day of the month rent is due (1-28)</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                      4
                    </span>
                    <p>Click &quot;Create Lease&quot; to mint the Lease NFT to your tenant</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold text-xs">
                      5
                    </span>
                    <p>The lease will be active immediately and stored on-chain</p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-purple-900">
                    <span className="font-bold">Note:</span> As a landlord, you are creating this lease for your tenant.
                    The Lease NFT will be minted to the tenant&apos;s address. Both you and your tenant will have
                    verifiable proof of the agreement on the blockchain.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

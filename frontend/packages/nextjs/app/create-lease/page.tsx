"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function CreateLease() {
  const { address } = useAccount();
  const [formData, setFormData] = useState({
    tenant: "",
    monthlyRent: "",
    dueDay: "1",
  });

  // Write: Create lease
  const { writeContractAsync: createLease, isMining } = useScaffoldWriteContract("LeaseNFT");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tenant || !formData.monthlyRent) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await createLease({
        functionName: "createLeaseAsLandlord",
        args: [
          formData.tenant as `0x${string}`,
          BigInt(formData.monthlyRent),
          BigInt(formData.dueDay),
        ],
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
    <div className="flex flex-col gap-6 p-8 max-w-3xl mx-auto">
      <h1 className="text-4xl font-bold">Create New Lease</h1>

      {!address && (
        <div className="alert alert-warning">
          <span>Please connect your wallet to create a lease</span>
        </div>
      )}

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Tenant Address */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Tenant Address *</span>
              </label>
              <input
                type="text"
                name="tenant"
                placeholder="0x..."
                className="input input-bordered w-full"
                value={formData.tenant}
                onChange={handleChange}
                required
              />
            </div>

            {/* Monthly Rent */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Monthly Rent (USDC) *</span>
              </label>
              <input
                type="number"
                name="monthlyRent"
                placeholder="1000"
                className="input input-bordered w-full"
                value={formData.monthlyRent}
                onChange={handleChange}
                required
              />
              <label className="label">
                <span className="label-text-alt">Amount in USDC (6 decimals)</span>
              </label>
            </div>

            {/* Due Day */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Due Day of Month *</span>
              </label>
              <input
                type="number"
                name="dueDay"
                min="1"
                max="28"
                placeholder="1"
                className="input input-bordered w-full"
                value={formData.dueDay}
                onChange={handleChange}
                required
              />
              <label className="label">
                <span className="label-text-alt">Day of the month rent is due (1-28)</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={isMining || !address}
            >
              {isMining ? (
                <>
                  <span className="loading loading-spinner"></span>
                  Creating Lease...
                </>
              ) : (
                "Create Lease"
              )}
            </button>
          </form>
        </div>
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
          <h3 className="font-bold">Landlord Instructions:</h3>
          <div className="text-sm">
            1. Enter the tenant's Ethereum address
            <br />
            2. Set the monthly rent amount in USDC
            <br />
            3. Choose the day of the month rent is due (1-28)
            <br />
            4. Click "Create Lease" to mint the Lease NFT
            <br />
            5. The lease will be active immediately
          </div>
        </div>
      </div>
    </div>
  );
}

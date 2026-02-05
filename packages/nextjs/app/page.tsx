"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { HomeIcon, DocumentPlusIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 text-center max-w-4xl">
          <h1 className="text-center mb-8">
            <span className="block text-6xl font-bold mb-4">🏠 NOMA</span>
            <span className="block text-2xl italic text-primary">
              "Turn rent into yield and reputation"
            </span>
          </h1>

          <div className="card bg-base-200 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title justify-center text-2xl">Core Promise</h2>
              <div className="text-lg font-mono">
                Pay rent → Earn yield → Build reputation → Unlock financial access
              </div>
            </div>
          </div>

          <p className="text-lg mb-4">
            {connectedAddress
              ? "Welcome! Choose an option below to get started:"
              : "Please connect your wallet to start using NOMA"}
          </p>
        </div>

        <div className="grow bg-base-300 w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-8 flex-col md:flex-row">
            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl hover:shadow-xl transition-shadow">
              <HomeIcon className="h-12 w-12 fill-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Dashboard</h3>
              <p className="mb-4">View your leases, reputation score, and payment history</p>
              <Link href="/dashboard" passHref className="btn btn-primary">
                Go to Dashboard
              </Link>
            </div>

            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl hover:shadow-xl transition-shadow">
              <DocumentPlusIcon className="h-12 w-12 fill-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Create Lease</h3>
              <p className="mb-4">Landlords: Create a new lease agreement as an NFT</p>
              <Link href="/create-lease" passHref className="btn btn-primary">
                Create Lease
              </Link>
            </div>

            <div className="flex flex-col bg-base-100 px-10 py-10 text-center items-center max-w-xs rounded-3xl hover:shadow-xl transition-shadow">
              <CurrencyDollarIcon className="h-12 w-12 fill-secondary mb-4" />
              <h3 className="text-xl font-bold mb-2">Pay Rent</h3>
              <p className="mb-4">Tenants: Pay your rent and earn yield for early payments</p>
              <Link href="/pay-rent" passHref className="btn btn-primary">
                Pay Rent
              </Link>
            </div>
          </div>

          <div className="mt-12 max-w-4xl mx-auto">
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
                <h3 className="font-bold">How NOMA Works:</h3>
                <p className="text-sm">
                  1. Landlords create leases as NFTs <br />
                  2. Tenants pay rent in any token (auto-converted to USDC via Circle) <br />
                  3. Payments are deposited to NomaVault and earn yield <br />
                  4. Early payments boost tenant reputation and earn extra yield <br />
                  5. Good reputation unlocks better financial opportunities
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

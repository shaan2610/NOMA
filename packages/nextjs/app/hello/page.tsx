"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();

  return (
    <>
      <div className="flex items-center justify-center min-h-screen bg-base-300 px-4">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-5xl font-bold text-white mb-4">
              {connectedAddress ? "Choose Your Role" : "Welcome to NOMA"}
            </h1>
            <p className="text-lg text-gray-300 mb-4">
              {connectedAddress
                ? "Welcome! Select how you'll use NOMA to get started"
                : "Please connect your wallet to start using NOMA"}
            </p>
          </div>

          {/* Role Cards - Only show if connected */}
          {connectedAddress && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Tenant Card */}
              <div className="card bg-white shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body p-8">
                  {/* Icon */}
                  <div className="flex gap-3 mb-6">
                    <div className="bg-purple-100 rounded-xl p-3 w-fit">
                      <span className="text-3xl">🏠</span>
                    </div>
                    <div className="bg-purple-100 rounded-xl p-3 w-fit">
                      <span className="text-3xl">🧑</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3 text-black">I&apos;m a Tenant</h2>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">
                    I pay rent and want to earn yield while building my credit score and rental reputation.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">●</span>
                      <span className="text-sm text-gray-700">Earn 3-7% yield on rent payments</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">●</span>
                      <span className="text-sm text-gray-700">Build verifiable credit score</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">●</span>
                      <span className="text-sm text-gray-700">Permanent payment history on-chain</span>
                    </li>
                  </ul>

                  {/* Button */}
                  <Link
                    href="/dashboard/tenant"
                    className="flex items-center justify-between text-purple-600 hover:text-purple-700 font-semibold transition-colors group"
                  >
                    <span>Continue as Tenant</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Landlord Card */}
              <div className="card bg-white shadow-xl hover:shadow-2xl transition-shadow">
                <div className="card-body p-8">
                  {/* Icon */}
                  <div className="flex gap-3 mb-6">
                    <div className="bg-blue-100 rounded-xl p-3 w-fit">
                      <span className="text-3xl">🏢</span>
                    </div>
                    <div className="bg-blue-100 rounded-xl p-3 w-fit">
                      <span className="text-3xl">🏛️</span>
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl font-bold mb-3 text-black">I&apos;m a Landlord</h2>

                  {/* Description */}
                  <p className="text-gray-600 mb-6">
                    I receive rent and want automated, secure, on-chain payments from my tenants.
                  </p>

                  {/* Features */}
                  <ul className="space-y-3 mb-6">
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">●</span>
                      <span className="text-sm text-gray-700">Automated rent collection</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">●</span>
                      <span className="text-sm text-gray-700">Earn 3-7% yield on security deposits</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">●</span>
                      <span className="text-sm text-gray-700">Verify tenant credit score & history</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-green-500 mt-1">●</span>
                      <span className="text-sm text-gray-700">Transparent payment tracking</span>
                    </li>
                  </ul>

                  {/* Button */}
                  <Link
                    href="/dasboard/landlord"
                    className="flex items-center justify-between text-blue-600 hover:text-blue-700 font-semibold transition-colors group"
                  >
                    <span>Continue as Landlord</span>
                    <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Footer Note */}
          {connectedAddress && (
            <div className="text-center">
              <p className="text-sm text-gray-400 flex items-center justify-center gap-2">
                <span>💡</span>
                You can manage multiple properties and roles from the same wallet
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;

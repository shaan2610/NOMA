"use client";

import { useAccount } from "wagmi";
import { useScaffoldEventHistory, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function Dashboard() {
  const { address } = useAccount();

  // Read tenant's leases
  const { data: leaseIds } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getTenantLeases",
    args: [address],
  });

  // Read reputation
  const { data: reputation } = useScaffoldReadContract({
    contractName: "ReputationRegistry",
    functionName: "getReputation",
    args: [address],
  });

  // Get payment history events
  const { data: paymentEvents } = useScaffoldEventHistory({
    contractName: "NomaPayment",
    eventName: "RentPaid",
    fromBlock: 0n,
    filters: { tenant: address },
  });

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold">Tenant Dashboard</h1>

      {!address && (
        <div className="alert alert-warning">
          <span>Please connect your wallet to view your dashboard</span>
        </div>
      )}

      {/* Reputation Card */}
      {reputation && (
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Reputation Score</div>
            <div className="stat-value text-primary">{reputation.score?.toString() || "0"}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Payments</div>
            <div className="stat-value">{reputation.totalPayments?.toString() || "0"}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Early Payments</div>
            <div className="stat-value text-success">{reputation.earlyPayments?.toString() || "0"}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Late Payments</div>
            <div className="stat-value text-error">{reputation.latePayments?.toString() || "0"}</div>
          </div>
        </div>
      )}

      {/* Leases */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Leases</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leaseIds && leaseIds.length > 0 ? (
            leaseIds.map(leaseId => (
              <div key={leaseId.toString()} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Lease #{leaseId.toString()}</h2>
                  <a href={`/lease/${leaseId.toString()}`} className="btn btn-primary">
                    View Details
                  </a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">No leases found</div>
          )}
        </div>
      </div>

      {/* Payment History */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Lease ID</th>
                <th>Amount (USDC)</th>
                <th>Early Payment</th>
                <th>Yield Earned (USDC)</th>
              </tr>
            </thead>
            <tbody>
              {paymentEvents && paymentEvents.length > 0 ? (
                paymentEvents.map((event, index) => (
                  <tr key={index}>
                    <td>{event.args.paymentId?.toString()}</td>
                    <td>{event.args.leaseId?.toString()}</td>
                    <td>{event.args.amount?.toString()}</td>
                    <td>{event.args.isEarly ? "✅" : "❌"}</td>
                    <td>{event.args.yieldEarned?.toString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center py-4 text-gray-500">
                    No payment history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

# 🏗️ NOMA + Scaffold-ETH 2 Migration Guide

This guide will help you integrate your deployed NOMA contracts with Scaffold-ETH 2 for a beautiful, functional frontend.

---

## 📋 Why Scaffold-ETH 2?

According to [Scaffold-ETH 2](https://scaffoldeth.io/), you get:

- ✅ **Pre-built Web3 Components**: Address display, balance viewers, transaction buttons
- ✅ **Custom Wagmi Hooks**: Auto-generated hooks for your contracts with TypeScript support
- ✅ **RainbowKit Integration**: Beautiful wallet connection UI
- ✅ **Next.js + TailwindCSS**: Modern, responsive design
- ✅ **Built-in Block Explorer**: Debug transactions easily
- ✅ **Hot Contract Reloading**: Frontend updates when you change contracts

Perfect for hackathon demos! 🏆

---

## 🚀 Step 1: Create Scaffold-ETH 2 App

Run this command and select **Hardhat** when prompted:

```bash
cd /Users/shaankumar/Projects/NOMA
npx create-eth@latest frontend
```

**Prompt answers:**
- Solidity framework: `hardhat`
- Install packages: `Yes`

This will create a new `frontend/` directory with the Scaffold-ETH 2 template.

---

## 📦 Step 2: Copy Your Contracts

After scaffold creation, copy your NOMA contracts:

```bash
# Remove default contracts
rm -rf frontend/packages/hardhat/contracts/*

# Copy your NOMA contracts
cp -r contracts/src/* frontend/packages/hardhat/contracts/

# Copy hardhat config
cp contracts/hardhat.config.js frontend/packages/hardhat/hardhat.config.js

# Copy deployment info
cp contracts/deployments/sepolia.json frontend/packages/hardhat/deployments/sepolia/
cp DEPLOYMENT.md frontend/
```

---

## 🔧 Step 3: Configure for Sepolia

Update `frontend/packages/hardhat/hardhat.config.ts` to include your Sepolia config:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  // Point to your deployed contracts
  namedAccounts: {
    deployer: {
      default: 0,
    },
  },
};

export default config;
```

---

## 📝 Step 4: Create Deployment File

Scaffold-ETH 2 needs deployment JSONs in a specific format.

Create `frontend/packages/hardhat/deployments/sepolia/NomaPayment.json`:

```json
{
  "address": "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4",
  "abi": [
    // Copy ABI from contracts/artifacts/src/NomaPayment.sol/NomaPayment.json
  ]
}
```

Repeat for all contracts: `LeaseNFT.json`, `NomaVault.json`, `ReputationRegistry.json`, `MockUSDC.json`

---

## 🎨 Step 5: Build Your UI Pages

Scaffold-ETH 2 auto-generates hooks for your contracts. Use them like this:

### Example: Pay Rent Page

Create `frontend/packages/nextjs/app/pay-rent/page.tsx`:

```tsx
"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";

export default function PayRent() {
  const { address } = useAccount();
  const [leaseId, setLeaseId] = useState("1");

  // Read lease data
  const { data: lease } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getLease",
    args: [BigInt(leaseId)],
  });

  // Get estimated yield
  const { data: estimatedYield } = useScaffoldReadContract({
    contractName: "NomaPayment",
    functionName: "estimateEarlyPaymentYield",
    args: [BigInt(leaseId)],
  });

  // Write: Pay rent
  const { writeContractAsync: payRent, isMining } = useScaffoldWriteContract("NomaPayment");

  const handlePayRent = async () => {
    try {
      await payRent({
        functionName: "payRent",
        args: [BigInt(leaseId)],
      });
    } catch (e) {
      console.error("Error paying rent:", e);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-4xl font-bold">Pay Rent</h1>
      
      {/* Lease Info */}
      {lease && (
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">Lease #{leaseId}</h2>
            <p>Landlord: <Address address={lease.landlord} /></p>
            <p>Monthly Rent: {lease.monthlyRent.toString()} USDC</p>
            <p>Due Day: {lease.dueDay.toString()}</p>
            <p>Payments Made: {lease.paymentCount.toString()}</p>
          </div>
        </div>
      )}

      {/* Yield Estimate */}
      {estimatedYield && (
        <div className="alert alert-success">
          📈 Pay early and earn {estimatedYield.toString()} USDC yield!
        </div>
      )}

      {/* Pay Button */}
      <button 
        className="btn btn-primary btn-lg"
        onClick={handlePayRent}
        disabled={isMining}
      >
        {isMining ? "Processing..." : "Pay Rent"}
      </button>
    </div>
  );
}
```

### Example: Dashboard Page

Create `frontend/packages/nextjs/app/dashboard/page.tsx`:

```tsx
"use client";

import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldReadContract, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

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
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-4xl font-bold">Tenant Dashboard</h1>

      {/* Reputation Card */}
      {reputation && (
        <div className="stats shadow">
          <div className="stat">
            <div className="stat-title">Reputation Score</div>
            <div className="stat-value text-primary">{reputation.score.toString()}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Total Payments</div>
            <div className="stat-value">{reputation.totalPayments.toString()}</div>
          </div>
          <div className="stat">
            <div className="stat-title">Early Payments</div>
            <div className="stat-value text-success">{reputation.earlyPayments.toString()}</div>
          </div>
        </div>
      )}

      {/* Leases */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {leaseIds?.map((leaseId) => (
          <div key={leaseId.toString()} className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title">Lease #{leaseId.toString()}</h2>
              <button className="btn btn-primary">View Details</button>
            </div>
          </div>
        ))}
      </div>

      {/* Payment History */}
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>Payment ID</th>
              <th>Amount</th>
              <th>Early</th>
              <th>Yield</th>
            </tr>
          </thead>
          <tbody>
            {paymentEvents?.map((event) => (
              <tr key={event.args.paymentId.toString()}>
                <td>{event.args.paymentId.toString()}</td>
                <td>{event.args.amount.toString()} USDC</td>
                <td>{event.args.isEarly ? "✅" : "❌"}</td>
                <td>{event.args.yieldEarned.toString()} USDC</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
```

---

## 🔔 Step 6: Listen to Events

Scaffold-ETH 2 makes event listening easy with `useScaffoldEventHistory`:

```tsx
import { useScaffoldEventHistory } from "~~/hooks/scaffold-eth";

// Listen for PaymentSettled events
const { data: settlements } = useScaffoldEventHistory({
  contractName: "NomaPayment",
  eventName: "PaymentSettled",
  fromBlock: 0n,
});

// Show notification when payment settles
useEffect(() => {
  if (settlements && settlements.length > 0) {
    const latest = settlements[settlements.length - 1];
    toast.success(`Paid & settled in USDC on ${latest.args.settlementChain}`);
  }
}, [settlements]);
```

---

## 🎯 Step 7: Configure Network

Update `frontend/packages/nextjs/scaffold.config.ts`:

```typescript
import { defineChain } from "viem";

// Add Sepolia
const scaffoldConfig = {
  targetNetworks: [chains.sepolia],
  
  // Your deployed contract addresses
  contracts: {
    NomaPayment: "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4",
    LeaseNFT: "0x8f0237b2076887988b796C6054A9a5a6Cf5cA058",
    NomaVault: "0xc8a37Bd0B65862e9e38F7568621e4349d84De007",
    ReputationRegistry: "0x54063F6114cCDD076f60a5AB3729a8C89B0264ad",
    MockUSDC: "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b",
  },
};

export default scaffoldConfig;
```

---

## 🚀 Step 8: Run Your dApp

```bash
cd frontend
yarn install
yarn start
```

This starts:
- Frontend at `http://localhost:3000`
- Hardhat node (if needed)

---

## 🎨 Key Scaffold-ETH 2 Components

Use these pre-built components from Scaffold-ETH:

```tsx
import { 
  Address,          // Display addresses with copy/scan
  Balance,          // Show token balances
  AddressInput,     // Input for addresses
  IntegerInput,     // Input for numbers
  EtherInput,       // Input for ETH amounts
} from "~~/components/scaffold-eth";

// Example
<Address address={landlordAddress} />
<Balance address={tenantAddress} />
```

---

## 📱 Example Navigation

Update `frontend/packages/nextjs/components/Header.tsx`:

```tsx
const menuLinks = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Create Lease", href: "/create-lease" },
  { label: "Pay Rent", href: "/pay-rent" },
  { label: "Reputation", href: "/reputation" },
  { label: "Debug Contracts", href: "/debug" },
];
```

---

## 🏆 Benefits for HackMoney Demo

With Scaffold-ETH 2, you get:

1. **Instant Web3 UI**: No need to build wallet connection from scratch
2. **Auto-generated Hooks**: TypeScript-safe contract interactions
3. **Event Listeners**: Real-time updates when rent is paid
4. **Debug Interface**: Test your contracts directly from the UI
5. **Block Explorer**: See transaction details during demo
6. **Mobile Responsive**: Works on phones/tablets

---

## 📚 Resources

- [Scaffold-ETH 2 Docs](https://docs.scaffoldeth.io/)
- [Scaffold-ETH 2 GitHub](https://github.com/scaffold-eth/scaffold-eth-2)
- [BuidlGuidl Community](https://buidlguidl.com/)
- [Example Extensions](https://github.com/scaffold-eth/scaffold-eth-2/tree/main/extensions)

---

## 🎯 Next Steps

1. Run `npx create-eth@latest frontend` (choose Hardhat)
2. Copy your contracts over
3. Generate deployment JSONs with ABIs
4. Build your UI pages using the examples above
5. Test with your Sepolia deployment
6. Demo at HackMoney! 🚀

---

This migration gives you a production-ready frontend in hours instead of days!

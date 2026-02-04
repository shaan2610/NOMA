# 🚀 Quick Start: NOMA with Scaffold-ETH 2

## 1️⃣ Create Scaffold-ETH 2 Frontend

Run this command (it will prompt you):

```bash
cd /Users/shaankumar/Projects/NOMA
npx create-eth@latest frontend
```

**Select:**
- Solidity framework: **hardhat**
- Install packages: **Yes**

⏱️ Takes ~2-3 minutes to install

---

## 2️⃣ Run Migration Script

After Scaffold-ETH 2 is created:

```bash
bash migrate-to-scaffold.sh
```

This copies your contracts and config to the frontend.

---

## 3️⃣ Generate Deployment Files

```bash
cd contracts
node scripts/generate-scaffold-deployments.js
```

This creates the deployment JSONs that Scaffold-ETH 2 needs.

---

## 4️⃣ Copy Deployment Files

```bash
cp -r contracts/deployments/sepolia frontend/packages/hardhat/deployments/
```

---

## 5️⃣ Start Your dApp

```bash
cd frontend
yarn start
```

This opens:
- Frontend: `http://localhost:3000`
- Hardhat: `http://localhost:8545`

---

## 🎯 What You Get

✅ **Auto-generated Hooks** for all your contracts:
```tsx
useScaffoldReadContract({ contractName: "LeaseNFT", functionName: "getLease" })
useScaffoldWriteContract("NomaPayment")
useScaffoldEventHistory({ contractName: "NomaPayment", eventName: "RentPaid" })
```

✅ **Pre-built Components**:
- Wallet connection (RainbowKit)
- Address display
- Balance viewers
- Transaction buttons

✅ **Debug Interface**:
- Test contracts from the UI
- See events in real-time
- Built-in block explorer

---

## 📱 Example: Create a Pay Rent Page

Create `frontend/packages/nextjs/app/pay-rent/page.tsx`:

```tsx
"use client";

import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

export default function PayRent() {
  const { writeContractAsync: payRent } = useScaffoldWriteContract("NomaPayment");
  
  const { data: lease } = useScaffoldReadContract({
    contractName: "LeaseNFT",
    functionName: "getLease",
    args: [1n], // Lease ID
  });

  return (
    <div>
      <h1>Pay Rent</h1>
      <p>Amount: {lease?.monthlyRent.toString()} USDC</p>
      <button onClick={() => payRent({ functionName: "payRent", args: [1n] })}>
        Pay Now
      </button>
    </div>
  );
}
```

That's it! Scaffold-ETH 2 handles:
- Wallet connection
- Transaction signing
- Error handling
- Loading states

---

## 📚 Full Guide

See `SCAFFOLD-MIGRATION.md` for:
- Complete page examples (Dashboard, Pay Rent, Reputation)
- Event listening
- Component usage
- Configuration

---

## 🏆 Ready for HackMoney!

Your NOMA Protocol now has:
- ✅ Smart contracts deployed on Sepolia
- ✅ Beautiful, functional frontend
- ✅ Auto-generated TypeScript hooks
- ✅ Real-time event updates
- ✅ Mobile-responsive design

Perfect for your demo! 🎉

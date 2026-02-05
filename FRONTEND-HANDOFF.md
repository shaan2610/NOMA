# 🎯 NOMA Protocol - Frontend Handoff Document

> **Status: ✅ READY FOR FRONTEND INTEGRATION**
> 
> All smart contracts are deployed, tested, and configured on Sepolia testnet.

---

## 📋 Quick Summary

| Item | Status |
|------|--------|
| Smart Contracts | ✅ 5 contracts deployed on Sepolia |
| Configuration | ✅ All contracts linked and configured |
| Tests | ✅ 21/21 tests passing |
| Events | ✅ All events defined for UI updates |
| Documentation | ✅ Complete with examples |
| ABIs | ✅ Generated in `contracts/artifacts/` |

---

## 🌐 Network: Sepolia Testnet

- **Chain ID:** `11155111`
- **RPC URL:** `https://ethereum-sepolia-rpc.publicnode.com`
- **Block Explorer:** https://sepolia.etherscan.io

---

## 📦 Contract Addresses

```javascript
const CONTRACTS = {
  MockUSDC: "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b",
  LeaseNFT: "0x8f0237b2076887988b796C6054A9a5a6Cf5cA058",
  NomaVault: "0xc8a37Bd0B65862e9e38F7568621e4349d84De007",
  ReputationRegistry: "0x54063F6114cCDD076f60a5AB3729a8C89B0264ad",
  NomaPayment: "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4",
};
```

**Etherscan Links:**
- [MockUSDC](https://sepolia.etherscan.io/address/0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b)
- [LeaseNFT](https://sepolia.etherscan.io/address/0x8f0237b2076887988b796C6054A9a5a6Cf5cA058)
- [NomaVault](https://sepolia.etherscan.io/address/0xc8a37Bd0B65862e9e38F7568621e4349d84De007)
- [ReputationRegistry](https://sepolia.etherscan.io/address/0x54063F6114cCDD076f60a5AB3729a8C89B0264ad)
- [NomaPayment](https://sepolia.etherscan.io/address/0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4)

---

## 📁 ABI Locations

```
contracts/artifacts/src/
├── LeaseNFT.sol/LeaseNFT.json
├── NomaPayment.sol/NomaPayment.json
├── NomaVault.sol/NomaVault.json
├── ReputationRegistry.sol/ReputationRegistry.json
└── mocks/MockUSDC.sol/MockUSDC.json
```

Each JSON file contains the `abi` array you need.

---

## 🔔 Events to Listen For

### 1. `RentPaid` (from NomaPayment)
**Trigger:** When tenant pays rent
```solidity
event RentPaid(
    uint256 indexed leaseId,
    uint256 indexed paymentId,
    address indexed tenant,
    uint256 amount,
    bool isEarly,
    uint256 yieldEarned
);
```
**UI Action:** Update payment history, show success message, display yield earned

### 2. `PaymentSettled` (from NomaPayment)
**Trigger:** When payment settles (same tx as RentPaid)
```solidity
event PaymentSettled(
    uint256 indexed paymentId,
    uint256 indexed leaseId,
    uint256 amount,
    string settlementChain  // Always "Arc"
);
```
**UI Action:** Show "Paid & settled in USDC on Arc" ✅

### 3. `ReputationUpdated` (from ReputationRegistry)
**Trigger:** When reputation changes after payment
```solidity
event ReputationUpdated(
    address indexed tenant,
    uint256 newScore,
    ReputationTier newTier  // 0=New, 1=Basic, 2=Trusted, 3=Premium
);
```
**UI Action:** Update reputation display, show tier badge

### 4. `LeaseCreated` (from LeaseNFT)
**Trigger:** When new lease is created
```solidity
event LeaseCreated(
    uint256 indexed leaseId,
    address indexed tenant,
    address indexed landlord,
    uint256 monthlyRent,
    uint256 dueDay
);
```
**UI Action:** Navigate to lease dashboard, show confirmation

---

## 📖 Key Read Functions

### LeaseNFT

```javascript
// Get lease details
const lease = await leaseNFT.getLease(leaseId);
// Returns: { leaseId, tenant, landlord, monthlyRent, dueDay, startDate, status, totalPaid, paymentCount }

// Get all leases for a tenant
const leaseIds = await leaseNFT.getTenantLeases(tenantAddress);
// Returns: uint256[] of lease IDs

// Get all leases for a landlord
const leaseIds = await leaseNFT.getLandlordLeases(landlordAddress);

// Check if lease is active
const isActive = await leaseNFT.isLeaseActive(leaseId);

// Check who owns the lease NFT
const owner = await leaseNFT.ownerOf(leaseId);
```

### NomaPayment

```javascript
// Get payment history for a lease
const payments = await nomaPayment.getPaymentHistory(leaseId);
// Returns: RentPayment[] with { paymentId, leaseId, amount, dueDate, paidDate, status, isEarly, yieldEarned }

// Check if rent is due
const [isDue, daysUntilDue] = await nomaPayment.checkRentDue(leaseId);
// daysUntilDue is negative if overdue

// Estimate yield for early payment
const estimatedYield = await nomaPayment.estimateEarlyPaymentYield(leaseId);
```

### ReputationRegistry

```javascript
// Get full reputation data
const reputation = await reputationRegistry.getReputation(tenantAddress);
// Returns: { tenant, totalPayments, onTimePayments, earlyPayments, latePayments, missedPayments, totalYieldEarned, tier, score }

// Get just the score (0-1000)
const score = await reputationRegistry.getScore(tenantAddress);

// Get tier (0=New, 1=Basic, 2=Trusted, 3=Premium)
const tier = await reputationRegistry.getTier(tenantAddress);

// Get tier as string
const tierName = await reputationRegistry.getTierName(tier);
// Returns: "New", "Basic", "Trusted", or "Premium"

// Check lending eligibility
const [eligible, reason] = await reputationRegistry.checkLendingEligibility(tenantAddress);

// Get progress to next tier
const [paymentsNeeded, nextTier] = await reputationRegistry.getNextTierProgress(tenantAddress);
```

### MockUSDC

```javascript
// Get balance
const balance = await mockUSDC.balanceOf(address);

// Get allowance
const allowance = await mockUSDC.allowance(owner, spender);

// Note: USDC has 6 decimals
// 1500 USDC = 1500000000 (1500 * 10^6)
```

---

## ✍️ Key Write Functions

### 1. Create Lease (Tenant)
```javascript
// First: Connect wallet
// Then:
const tx = await leaseNFT.createLeaseAsTenant(
  landlordAddress,              // Landlord wallet address
  ethers.parseUnits("1500", 6), // Monthly rent: 1500 USDC
  1                             // Due day: 1st of month (1-28)
);
await tx.wait();
// Emits: LeaseCreated
```

### 2. Create Lease (Landlord)
```javascript
const tx = await leaseNFT.createLeaseAsLandlord(
  tenantAddress,
  ethers.parseUnits("1500", 6),
  1
);
await tx.wait();
```

### 3. Pay Rent
```javascript
// Step 1: Approve USDC spending
const rentAmount = lease.monthlyRent;
await mockUSDC.approve(nomaPaymentAddress, rentAmount);

// Step 2: Pay rent
const tx = await nomaPayment.payRent(leaseId);
await tx.wait();
// Emits: RentPaid, PaymentSettled, ReputationUpdated
```

### 4. Get Test USDC
```javascript
// Get 1000 test USDC from faucet
await mockUSDC.getFaucetDrip();

// Or specify amount (max 10,000 USDC)
await mockUSDC.faucet(ethers.parseUnits("5000", 6));
```

---

## 🎨 UI Page Mapping

Based on the MVP flow, here are the pages to build:

| Page | Contracts Used | Key Functions |
|------|----------------|---------------|
| **Landing** | - | Connect wallet (RainbowKit/wagmi) |
| **Role Selection** | - | Store role in state |
| **Create Lease** | LeaseNFT | `createLeaseAsTenant()` or `createLeaseAsLandlord()` |
| **Lease Overview** | LeaseNFT | `getLease()`, `getTenantLeases()` |
| **Pay Rent** | NomaPayment, MockUSDC | `approve()`, `payRent()`, `estimateEarlyPaymentYield()` |
| **Payment Processing** | - | Show loading animation during tx |
| **Success State** | NomaPayment events | Listen for `RentPaid`, `PaymentSettled` |
| **Dashboard** | LeaseNFT, NomaPayment, Reputation | `getLease()`, `getPaymentHistory()`, `getReputation()` |
| **Landlord Dashboard** | LeaseNFT | `getLandlordLeases()`, `getLease()` |

---

## 💡 Implementation Tips

### 1. USDC Decimal Handling
```javascript
// USDC uses 6 decimals (not 18)
// Display: Format from wei
const displayAmount = ethers.formatUnits(amount, 6); // "1500.00"

// Input: Parse to wei
const weiAmount = ethers.parseUnits("1500", 6); // 1500000000n
```

### 2. Approval Flow
Always check allowance before paying:
```javascript
const allowance = await mockUSDC.allowance(userAddress, nomaPaymentAddress);
if (allowance < rentAmount) {
  await mockUSDC.approve(nomaPaymentAddress, rentAmount);
}
await nomaPayment.payRent(leaseId);
```

### 3. Reputation Tier Colors
```javascript
const TIER_COLORS = {
  0: "gray",    // New
  1: "blue",    // Basic
  2: "green",   // Trusted
  3: "gold",    // Premium
};
```

### 4. Payment Status
```javascript
const PAYMENT_STATUS = {
  0: "Pending",
  1: "Paid",
  2: "Late",
  3: "Missed",
};
```

### 5. Lease Status
```javascript
const LEASE_STATUS = {
  0: "Active",
  1: "Completed",
  2: "Terminated",
};
```

---

## 🔧 Development Helpers

### Get Test USDC
```bash
# From console
npx hardhat console --network sepolia
> const usdc = await ethers.getContractAt("MockUSDC", "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b")
> await usdc.getFaucetDrip()
```

### Verify Deployment
```bash
cd contracts
npx hardhat run scripts/verify-deployment.js --network sepolia
```

### Run Tests
```bash
cd contracts
npm run test
```

---

## 📚 Documentation Files

| File | Description |
|------|-------------|
| `DEPLOYMENT.md` | Full deployment details with all commands |
| `SCAFFOLD-MIGRATION.md` | Guide to set up Scaffold-ETH 2 frontend |
| `QUICKSTART.md` | 5-step quick start for Scaffold-ETH |
| `contracts/README.md` | Detailed contract documentation |
| `contracts/deployment-info.json` | Machine-readable contract addresses |

---

## ⚠️ Important Notes

1. **USDC is Mock** - Use `getFaucetDrip()` to get test tokens
2. **Due Date Calculation** - Simplified for MVP (30-day months)
3. **Yield is Mocked** - Returns demo values, not real DeFi yield
4. **Settlement Chain** - Always returns "Arc" for demo purposes
5. **Network** - Sepolia testnet only (Chain ID: 11155111)

---

## 🆘 Support

- **Smart Contract Issues:** Check `contracts/test/Noma.test.js` for examples
- **ABI Questions:** All ABIs in `contracts/artifacts/src/`
- **Event Debugging:** Use Sepolia Etherscan to view transaction logs

---

## ✅ Checklist for Frontend Team

- [ ] Set up wagmi/viem with Sepolia network
- [ ] Import contract addresses and ABIs
- [ ] Implement wallet connection (RainbowKit recommended)
- [ ] Build Create Lease page
- [ ] Build Pay Rent page with USDC approval
- [ ] Implement event listeners for real-time updates
- [ ] Build Dashboard with lease/reputation display
- [ ] Add "Settled in USDC on Arc" confirmation
- [ ] Test full flow end-to-end

---

**Good luck building the frontend! 🚀**

*The backend is fully ready for integration.*

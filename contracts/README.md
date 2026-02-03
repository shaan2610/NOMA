# 🏠 NOMA Protocol - Smart Contracts

> **"Turn rent into yield and reputation."**
> 
> Pay rent → Earn yield → Build reputation → Unlock financial access

NOMA is a decentralized protocol that transforms rent payments into productive assets. Built for HackMoney 2026.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Architecture](#-architecture)
- [Contract Details](#-contract-details)
- [Payment Flow](#-payment-flow)
- [Events for Frontend](#-events-for-frontend)
- [AI Agent Integration](#-ai-agent-integration)
- [Quick Start](#-quick-start)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Demo](#-demo)

---

## 🎯 Overview

### Core Promise

```
Tenant pays rent → Payment converts to USDC → USDC settles on Arc → 
Lease contract updates → UI shows "Paid & settled in USDC on Arc"
```

### Key Features

- **Lease NFTs**: On-chain representation of rental agreements
- **USDC Settlement**: All payments settle in USDC on Arc
- **Yield Generation**: Early payments earn yield
- **Reputation System**: Build on-chain credit history
- **AI Agent Ready**: Event triggers for automated actions

---

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NOMA PROTOCOL                                      │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FRONTEND (UI)                                │   │
│  │   • Tenant Dashboard    • Pay Rent Button    • Payment History       │   │
│  └──────────────────────────────┬──────────────────────────────────────┘   │
│                                 │                                            │
│                                 ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      SMART CONTRACTS (Arc)                           │   │
│  │                                                                      │   │
│  │   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │   │
│  │   │   LeaseNFT   │◄───│ NomaPayment  │───▶│  NomaVault   │         │   │
│  │   │              │    │   (Core)     │    │              │         │   │
│  │   │ • Lease data │    │ • Pay rent   │    │ • USDC pool  │         │   │
│  │   │ • NFT mint   │    │ • Events     │    │ • Yield      │         │   │
│  │   └──────────────┘    └──────┬───────┘    └──────────────┘         │   │
│  │                              │                                       │   │
│  │                              ▼                                       │   │
│  │                    ┌──────────────────┐                              │   │
│  │                    │  Reputation      │                              │   │
│  │                    │  Registry        │                              │   │
│  │                    │ • Score (0-1000) │                              │   │
│  │                    │ • Tier tracking  │                              │   │
│  │                    └──────────────────┘                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      CIRCLE INTEGRATION                              │   │
│  │   • Circle Wallets    • Circle Gateway    • USDC                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Contract Relationships

```
┌────────────────────────────────────────────────────────────────┐
│                    CONTRACT DEPENDENCY GRAPH                    │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│                         ┌─────────────┐                        │
│                         │    USDC     │                        │
│                         │  (ERC-20)   │                        │
│                         └──────┬──────┘                        │
│                                │                               │
│            ┌───────────────────┼───────────────────┐          │
│            │                   │                   │          │
│            ▼                   ▼                   ▼          │
│     ┌────────────┐     ┌─────────────┐     ┌────────────┐    │
│     │ NomaVault  │◄────│NomaPayment  │────▶│  LeaseNFT  │    │
│     │            │     │   (Hub)     │     │            │    │
│     └────────────┘     └──────┬──────┘     └────────────┘    │
│                               │                               │
│                               ▼                               │
│                    ┌──────────────────┐                       │
│                    │  Reputation      │                       │
│                    │  Registry        │                       │
│                    └──────────────────┘                       │
│                                                                │
│  Legend:                                                       │
│  ────▶  Calls/Depends on                                      │
│  ◄────  Receives calls from                                   │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 📜 Contract Details

### 1. LeaseNFT.sol

NFT representation of rental leases.

| Function | Description |
|----------|-------------|
| `createLeaseAsTenant()` | Tenant creates a new lease |
| `createLeaseAsLandlord()` | Landlord creates a new lease |
| `getLease()` | Get lease details |
| `getTenantLeases()` | Get all leases for a tenant |
| `terminateLease()` | End a lease early |

**Lease Data Structure:**
```solidity
struct Lease {
    uint256 leaseId;
    address tenant;
    address landlord;
    uint256 monthlyRent;    // In USDC (6 decimals)
    uint256 dueDay;         // 1-28
    uint256 startDate;
    LeaseStatus status;
    uint256 totalPaid;
    uint256 paymentCount;
}
```

### 2. NomaPayment.sol

Core payment processing hub.

| Function | Description |
|----------|-------------|
| `payRent()` | Pay full monthly rent |
| `payRentCustomAmount()` | Pay partial or advance |
| `getPaymentHistory()` | Get all payments for a lease |
| `checkRentDue()` | Check if rent is due |
| `estimateEarlyPaymentYield()` | Preview yield for early payment |

### 3. NomaVault.sol

USDC vault with yield generation.

| Function | Description |
|----------|-------------|
| `depositRent()` | Deposit rent payment |
| `withdrawToLandlord()` | Transfer to landlord |
| `estimateYield()` | Calculate potential yield |
| `getVaultStats()` | Get vault statistics |

**Yield Calculation:**
- Base yield: 0.5% for early payments
- Early bonus: +0.02% per day early
- Mock APY: 5% (configurable)

### 4. ReputationRegistry.sol

On-chain tenant reputation tracking.

| Function | Description |
|----------|-------------|
| `recordPayment()` | Record payment and update score |
| `getReputation()` | Get full reputation data |
| `getTier()` | Get reputation tier |
| `checkLendingEligibility()` | Check lending access |

**Reputation Tiers:**
```
┌─────────┬────────────┬─────────────────────────────┐
│  Tier   │ Payments   │ Requirements                │
├─────────┼────────────┼─────────────────────────────┤
│ New     │ 0-2        │ Starting tier               │
│ Basic   │ 3-5        │ Score ≥ 400                 │
│ Trusted │ 6-11       │ Score ≥ 550                 │
│ Premium │ 12+        │ Score ≥ 700                 │
└─────────┴────────────┴─────────────────────────────┘
```

**Score System:**
- Base score: 500
- On-time payment: +50
- Early payment: +75
- Late payment: -100
- Missed payment: -200
- Max score: 1000

---

## 💳 Payment Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        NOMA RENT PAYMENT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
    │ 1. PAY   │         │ 2. USDC  │         │ 3. ARC   │         │ 4. UPDATE│
    │   RENT   │────────▶│ CONVERT  │────────▶│ SETTLE   │────────▶│  STATUS  │
    │          │         │          │         │          │         │          │
    └──────────┘         └──────────┘         └──────────┘         └──────────┘
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
    ┌──────────┐         ┌──────────┐         ┌──────────┐         ┌──────────┐
    │ Tenant   │         │ Circle   │         │ NomaVault│         │ LeaseNFT │
    │ clicks   │         │ Gateway  │         │ deposits │         │ records  │
    │ "Pay"    │         │ handles  │         │ USDC     │         │ payment  │
    └──────────┘         └──────────┘         └──────────┘         └──────────┘
                                                                         │
                                                                         ▼
                              ┌─────────────────────────────────────────────┐
                              │          5. EMIT EVENTS                      │
                              │                                              │
                              │  • RentPaid(leaseId, amount, isEarly, yield)│
                              │  • PaymentSettled(paymentId, "Arc")          │
                              │  • ReputationUpdated(tenant, score, tier)    │
                              │  • AIAgentTrigger(type, data)                │
                              └─────────────────────────────────────────────┘
                                                   │
                                                   ▼
                              ┌─────────────────────────────────────────────┐
                              │          6. FRONTEND DISPLAYS                │
                              │                                              │
                              │  ✅ "Paid & settled in USDC on Arc"          │
                              │  📈 Yield earned: $X.XX                      │
                              │  ⭐ Reputation: Trusted (Score: 625)         │
                              └─────────────────────────────────────────────┘
```

### MVP Flow (Simplified)

```
1. Tenant pays rent (any chain/token)
         │
         ▼
2. Payment converts to USDC
         │
         ▼
3. USDC settles on Arc
         │
         ▼
4. Lease contract updates status
         │
         ▼
5. UI shows: "Paid & settled in USDC on Arc"
```

---

## 📡 Events for Frontend

### Key Events

```solidity
// When rent is paid - main event for UI
event RentPaid(
    uint256 indexed leaseId,
    uint256 indexed paymentId,
    address indexed tenant,
    uint256 amount,
    bool isEarly,
    uint256 yieldEarned
);

// Settlement confirmation - triggers "Settled on Arc" message
event PaymentSettled(
    uint256 indexed paymentId,
    uint256 indexed leaseId,
    uint256 amount,
    string settlementChain  // "Arc"
);

// Reputation update - for dashboard display
event ReputationUpdated(
    address indexed tenant,
    uint256 newScore,
    ReputationTier newTier
);

// Yield routing - for yield display
event YieldRouted(
    uint256 indexed leaseId,
    uint256 amount,
    string strategy
);
```

### Frontend Event Handling

```javascript
// Listen for payment events
nomaPayment.on("PaymentSettled", (paymentId, leaseId, amount, chain) => {
  // Show: "Paid & settled in USDC on Arc"
  showNotification(`Rent settled in USDC on ${chain}!`);
});

nomaPayment.on("RentPaid", (leaseId, paymentId, tenant, amount, isEarly, yield) => {
  // Update dashboard
  updatePaymentHistory(paymentId, amount);
  if (isEarly) {
    showYieldEarned(yield);
  }
});
```

---

## 🤖 AI Agent Integration

### Trigger Points

```solidity
event AIAgentTrigger(
    string indexed triggerType,
    uint256 indexed leaseId,
    bytes data
);
```

### Available Triggers

| Trigger Type | When Fired | Data Contains |
|--------------|------------|---------------|
| `NEW_LEASE` | Lease created | tenant, landlord, rentAmount |
| `PAYMENT_RECEIVED` | Rent paid | paymentId, amount, isEarly, yield |
| `YIELD_ROUTING` | Yield generated | amount, yieldEarned, strategy |
| `REPUTATION_MILESTONE` | Tier change | tenant, payments, score, tier |
| `MISSED_PAYMENT` | Payment missed | tenant, missedCount, score |
| `LEASE_TERMINATED` | Lease ended | tenant, totalPaid, paymentCount |
| `STRATEGY_UPDATE` | Strategy changed | strategy, apy |

### AI Agent Logic Points

```javascript
// Pseudo-code for AI agent integration
agent.on("PAYMENT_RECEIVED", async (data) => {
  const { leaseId, isEarly, yieldEarned } = decode(data);
  
  if (isEarly) {
    // Suggest optimal yield strategy
    await agent.optimizeYield(leaseId, yieldEarned);
  }
});

agent.on("REPUTATION_MILESTONE", async (data) => {
  const { tenant, tier } = decode(data);
  
  if (tier === "TRUSTED") {
    // Notify tenant of lending access
    await agent.notifyLendingAccess(tenant);
  }
});
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
cd contracts
npm install
```

### Environment Setup

Create `.env` file:

```bash
# Private key for deployment (without 0x prefix)
PRIVATE_KEY=your_private_key_here

# Arc Network
ARC_RPC_URL=https://rpc.arc.xyz
ARC_TESTNET_RPC_URL=https://testnet-rpc.arc.xyz
ARC_CHAIN_ID=1
ARC_TESTNET_CHAIN_ID=5

# Circle (optional for demo)
CIRCLE_API_KEY=your_circle_api_key
```

### Compile

```bash
npm run compile
```

### Test

```bash
npm run test
```

---

## 🌐 Deployment

### Local Development

```bash
# Start local node
npm run node

# Deploy to localhost
npm run deploy:local
```

### Arc Testnet

```bash
npm run deploy:arc-testnet
```

### Arc Mainnet

```bash
npm run deploy:arc
```

### Verify Contracts

After deployment, verify on block explorer:

```bash
npx hardhat verify --network arcTestnet <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>
```

---

## 🧪 Testing

### Run All Tests

```bash
npm run test
```

### Test Coverage

```bash
npx hardhat coverage
```

### Test Categories

1. **LeaseNFT Tests**
   - Lease creation (tenant & landlord)
   - NFT minting
   - Lease tracking

2. **NomaPayment Tests**
   - Rent payment processing
   - Event emission
   - Access control

3. **ReputationRegistry Tests**
   - Score calculation
   - Tier progression
   - Lending eligibility

4. **Integration Tests**
   - Full payment flow
   - AI agent triggers

---

## 🎬 Demo

### Run Demo Script

```bash
# Start local node first
npm run node

# In another terminal
npx hardhat run scripts/demo.js --network localhost
```

### Demo Flow

1. **Setup**: Deploy contracts, mint test USDC
2. **Create Lease**: Tenant creates lease with landlord
3. **Pay Rent**: Tenant pays rent (early)
4. **Verify**: Check lease update, yield earned, reputation
5. **Events**: Display all emitted events

### Expected Output

```
🎬 NOMA PROTOCOL DEMO
════════════════════════════════════════════════════════

📍 STEP 4: Tenant pays rent EARLY 🎉
   ✅ Rent paid!
   TxHash: 0x...
   
   📡 Events emitted:
      • RentPaid
        - Amount: 1500.0 USDC
        - Early: true
        - Yield: 7.5 USDC
      • PaymentSettled
        - Settlement Chain: Arc

🏁 DEMO COMPLETE
   ✅ Settled in USDC on Arc
   ✅ Yield earned for early payment
   ✅ Reputation updated
```

---

## 📦 Contract Addresses

### Testnet (Arc Testnet)

| Contract | Address |
|----------|---------|
| USDC | `TBD` |
| LeaseNFT | `TBD` |
| NomaVault | `TBD` |
| NomaPayment | `TBD` |
| ReputationRegistry | `TBD` |

### Mainnet (Arc)

| Contract | Address |
|----------|---------|
| USDC | `TBD` |
| LeaseNFT | `TBD` |
| NomaVault | `TBD` |
| NomaPayment | `TBD` |
| ReputationRegistry | `TBD` |

---

## 🔐 Security Considerations

- **Reentrancy Protection**: All payment functions use `nonReentrant`
- **Access Control**: Owner-only admin functions, payment contract authorization
- **Input Validation**: Due day (1-28), rent amount, addresses
- **Safe Transfers**: Using OpenZeppelin's `SafeERC20`

---

## 📄 License

MIT License - HackMoney 2026

---

## 🤝 Contributing

Built for HackMoney 2026 by the NOMA team.

---

<p align="center">
  <strong>NOMA</strong><br>
  <em>Make rent productive.</em>
</p>

# 🏠 NOMA

> **"Turn rent into yield and reputation."**

NOMA is a decentralized protocol that transforms rent payments into productive assets. Built for **HackMoney 2026**.

---

## 🎯 Core Promise

```
Pay rent → Earn yield → Build reputation → Unlock financial access
```

---

## 📋 MVP Flow

```
┌────────────┐    ┌────────────┐    ┌────────────┐    ┌────────────┐
│  1. PAY    │───▶│  2. USDC   │───▶│  3. ARC    │───▶│ 4. UPDATE  │
│   RENT     │    │  CONVERT   │    │  SETTLE    │    │   STATUS   │
└────────────┘    └────────────┘    └────────────┘    └────────────┘
     │                 │                 │                 │
     ▼                 ▼                 ▼                 ▼
  Tenant           Circle            NomaVault        LeaseNFT
  pays any         Gateway           deposits         records
  token            handles           USDC             payment
                                                          │
                                                          ▼
                              ┌────────────────────────────────────┐
                              │  UI: "Paid & settled in USDC on Arc" │
                              └────────────────────────────────────┘
```

---

## 🏗 Project Structure

```
NOMA/
├── contracts/                    # Smart contracts (Hardhat)
│   ├── src/
│   │   ├── LeaseNFT.sol         # Lease NFT representation
│   │   ├── NomaPayment.sol      # Payment processing hub
│   │   ├── NomaVault.sol        # USDC vault & yield
│   │   ├── ReputationRegistry.sol # Tenant reputation
│   │   ├── interfaces/          # Contract interfaces
│   │   └── mocks/               # Test mocks (USDC, Circle)
│   ├── scripts/
│   │   ├── deploy.js            # Deployment script
│   │   └── demo.js              # Demo flow script
│   ├── test/
│   │   └── Noma.test.js         # Contract tests
│   ├── hardhat.config.js
│   └── README.md                # Detailed contract docs
│
└── 🧠 NOMA_FINAL_MVP_USER_FLOW.txt  # User flow specification
```

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd contracts
npm install
```

### 2. Compile Contracts

```bash
npm run compile
```

### 3. Run Tests

```bash
npm run test
```

### 4. Deploy Locally

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy
npm run deploy:local
```

### 5. Run Demo

```bash
npx hardhat run scripts/demo.js --network localhost
```

---

## 📦 Smart Contracts

| Contract | Description |
|----------|-------------|
| **LeaseNFT** | NFT representation of rental leases |
| **NomaPayment** | Core payment processing hub |
| **NomaVault** | USDC deposits and yield generation |
| **ReputationRegistry** | On-chain tenant credit score |

See [`contracts/README.md`](./contracts/README.md) for detailed documentation.

---

## 🔑 Key Features

### For Tenants
- 💰 **Earn Yield**: Pay early, earn rewards
- ⭐ **Build Reputation**: On-chain credit history
- 🔓 **Unlock Access**: Reputation enables lending

### For Landlords
- ✅ **Guaranteed Payments**: Programmable cashflow
- 📊 **Transparency**: On-chain payment records
- 🤝 **Trust**: Tenant reputation visible

---

## 🏆 Hackathon Checkpoints

- [x] Define AI/agent trigger points (logic only)
- [x] Define on-chain events needed for demo
- [x] Define contract architecture (diagram)
- [x] Choose yield primitive (mock for MVP)
- [x] Write README (contracts + logic)
- [x] Implement rent payment contract
- [x] Implement yield routing logic (minimal)
- [x] Emit events for frontend display
- [x] Write minimal contract tests
- [x] **Deploy to Sepolia testnet** ✅
- [x] **Capture testnet addresses** ✅
- [x] **Contract configuration complete** ✅
- [ ] Support demo debugging
- [ ] Optional: Verify contracts on Etherscan

---

## 🌐 Networks

| Network | Status | Contracts |
|---------|--------|-----------|
| Local (Hardhat) | ✅ Ready | [Deploy locally](./contracts/README.md#deployment) |
| **Sepolia Testnet** | ✅ **DEPLOYED** | [View Addresses](#-sepolia-deployment) |
| Arc Testnet | 🔜 Pending | Coming soon |
| Arc Mainnet | 🔜 Pending | Coming soon |

---

## 🚀 Sepolia Deployment

**Deployed on:** February 4, 2026  
**Network:** Sepolia Testnet (Chain ID: 11155111)

| Contract | Address | Explorer |
|----------|---------|----------|
| MockUSDC | `0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b` | [View](https://sepolia.etherscan.io/address/0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b) |
| LeaseNFT | `0x8f0237b2076887988b796C6054A9a5a6Cf5cA058` | [View](https://sepolia.etherscan.io/address/0x8f0237b2076887988b796C6054A9a5a6Cf5cA058) |
| NomaVault | `0xc8a37Bd0B65862e9e38F7568621e4349d84De007` | [View](https://sepolia.etherscan.io/address/0xc8a37Bd0B65862e9e38F7568621e4349d84De007) |
| ReputationRegistry | `0x54063F6114cCDD076f60a5AB3729a8C89B0264ad` | [View](https://sepolia.etherscan.io/address/0x54063F6114cCDD076f60a5AB3729a8C89B0264ad) |
| NomaPayment | `0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4` | [View](https://sepolia.etherscan.io/address/0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4) |

See [DEPLOYMENT.md](./DEPLOYMENT.md) for full deployment details and usage guide.

---

## 📡 Key Events

```solidity
event RentPaid(leaseId, paymentId, tenant, amount, isEarly, yieldEarned);
event PaymentSettled(paymentId, leaseId, amount, "Arc");
event ReputationUpdated(tenant, newScore, newTier);
event AIAgentTrigger(triggerType, leaseId, data);
```

---

## 🤖 AI Agent Triggers

| Trigger | When |
|---------|------|
| `NEW_LEASE` | Lease created |
| `PAYMENT_RECEIVED` | Rent paid |
| `YIELD_ROUTING` | Yield generated |
| `REPUTATION_MILESTONE` | Tier change |
| `MISSED_PAYMENT` | Payment missed |

---

## 🔗 Circle Integration

- **Circle Wallets**: User wallet management
- **Circle Gateway**: Cross-chain USDC movement
- **USDC**: Settlement currency

---

## 📄 License

MIT License - HackMoney 2026

---

<p align="center">
  <strong>NOMA</strong><br>
  <em>Make rent productive.</em><br>
  <br>
  Built for HackMoney 2026 🏆
</p>

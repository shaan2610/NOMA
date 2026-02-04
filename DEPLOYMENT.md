# 🎉 NOMA Protocol - Sepolia Deployment Summary

**Network:** Sepolia Testnet  
**Chain ID:** 11155111  
**Deployer:** `0x8dD39Eb9b705dC2ba8A4112eB8D720F298F339fd`  
**Date:** February 4, 2026

---

## 📦 Deployed Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **MockUSDC** | `0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b` | [View](https://sepolia.etherscan.io/address/0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b) |
| **LeaseNFT** | `0x8f0237b2076887988b796C6054A9a5a6Cf5cA058` | [View](https://sepolia.etherscan.io/address/0x8f0237b2076887988b796C6054A9a5a6Cf5cA058) |
| **NomaVault** | `0xc8a37Bd0B65862e9e38F7568621e4349d84De007` | [View](https://sepolia.etherscan.io/address/0xc8a37Bd0B65862e9e38F7568621e4349d84De007) |
| **ReputationRegistry** | `0x54063F6114cCDD076f60a5AB3729a8C89B0264ad` | [View](https://sepolia.etherscan.io/address/0x54063F6114cCDD076f60a5AB3729a8C89B0264ad) |
| **NomaPayment** | `0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4` | [View](https://sepolia.etherscan.io/address/0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4) |

---

## ✅ Status

- [x] All contracts deployed
- [x] Contract relationships configured
- [x] Ready for frontend integration
- [ ] Contracts verified on Etherscan (optional)

---

## 🔗 Quick Links

**Sepolia Testnet:**
- Network RPC: `https://ethereum-sepolia-rpc.publicnode.com`
- Block Explorer: https://sepolia.etherscan.io
- Faucet: https://cloud.google.com/application/web3/faucet/ethereum/sepolia

---

## 🚀 Next Steps

### 1. Verify Contracts on Etherscan (Optional)

Get an Etherscan API key from https://etherscan.io/myapikey, then add to `.env`:
```
ETHERSCAN_API_KEY=your_key_here
```

Run verification:
```bash
npx hardhat verify --network sepolia 0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b
npx hardhat verify --network sepolia 0x8f0237b2076887988b796C6054A9a5a6Cf5cA058
npx hardhat verify --network sepolia 0xc8a37Bd0B65862e9e38F7568621e4349d84De007 0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b
npx hardhat verify --network sepolia 0x54063F6114cCDD076f60a5AB3729a8C89B0264ad
npx hardhat verify --network sepolia 0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4 0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b
```

### 2. Test the Contracts

Mint some test USDC:
```bash
npx hardhat console --network sepolia
```
```javascript
const usdc = await ethers.getContractAt("MockUSDC", "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b");
await usdc.getFaucetDrip(); // Get 1000 USDC
```

### 3. Integrate with Frontend

Use these addresses in your frontend `.env`:
```
NEXT_PUBLIC_LEASE_NFT_ADDRESS=0x8f0237b2076887988b796C6054A9a5a6Cf5cA058
NEXT_PUBLIC_NOMA_VAULT_ADDRESS=0xc8a37Bd0B65862e9e38F7568621e4349d84De007
NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS=0x54063F6114cCDD076f60a5AB3729a8C89B0264ad
NEXT_PUBLIC_NOMA_PAYMENT_ADDRESS=0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4
NEXT_PUBLIC_USDC_ADDRESS=0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b
```

---

## 📊 Contract Interactions

### Create a Lease
```javascript
const leaseNFT = await ethers.getContractAt("LeaseNFT", "0x8f0237b2076887988b796C6054A9a5a6Cf5cA058");
await leaseNFT.createLeaseAsTenant(
  landlordAddress,
  ethers.parseUnits("1500", 6), // 1500 USDC
  1 // Due on 1st of month
);
```

### Pay Rent
```javascript
const usdc = await ethers.getContractAt("MockUSDC", "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b");
const payment = await ethers.getContractAt("NomaPayment", "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4");

// Approve USDC
await usdc.approve(payment.address, ethers.parseUnits("1500", 6));

// Pay rent
await payment.payRent(leaseId);
```

### Check Reputation
```javascript
const reputation = await ethers.getContractAt("ReputationRegistry", "0x54063F6114cCDD076f60a5AB3729a8C89B0264ad");
const rep = await reputation.getReputation(tenantAddress);
console.log("Score:", rep.score.toString());
console.log("Tier:", rep.tier);
```

---

## 🎯 Key Events to Listen For

```javascript
// PaymentSettled - shows "Paid & settled in USDC on Arc"
nomaPayment.on("PaymentSettled", (paymentId, leaseId, amount, chain) => {
  console.log(`Payment settled in USDC on ${chain}`);
});

// RentPaid - update dashboard
nomaPayment.on("RentPaid", (leaseId, paymentId, tenant, amount, isEarly, yield) => {
  console.log(`Rent paid: ${ethers.formatUnits(amount, 6)} USDC`);
  if (isEarly) console.log(`Yield earned: ${ethers.formatUnits(yield, 6)} USDC`);
});

// ReputationUpdated - update reputation display
reputation.on("ReputationUpdated", (tenant, score, tier) => {
  console.log(`Reputation updated: Score ${score}, Tier ${tier}`);
});
```

---

## 🔐 Security Notes

- ✅ All contracts use OpenZeppelin's battle-tested libraries
- ✅ ReentrancyGuard on all payment functions
- ✅ Access control with Ownable
- ✅ SafeERC20 for token transfers
- ⚠️  MockUSDC has a public faucet (for testing only)
- ⚠️  Private key in `.env` - keep secure, never commit!

---

## 📝 Contract ABIs

ABIs are available in:
```
contracts/artifacts/src/LeaseNFT.sol/LeaseNFT.json
contracts/artifacts/src/NomaPayment.sol/NomaPayment.json
contracts/artifacts/src/NomaVault.sol/NomaVault.json
contracts/artifacts/src/ReputationRegistry.sol/ReputationRegistry.json
contracts/artifacts/src/mocks/MockUSDC.sol/MockUSDC.json
```

---

## 💡 Demo Flow

1. **Tenant** creates lease with monthly rent amount
2. **Lease NFT** minted to tenant's wallet
3. **Tenant** approves USDC spending
4. **Tenant** pays rent (early for yield bonus!)
5. **Payment** settles in USDC
6. **Reputation** score increases
7. **Events** emitted for frontend updates

---

## 🏆 HackMoney 2026

This deployment is ready for your HackMoney demo! 

**Features Demonstrated:**
- ✅ Rent payments in USDC
- ✅ On-chain lease representation (NFT)
- ✅ Yield for early payments
- ✅ Reputation building
- ✅ Event emission for UI updates
- ✅ AI agent trigger points

---

<p align="center">
  <strong>NOMA Protocol</strong><br>
  <em>Make rent productive.</em><br>
  <br>
  Deployed on Sepolia | HackMoney 2026 🏆
</p>

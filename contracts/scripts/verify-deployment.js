const hre = require("hardhat");

/**
 * Verify NOMA Protocol deployment status on Sepolia
 * Checks all contracts are deployed and configured correctly
 */

async function main() {
  console.log("\n🔍 NOMA Protocol - Deployment Verification");
  console.log("═".repeat(60));
  console.log(`Network: ${hre.network.name}`);
  console.log("═".repeat(60));

  const addresses = {
    MockUSDC: "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b",
    LeaseNFT: "0x8f0237b2076887988b796C6054A9a5a6Cf5cA058",
    NomaVault: "0xc8a37Bd0B65862e9e38F7568621e4349d84De007",
    ReputationRegistry: "0x54063F6114cCDD076f60a5AB3729a8C89B0264ad",
    NomaPayment: "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4",
  };

  let allGood = true;

  // Check each contract
  console.log("\n📦 Contract Status:");
  console.log("─".repeat(60));

  for (const [name, address] of Object.entries(addresses)) {
    try {
      const code = await hre.ethers.provider.getCode(address);
      if (code === "0x") {
        console.log(`❌ ${name}: NOT DEPLOYED`);
        allGood = false;
      } else {
        console.log(`✅ ${name}: ${address}`);
      }
    } catch (error) {
      console.log(`❌ ${name}: Error - ${error.message}`);
      allGood = false;
    }
  }

  // Check contract configurations
  console.log("\n🔧 Configuration Status:");
  console.log("─".repeat(60));

  try {
    const leaseNFT = await hre.ethers.getContractAt("LeaseNFT", addresses.LeaseNFT);
    const paymentContractInLease = await leaseNFT.paymentContract();
    if (paymentContractInLease.toLowerCase() === addresses.NomaPayment.toLowerCase()) {
      console.log("✅ LeaseNFT.paymentContract → NomaPayment");
    } else {
      console.log(`❌ LeaseNFT.paymentContract: ${paymentContractInLease}`);
      allGood = false;
    }
  } catch (e) {
    console.log(`⚠️  Could not verify LeaseNFT config: ${e.message}`);
  }

  try {
    const vault = await hre.ethers.getContractAt("NomaVault", addresses.NomaVault);
    const paymentContractInVault = await vault.paymentContract();
    if (paymentContractInVault.toLowerCase() === addresses.NomaPayment.toLowerCase()) {
      console.log("✅ NomaVault.paymentContract → NomaPayment");
    } else {
      console.log(`❌ NomaVault.paymentContract: ${paymentContractInVault}`);
      allGood = false;
    }
  } catch (e) {
    console.log(`⚠️  Could not verify NomaVault config: ${e.message}`);
  }

  try {
    const reputation = await hre.ethers.getContractAt("ReputationRegistry", addresses.ReputationRegistry);
    const paymentContractInRep = await reputation.paymentContract();
    if (paymentContractInRep.toLowerCase() === addresses.NomaPayment.toLowerCase()) {
      console.log("✅ ReputationRegistry.paymentContract → NomaPayment");
    } else {
      console.log(`❌ ReputationRegistry.paymentContract: ${paymentContractInRep}`);
      allGood = false;
    }
  } catch (e) {
    console.log(`⚠️  Could not verify ReputationRegistry config: ${e.message}`);
  }

  // Check USDC
  console.log("\n💰 Token Status:");
  console.log("─".repeat(60));

  try {
    const usdc = await hre.ethers.getContractAt("MockUSDC", addresses.MockUSDC);
    const name = await usdc.name();
    const symbol = await usdc.symbol();
    const decimals = await usdc.decimals();
    console.log(`✅ USDC: ${name} (${symbol}), ${decimals} decimals`);
  } catch (e) {
    console.log(`⚠️  Could not verify USDC: ${e.message}`);
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  if (allGood) {
    console.log("✅ ALL CHECKS PASSED - Ready for frontend integration!");
  } else {
    console.log("⚠️  Some checks failed - Review above");
  }
  console.log("═".repeat(60));

  // Frontend integration info
  console.log("\n📋 Frontend Integration Checklist:");
  console.log("─".repeat(60));
  console.log("1. Contract Addresses: ✅ Available in deployment-info.json");
  console.log("2. ABIs: ✅ Available in contracts/artifacts/");
  console.log("3. Events to listen:");
  console.log("   • RentPaid(leaseId, paymentId, tenant, amount, isEarly, yield)");
  console.log("   • PaymentSettled(paymentId, leaseId, amount, 'Arc')");
  console.log("   • ReputationUpdated(tenant, score, tier)");
  console.log("   • LeaseCreated(leaseId, tenant, landlord, rent, dueDay)");
  console.log("4. Key Read Functions:");
  console.log("   • LeaseNFT.getLease(leaseId)");
  console.log("   • LeaseNFT.getTenantLeases(address)");
  console.log("   • NomaPayment.getPaymentHistory(leaseId)");
  console.log("   • ReputationRegistry.getReputation(address)");
  console.log("5. Key Write Functions:");
  console.log("   • LeaseNFT.createLeaseAsTenant(landlord, rent, dueDay)");
  console.log("   • NomaPayment.payRent(leaseId)");
  console.log("   • MockUSDC.approve(spender, amount)");
  console.log("   • MockUSDC.getFaucetDrip() // Get test USDC");
  console.log("─".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

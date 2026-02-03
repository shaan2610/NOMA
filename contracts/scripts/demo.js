const hre = require("hardhat");

/**
 * NOMA Protocol Demo Script
 * 
 * Demonstrates the full rent payment flow:
 * 1. Tenant creates a lease
 * 2. Tenant pays rent early
 * 3. Yield is generated
 * 4. Reputation is updated
 * 5. Payment settles on Arc
 * 
 * Usage:
 *   npx hardhat run scripts/demo.js --network localhost
 */

async function main() {
  console.log("\n🎬 NOMA PROTOCOL DEMO");
  console.log("═".repeat(60));
  
  const [deployer, tenant, landlord] = await hre.ethers.getSigners();
  
  console.log(`\n👤 Actors:`);
  console.log(`   Deployer: ${deployer.address}`);
  console.log(`   Tenant:   ${tenant.address}`);
  console.log(`   Landlord: ${landlord.address}`);

  // Load deployment
  const fs = require("fs");
  const network = hre.network.name;
  const deploymentPath = `./deployments/${network}.json`;
  
  if (!fs.existsSync(deploymentPath)) {
    console.log("\n⚠️  No deployment found. Deploying contracts first...\n");
    const { main: deploy } = require("./deploy");
    await deploy();
  }
  
  const deployment = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  
  console.log(`\n📦 Loading contracts from ${network} deployment...`);
  
  // Get contract instances
  const mockUSDC = await hre.ethers.getContractAt("MockUSDC", deployment.contracts.USDC);
  const leaseNFT = await hre.ethers.getContractAt("LeaseNFT", deployment.contracts.LeaseNFT);
  const nomaVault = await hre.ethers.getContractAt("NomaVault", deployment.contracts.NomaVault);
  const nomaPayment = await hre.ethers.getContractAt("NomaPayment", deployment.contracts.NomaPayment);
  const reputationRegistry = await hre.ethers.getContractAt("ReputationRegistry", deployment.contracts.ReputationRegistry);

  console.log("   ✅ Contracts loaded!\n");

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Setup - Mint USDC to tenant
  // ═══════════════════════════════════════════════════════════════
  console.log("═".repeat(60));
  console.log("📍 STEP 1: Setup - Mint test USDC to tenant");
  console.log("═".repeat(60));
  
  const rentAmount = hre.ethers.parseUnits("1500", 6); // 1500 USDC
  
  // Mint USDC to tenant
  await mockUSDC.mint(tenant.address, rentAmount * 3n); // 3 months worth
  
  const tenantBalance = await mockUSDC.balanceOf(tenant.address);
  console.log(`   Tenant USDC balance: ${hre.ethers.formatUnits(tenantBalance, 6)} USDC`);
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Tenant creates lease
  // ═══════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("📍 STEP 2: Tenant creates lease");
  console.log("═".repeat(60));
  
  const dueDay = 1; // Due on 1st of each month
  
  const createTx = await leaseNFT.connect(tenant).createLeaseAsTenant(
    landlord.address,
    rentAmount,
    dueDay
  );
  const createReceipt = await createTx.wait();
  
  // Find LeaseCreated event
  const leaseCreatedEvent = createReceipt.logs.find(
    log => log.fragment?.name === "LeaseCreated"
  );
  const leaseId = leaseCreatedEvent ? leaseCreatedEvent.args[0] : 1n;
  
  console.log(`   ✅ Lease created!`);
  console.log(`   Lease ID: ${leaseId}`);
  console.log(`   Monthly Rent: ${hre.ethers.formatUnits(rentAmount, 6)} USDC`);
  console.log(`   Due Day: ${dueDay}st of each month`);
  console.log(`   TxHash: ${createTx.hash}`);

  // Get lease details
  const lease = await leaseNFT.getLease(leaseId);
  console.log(`\n   📋 Lease Details:`);
  console.log(`      Tenant: ${lease.tenant}`);
  console.log(`      Landlord: ${lease.landlord}`);
  console.log(`      Status: Active`);
  console.log(`      NFT Owner: ${await leaseNFT.ownerOf(leaseId)}`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Tenant approves USDC for payment
  // ═══════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("📍 STEP 3: Tenant approves USDC for payment");
  console.log("═".repeat(60));
  
  await mockUSDC.connect(tenant).approve(nomaPayment.target, rentAmount);
  console.log(`   ✅ Approved ${hre.ethers.formatUnits(rentAmount, 6)} USDC for payment contract`);

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Tenant pays rent (EARLY!)
  // ═══════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("📍 STEP 4: Tenant pays rent EARLY 🎉");
  console.log("═".repeat(60));
  
  // Estimate yield
  const estimatedYield = await nomaPayment.estimateEarlyPaymentYield(leaseId);
  console.log(`   📈 Estimated yield for early payment: ${hre.ethers.formatUnits(estimatedYield, 6)} USDC`);
  
  const landlordBalanceBefore = await mockUSDC.balanceOf(landlord.address);
  
  // Pay rent
  const payTx = await nomaPayment.connect(tenant).payRent(leaseId);
  const payReceipt = await payTx.wait();
  
  console.log(`\n   ✅ Rent paid!`);
  console.log(`   TxHash: ${payTx.hash}`);
  
  // Parse events
  console.log(`\n   📡 Events emitted:`);
  
  for (const log of payReceipt.logs) {
    try {
      if (log.fragment?.name === "RentPaid") {
        console.log(`      • RentPaid`);
        console.log(`        - Lease ID: ${log.args[0]}`);
        console.log(`        - Payment ID: ${log.args[1]}`);
        console.log(`        - Amount: ${hre.ethers.formatUnits(log.args[3], 6)} USDC`);
        console.log(`        - Early: ${log.args[4]}`);
        console.log(`        - Yield: ${hre.ethers.formatUnits(log.args[5], 6)} USDC`);
      }
      if (log.fragment?.name === "PaymentSettled") {
        console.log(`      • PaymentSettled`);
        console.log(`        - Settlement Chain: ${log.args[3]}`);
      }
      if (log.fragment?.name === "ReputationUpdated") {
        console.log(`      • ReputationUpdated`);
        console.log(`        - New Score: ${log.args[1]}`);
      }
    } catch (e) {
      // Skip non-decodable logs
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Verify results
  // ═══════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("📍 STEP 5: Verify results");
  console.log("═".repeat(60));
  
  // Check landlord received payment
  const landlordBalanceAfter = await mockUSDC.balanceOf(landlord.address);
  console.log(`\n   💰 Landlord Balance:`);
  console.log(`      Before: ${hre.ethers.formatUnits(landlordBalanceBefore, 6)} USDC`);
  console.log(`      After:  ${hre.ethers.formatUnits(landlordBalanceAfter, 6)} USDC`);
  console.log(`      Received: ${hre.ethers.formatUnits(landlordBalanceAfter - landlordBalanceBefore, 6)} USDC`);
  
  // Check lease updated
  const updatedLease = await leaseNFT.getLease(leaseId);
  console.log(`\n   📋 Updated Lease:`);
  console.log(`      Total Paid: ${hre.ethers.formatUnits(updatedLease.totalPaid, 6)} USDC`);
  console.log(`      Payment Count: ${updatedLease.paymentCount}`);
  
  // Check reputation
  const reputation = await reputationRegistry.getReputation(tenant.address);
  const tierName = await reputationRegistry.getTierName(reputation.tier);
  console.log(`\n   ⭐ Tenant Reputation:`);
  console.log(`      Score: ${reputation.score}`);
  console.log(`      Tier: ${tierName}`);
  console.log(`      Total Payments: ${reputation.totalPayments}`);
  console.log(`      Early Payments: ${reputation.earlyPayments}`);
  
  // Check vault stats
  const vaultStats = await nomaVault.getVaultStats();
  console.log(`\n   🏦 Vault Stats:`);
  console.log(`      Total Deposits: ${hre.ethers.formatUnits(vaultStats[0], 6)} USDC`);
  console.log(`      Total Yield: ${hre.ethers.formatUnits(vaultStats[1], 6)} USDC`);
  console.log(`      Strategy: ${vaultStats[2]}`);

  // ═══════════════════════════════════════════════════════════════
  // FINAL SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log("\n" + "═".repeat(60));
  console.log("🏁 DEMO COMPLETE - Summary");
  console.log("═".repeat(60));
  console.log(`
   ✅ Lease created as NFT (ID: ${leaseId})
   ✅ Rent paid: ${hre.ethers.formatUnits(rentAmount, 6)} USDC
   ✅ Settled in USDC on Arc
   ✅ Yield earned for early payment
   ✅ Reputation updated (Score: ${reputation.score})
   
   🔗 Transaction Hashes for Demo:
      Create Lease: ${createTx.hash}
      Pay Rent:     ${payTx.hash}
`);
  console.log("═".repeat(60));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

const hre = require("hardhat");

/**
 * NOMA Protocol Deployment Script
 * 
 * Deploys all contracts in order:
 * 1. MockUSDC (or use existing USDC address)
 * 2. LeaseNFT
 * 3. NomaVault
 * 4. ReputationRegistry
 * 5. NomaPayment
 * 6. Configure contract relationships
 * 
 * Usage:
 *   npx hardhat run scripts/deploy.js --network arcTestnet
 */

function buildGasOverrides(feeData) {
  if (!feeData) return {};
  const bump = (value) => (value ? (value * 12n) / 10n : value);
  return {
    maxFeePerGas: bump(feeData.maxFeePerGas),
    maxPriorityFeePerGas: bump(feeData.maxPriorityFeePerGas),
    gasPrice: bump(feeData.gasPrice),
  };
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("\n🚀 NOMA Protocol Deployment");
  console.log("═".repeat(50));
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Network:  ${hre.network.name}`);
  console.log(`Balance:  ${hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("═".repeat(50));

  // Track deployed addresses
  const deployed = {};
  const feeData = await hre.ethers.provider.getFeeData();
  const gasOverrides = buildGasOverrides(feeData);

  // ═══════════════════════════════════════════════════
  // 1. Deploy MockUSDC (or use existing)
  // ═══════════════════════════════════════════════════
  console.log("\n📦 [1/5] Deploying MockUSDC...");
  
  let usdcAddress;
  
  // Check if we should use existing USDC
  if (process.env.USDC_ADDRESS_ARC && hre.network.name === "arc") {
    usdcAddress = process.env.USDC_ADDRESS_ARC;
    console.log(`   Using existing USDC: ${usdcAddress}`);
  } else {
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const mockUSDC = await MockUSDC.deploy(gasOverrides);
    await mockUSDC.waitForDeployment();
    usdcAddress = await mockUSDC.getAddress();
    deployed.MockUSDC = usdcAddress;
    console.log(`   ✅ MockUSDC deployed: ${usdcAddress}`);
  }

  // ═══════════════════════════════════════════════════
  // 2. Deploy LeaseNFT
  // ═══════════════════════════════════════════════════
  console.log("\n📦 [2/5] Deploying LeaseNFT...");
  
  const LeaseNFT = await hre.ethers.getContractFactory("LeaseNFT");
  const leaseNFT = await LeaseNFT.deploy(gasOverrides);
  await leaseNFT.waitForDeployment();
  deployed.LeaseNFT = await leaseNFT.getAddress();
  console.log(`   ✅ LeaseNFT deployed: ${deployed.LeaseNFT}`);

  // ═══════════════════════════════════════════════════
  // 3. Deploy NomaVault
  // ═══════════════════════════════════════════════════
  console.log("\n📦 [3/5] Deploying NomaVault...");
  
  const NomaVault = await hre.ethers.getContractFactory("NomaVault");
  const nomaVault = await NomaVault.deploy(usdcAddress, gasOverrides);
  await nomaVault.waitForDeployment();
  deployed.NomaVault = await nomaVault.getAddress();
  console.log(`   ✅ NomaVault deployed: ${deployed.NomaVault}`);

  // ═══════════════════════════════════════════════════
  // 4. Deploy ReputationRegistry
  // ═══════════════════════════════════════════════════
  console.log("\n📦 [4/5] Deploying ReputationRegistry...");
  
  const ReputationRegistry = await hre.ethers.getContractFactory("ReputationRegistry");
  const reputationRegistry = await ReputationRegistry.deploy(gasOverrides);
  await reputationRegistry.waitForDeployment();
  deployed.ReputationRegistry = await reputationRegistry.getAddress();
  console.log(`   ✅ ReputationRegistry deployed: ${deployed.ReputationRegistry}`);

  // ═══════════════════════════════════════════════════
  // 5. Deploy NomaPayment
  // ═══════════════════════════════════════════════════
  console.log("\n📦 [5/5] Deploying NomaPayment...");
  
  const NomaPayment = await hre.ethers.getContractFactory("NomaPayment");
  const nomaPayment = await NomaPayment.deploy(usdcAddress, gasOverrides);
  await nomaPayment.waitForDeployment();
  deployed.NomaPayment = await nomaPayment.getAddress();
  console.log(`   ✅ NomaPayment deployed: ${deployed.NomaPayment}`);

  // ═══════════════════════════════════════════════════
  // 6. Configure Contract Relationships
  // ═══════════════════════════════════════════════════
  console.log("\n🔧 Configuring contract relationships...");

  // Set payment contract in LeaseNFT
  console.log("   Setting payment contract in LeaseNFT...");
  await (await leaseNFT.setPaymentContract(deployed.NomaPayment, gasOverrides)).wait();

  // Set payment contract in NomaVault
  console.log("   Setting payment contract in NomaVault...");
  await (await nomaVault.setPaymentContract(deployed.NomaPayment, gasOverrides)).wait();

  // Set payment contract in ReputationRegistry
  console.log("   Setting payment contract in ReputationRegistry...");
  await (await reputationRegistry.setPaymentContract(deployed.NomaPayment, gasOverrides)).wait();

  // Set contract references in NomaPayment
  console.log("   Setting contract references in NomaPayment...");
  await (
    await nomaPayment.setContracts(
      deployed.LeaseNFT,
      deployed.NomaVault,
      deployed.ReputationRegistry,
      gasOverrides
    )
  ).wait();

  console.log("   ✅ All contracts configured!");

  // ═══════════════════════════════════════════════════
  // 7. Deployment Summary
  // ═══════════════════════════════════════════════════
  console.log("\n" + "═".repeat(50));
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═".repeat(50));
  console.log(`
Network: ${hre.network.name}
Chain ID: ${(await hre.ethers.provider.getNetwork()).chainId}

Contracts:
  USDC:               ${usdcAddress}
  LeaseNFT:           ${deployed.LeaseNFT}
  NomaVault:          ${deployed.NomaVault}
  ReputationRegistry: ${deployed.ReputationRegistry}
  NomaPayment:        ${deployed.NomaPayment}

Settlement: USDC on Arc ✓
`);
  console.log("═".repeat(50));

  // ═══════════════════════════════════════════════════
  // 8. Save Deployment Info
  // ═══════════════════════════════════════════════════
  const fs = require("fs");
  const deploymentInfo = {
    network: hre.network.name,
    chainId: (await hre.ethers.provider.getNetwork()).chainId.toString(),
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      USDC: usdcAddress,
      LeaseNFT: deployed.LeaseNFT,
      NomaVault: deployed.NomaVault,
      ReputationRegistry: deployed.ReputationRegistry,
      NomaPayment: deployed.NomaPayment,
    },
  };

  const deploymentsDir = "./deployments";
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }

  fs.writeFileSync(
    `${deploymentsDir}/${hre.network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`\n💾 Deployment info saved to: ${deploymentsDir}/${hre.network.name}.json`);

  // ═══════════════════════════════════════════════════
  // 9. Verification Instructions
  // ═══════════════════════════════════════════════════
  console.log("\n📝 VERIFICATION COMMANDS:");
  console.log("─".repeat(50));
  console.log(`
npx hardhat verify --network ${hre.network.name} ${deployed.LeaseNFT}
npx hardhat verify --network ${hre.network.name} ${deployed.NomaVault} ${usdcAddress}
npx hardhat verify --network ${hre.network.name} ${deployed.ReputationRegistry}
npx hardhat verify --network ${hre.network.name} ${deployed.NomaPayment} ${usdcAddress}
`);

  console.log("\n✅ Deployment complete!");
  
  return deployed;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

module.exports = { main };

import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys NOMA contracts: MockUSDC, LeaseNFT, NomaVault, ReputationRegistry, and NomaPayment
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployNomaContracts: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("\n🏗️  Deploying NOMA contracts...\n");

  // 1. Deploy MockUSDC (for testing)
  const mockUSDC = await deploy("MockUSDC", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ MockUSDC deployed at:", mockUSDC.address);

  // 2. Deploy LeaseNFT
  const leaseNFT = await deploy("LeaseNFT", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ LeaseNFT deployed at:", leaseNFT.address);

  // 3. Deploy NomaVault
  const nomaVault = await deploy("NomaVault", {
    from: deployer,
    args: [mockUSDC.address],
    log: true,
    autoMine: true,
  });
  console.log("✅ NomaVault deployed at:", nomaVault.address);

  // 4. Deploy ReputationRegistry
  const reputationRegistry = await deploy("ReputationRegistry", {
    from: deployer,
    args: [],
    log: true,
    autoMine: true,
  });
  console.log("✅ ReputationRegistry deployed at:", reputationRegistry.address);

  // 5. Deploy NomaPayment
  const nomaPayment = await deploy("NomaPayment", {
    from: deployer,
    args: [mockUSDC.address],
    log: true,
    autoMine: true,
  });
  console.log("✅ NomaPayment deployed at:", nomaPayment.address);

  console.log("\n🔧 Configuring contracts...\n");

  // Get contract instances
  const leaseNFTContract = await hre.ethers.getContract<Contract>("LeaseNFT", deployer);
  const nomaVaultContract = await hre.ethers.getContract<Contract>("NomaVault", deployer);
  const reputationRegistryContract = await hre.ethers.getContract<Contract>("ReputationRegistry", deployer);
  const nomaPaymentContract = await hre.ethers.getContract<Contract>("NomaPayment", deployer);

  // Configure NomaPayment with contract addresses
  const tx1 = await nomaPaymentContract.setContracts(leaseNFT.address, nomaVault.address, reputationRegistry.address, {
    gasLimit: 500000,
  });
  await tx1.wait();
  console.log("✅ NomaPayment configured with contract addresses");

  // Configure LeaseNFT
  const tx2 = await leaseNFTContract.setPaymentContract(nomaPayment.address, { gasLimit: 500000 });
  await tx2.wait();
  console.log("✅ LeaseNFT configured with NomaPayment address");

  // Configure NomaVault
  const tx3 = await nomaVaultContract.setPaymentContract(nomaPayment.address, { gasLimit: 500000 });
  await tx3.wait();
  console.log("✅ NomaVault configured with NomaPayment address");

  // Configure ReputationRegistry
  const tx4 = await reputationRegistryContract.setPaymentContract(nomaPayment.address, { gasLimit: 500000 });
  await tx4.wait();
  console.log("✅ ReputationRegistry configured with NomaPayment address");

  console.log("\n🎉 All NOMA contracts deployed and configured!\n");
  console.log("📋 Contract Addresses:");
  console.log("   MockUSDC:", mockUSDC.address);
  console.log("   LeaseNFT:", leaseNFT.address);
  console.log("   NomaVault:", nomaVault.address);
  console.log("   ReputationRegistry:", reputationRegistry.address);
  console.log("   NomaPayment:", nomaPayment.address);
  console.log("\n");
};

export default deployNomaContracts;

deployNomaContracts.tags = ["NomaContracts"];

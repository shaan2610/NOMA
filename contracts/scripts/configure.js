const hre = require("hardhat");

function buildGasOverrides(feeData) {
  if (!feeData) return {};
  const bump = (value) => (value ? (value * 12n) / 10n : value);
  
  // Use EIP-1559 if available, otherwise use legacy gasPrice
  if (feeData.maxFeePerGas) {
    return {
      maxFeePerGas: bump(feeData.maxFeePerGas),
      maxPriorityFeePerGas: bump(feeData.maxPriorityFeePerGas),
    };
  } else {
    return {
      gasPrice: bump(feeData.gasPrice),
    };
  }
}

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name} in .env`);
  }
  return value;
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const feeData = await hre.ethers.provider.getFeeData();
  const gasOverrides = buildGasOverrides(feeData);

  console.log("\n🔧 NOMA Contract Configuration");
  console.log("═".repeat(50));
  console.log(`Network:  ${hre.network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log("═".repeat(50));

  const leaseNFTAddress = requireEnv("LEASE_NFT_ADDRESS");
  const nomaVaultAddress = requireEnv("NOMA_VAULT_ADDRESS");
  const reputationAddress = requireEnv("REPUTATION_REGISTRY_ADDRESS");
  const paymentAddress = requireEnv("NOMA_PAYMENT_ADDRESS");

  const leaseNFT = await hre.ethers.getContractAt("LeaseNFT", leaseNFTAddress);
  const nomaVault = await hre.ethers.getContractAt("NomaVault", nomaVaultAddress);
  const reputation = await hre.ethers.getContractAt(
    "ReputationRegistry",
    reputationAddress
  );
  const nomaPayment = await hre.ethers.getContractAt(
    "NomaPayment",
    paymentAddress
  );

  console.log("\n1) Set payment contract on LeaseNFT...");
  await (await leaseNFT.setPaymentContract(paymentAddress, gasOverrides)).wait();

  console.log("2) Set payment contract on NomaVault...");
  await (await nomaVault.setPaymentContract(paymentAddress, gasOverrides)).wait();

  console.log("3) Set payment contract on ReputationRegistry...");
  await (await reputation.setPaymentContract(paymentAddress, gasOverrides)).wait();

  console.log("4) Set contract references on NomaPayment...");
  await (
    await nomaPayment.setContracts(
      leaseNFTAddress,
      nomaVaultAddress,
      reputationAddress,
      gasOverrides
    )
  ).wait();

  console.log("\n✅ Configuration complete!");
  console.log("═".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

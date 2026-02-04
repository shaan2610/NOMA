const hre = require("hardhat");

/**
 * Verify all NOMA contracts on Etherscan
 * 
 * Prerequisites:
 * 1. Add ETHERSCAN_API_KEY to .env
 * 2. Wait ~30 seconds after deployment for contracts to propagate
 * 
 * Usage:
 *   npx hardhat run scripts/verify-all.js --network sepolia
 */

async function verify(address, constructorArgs = []) {
  console.log(`\nVerifying ${address}...`);
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: constructorArgs,
    });
    console.log(`✅ Verified: ${address}`);
  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log(`✅ Already verified: ${address}`);
    } else {
      console.log(`❌ Error verifying ${address}:`);
      console.log(error.message);
    }
  }
}

async function main() {
  const usdcAddress = process.env.MOCK_USDC_ADDRESS || "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b";
  const leaseNFTAddress = process.env.LEASE_NFT_ADDRESS || "0x8f0237b2076887988b796C6054A9a5a6Cf5cA058";
  const vaultAddress = process.env.NOMA_VAULT_ADDRESS || "0xc8a37Bd0B65862e9e38F7568621e4349d84De007";
  const reputationAddress = process.env.REPUTATION_REGISTRY_ADDRESS || "0x54063F6114cCDD076f60a5AB3729a8C89B0264ad";
  const paymentAddress = process.env.NOMA_PAYMENT_ADDRESS || "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4";

  console.log("\n🔍 NOMA Contract Verification");
  console.log("═".repeat(50));
  console.log(`Network: ${hre.network.name}`);
  console.log("═".repeat(50));

  // 1. MockUSDC (no constructor args)
  await verify(usdcAddress);

  // 2. LeaseNFT (no constructor args)
  await verify(leaseNFTAddress);

  // 3. NomaVault (USDC address)
  await verify(vaultAddress, [usdcAddress]);

  // 4. ReputationRegistry (no constructor args)
  await verify(reputationAddress);

  // 5. NomaPayment (USDC address)
  await verify(paymentAddress, [usdcAddress]);

  console.log("\n" + "═".repeat(50));
  console.log("✅ Verification complete!");
  console.log("═".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

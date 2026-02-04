const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  
  console.log("\n📊 Wallet Status Check");
  console.log("═".repeat(50));
  console.log(`Network:  ${hre.network.name}`);
  console.log(`Address:  ${deployer.address}`);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  const balanceEth = hre.ethers.formatEther(balance);
  
  console.log(`Balance:  ${balanceEth} ETH`);
  
  if (parseFloat(balanceEth) < 0.01) {
    console.log("\n⚠️  WARNING: Low balance! You need at least 0.05 ETH for deployment.");
    console.log("\nGet Sepolia ETH from:");
    console.log("  • https://www.alchemy.com/faucets/ethereum-sepolia");
    console.log("  • https://cloud.google.com/application/web3/faucet/ethereum/sepolia");
  } else {
    console.log("\n✅ Balance OK - Ready to deploy!");
  }
  console.log("═".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

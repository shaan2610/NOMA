const fs = require("fs");
const path = require("path");

/**
 * Generate Scaffold-ETH 2 deployment JSONs from Hardhat artifacts
 * 
 * Scaffold-ETH 2 expects deployment files in this format:
 * deployments/[network]/[ContractName].json
 * 
 * Each file should contain: { address, abi, ... }
 */

const CONTRACTS = [
  "MockUSDC",
  "LeaseNFT",
  "NomaVault",
  "ReputationRegistry",
  "NomaPayment",
];

const NETWORK = process.env.NETWORK || "sepolia";

const DEPLOYED_ADDRESSES = {
  sepolia: {
    MockUSDC: "0xc7f13f249BB6F0DBBC3370f27328F067fb8AE19b",
    LeaseNFT: "0x8f0237b2076887988b796C6054A9a5a6Cf5cA058",
    NomaVault: "0xc8a37Bd0B65862e9e38F7568621e4349d84De007",
    ReputationRegistry: "0x54063F6114cCDD076f60a5AB3729a8C89B0264ad",
    NomaPayment: "0xdF07D598dFb950A4bE8C43a2B72f84150aC9bBc4",
  },
};

async function main() {
  console.log("\n📦 Generating Scaffold-ETH 2 Deployment Files");
  console.log("═".repeat(50));
  console.log(`Network: ${NETWORK}`);

  const deploymentDir = path.join(__dirname, "../deployments", NETWORK);
  
  // Create deployment directory
  if (!fs.existsSync(deploymentDir)) {
    fs.mkdirSync(deploymentDir, { recursive: true });
    console.log(`✅ Created directory: ${deploymentDir}`);
  }

  const addresses = DEPLOYED_ADDRESSES[NETWORK];
  if (!addresses) {
    throw new Error(`No addresses found for network: ${NETWORK}`);
  }

  // Process each contract
  for (const contractName of CONTRACTS) {
    try {
      const address = addresses[contractName];
      if (!address) {
        console.log(`⚠️  No address for ${contractName}, skipping...`);
        continue;
      }

      // Find artifact path
      let artifactPath;
      if (contractName === "MockUSDC") {
        artifactPath = path.join(__dirname, "../artifacts/src/mocks/MockUSDC.sol/MockUSDC.json");
      } else {
        artifactPath = path.join(__dirname, `../artifacts/src/${contractName}.sol/${contractName}.json`);
      }

      if (!fs.existsSync(artifactPath)) {
        console.log(`❌ Artifact not found: ${artifactPath}`);
        continue;
      }

      const artifact = JSON.parse(fs.readFileSync(artifactPath, "utf8"));

      // Create deployment JSON
      const deployment = {
        address: address,
        abi: artifact.abi,
        bytecode: artifact.bytecode,
        deployedBytecode: artifact.deployedBytecode,
      };

      const deploymentPath = path.join(deploymentDir, `${contractName}.json`);
      fs.writeFileSync(deploymentPath, JSON.stringify(deployment, null, 2));

      console.log(`✅ ${contractName}: ${address}`);
    } catch (error) {
      console.log(`❌ Error processing ${contractName}:`, error.message);
    }
  }

  // Also create chainId file
  const chainIds = {
    sepolia: 11155111,
    localhost: 31337,
  };

  const chainIdPath = path.join(deploymentDir, ".chainId");
  fs.writeFileSync(chainIdPath, chainIds[NETWORK].toString());

  console.log("\n" + "═".repeat(50));
  console.log("✅ Deployment files generated!");
  console.log(`📁 Location: ${deploymentDir}`);
  console.log("═".repeat(50));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

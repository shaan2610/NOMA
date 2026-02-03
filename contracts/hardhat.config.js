require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    // Arc Mainnet (when available)
    arc: {
      url: process.env.ARC_RPC_URL || "https://rpc.arc.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.ARC_CHAIN_ID || "1"),
    },
    // Arc Testnet
    arcTestnet: {
      url: process.env.ARC_TESTNET_RPC_URL || "https://testnet-rpc.arc.xyz",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: parseInt(process.env.ARC_TESTNET_CHAIN_ID || "5"),
    },
    // Sepolia for testing Circle integration
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: {
      arc: process.env.ARC_EXPLORER_API_KEY || "",
      arcTestnet: process.env.ARC_EXPLORER_API_KEY || "",
      sepolia: process.env.ETHERSCAN_API_KEY || "",
    },
    customChains: [
      {
        network: "arc",
        chainId: parseInt(process.env.ARC_CHAIN_ID || "1"),
        urls: {
          apiURL: "https://explorer.arc.xyz/api",
          browserURL: "https://explorer.arc.xyz",
        },
      },
      {
        network: "arcTestnet",
        chainId: parseInt(process.env.ARC_TESTNET_CHAIN_ID || "5"),
        urls: {
          apiURL: "https://testnet-explorer.arc.xyz/api",
          browserURL: "https://testnet-explorer.arc.xyz",
        },
      },
    ],
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};

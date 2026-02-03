// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MockUSDC
 * @notice Mock USDC token for testing and demo purposes
 * @dev Mimics USDC with 6 decimals
 */
contract MockUSDC is ERC20, Ownable {
    uint8 private constant DECIMALS = 6;

    constructor() ERC20("USD Coin", "USDC") Ownable(msg.sender) {
        // Mint initial supply to deployer for testing
        _mint(msg.sender, 1_000_000 * 10**DECIMALS); // 1M USDC
    }

    function decimals() public pure override returns (uint8) {
        return DECIMALS;
    }

    /**
     * @notice Mint tokens for testing
     * @param to Recipient address
     * @param amount Amount to mint (in smallest units, 6 decimals)
     */
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /**
     * @notice Faucet function for demo - anyone can get test USDC
     * @param amount Amount to receive (max 10,000 USDC per call)
     */
    function faucet(uint256 amount) external {
        require(amount <= 10_000 * 10**DECIMALS, "Max 10,000 USDC per faucet call");
        _mint(msg.sender, amount);
    }

    /**
     * @notice Convenience function to get 1,000 USDC
     */
    function getFaucetDrip() external {
        _mint(msg.sender, 1_000 * 10**DECIMALS);
    }
}

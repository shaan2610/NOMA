// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "../interfaces/ICircleGateway.sol";

/**
 * @title MockCircleGateway
 * @notice Mock implementation of Circle's CCTP for demo purposes
 * @dev Simulates cross-chain USDC transfers
 * 
 * In production, this would integrate with:
 * - Circle CCTP (Cross-Chain Transfer Protocol)
 * - Circle Programmable Wallets
 * - Circle Gateway API
 */
contract MockCircleGateway is ICircleGateway {
    using SafeERC20 for IERC20;

    // ============ State ============

    IERC20 public usdc;
    uint64 private _messageIdCounter;

    /// @notice Mapping of message ID to transfer status
    mapping(uint64 => bool) public transferComplete;

    /// @notice Mapping of message ID to transfer details
    mapping(uint64 => Transfer) public transfers;

    /// @notice Domain IDs for different chains
    mapping(uint256 => uint32) public chainDomains;

    struct Transfer {
        address sender;
        bytes32 recipient;
        uint256 amount;
        uint32 destinationDomain;
        uint256 timestamp;
    }

    // ============ Events ============

    event DepositForBurn(
        uint64 indexed messageId,
        address indexed sender,
        uint32 destinationDomain,
        bytes32 recipient,
        uint256 amount
    );

    event TransferCompleted(
        uint64 indexed messageId,
        uint256 timestamp
    );

    // ============ Constructor ============

    constructor(address _usdc) {
        usdc = IERC20(_usdc);
        _messageIdCounter = 1;

        // Set up mock domain IDs
        chainDomains[1] = 0;       // Ethereum Mainnet
        chainDomains[137] = 1;     // Polygon
        chainDomains[42161] = 2;   // Arbitrum
        chainDomains[10] = 3;      // Optimism
        chainDomains[8453] = 4;    // Base
        chainDomains[43114] = 5;   // Avalanche
        // Arc would have its own domain
        chainDomains[1234] = 100;  // Arc (mock chain ID)
    }

    // ============ Core Functions ============

    /**
     * @notice Simulate depositing USDC for cross-chain burn
     * @param destinationDomain Target chain domain
     * @param recipient Recipient address (as bytes32)
     * @param amount Amount to transfer
     * @return messageId The transfer message ID
     */
    function depositForBurn(
        uint32 destinationDomain,
        bytes32 recipient,
        uint256 amount
    ) external override returns (uint64 messageId) {
        require(amount > 0, "Amount must be > 0");

        // Transfer USDC to this contract (simulating burn)
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        messageId = _messageIdCounter++;

        transfers[messageId] = Transfer({
            sender: msg.sender,
            recipient: recipient,
            amount: amount,
            destinationDomain: destinationDomain,
            timestamp: block.timestamp
        });

        emit DepositForBurn(
            messageId,
            msg.sender,
            destinationDomain,
            recipient,
            amount
        );

        // For demo: auto-complete transfers after short delay
        // In production, this would be handled by Circle's attestation service
        transferComplete[messageId] = true;

        emit TransferCompleted(messageId, block.timestamp);

        return messageId;
    }

    /**
     * @notice Check if a transfer is complete
     * @param messageId The message ID to check
     * @return completed Transfer completion status
     */
    function isTransferComplete(uint64 messageId) external view override returns (bool) {
        return transferComplete[messageId];
    }

    /**
     * @notice Get domain ID for a chain
     * @param chainId EVM chain ID
     * @return domain Circle domain ID
     */
    function getDomainId(uint256 chainId) external view override returns (uint32) {
        return chainDomains[chainId];
    }

    // ============ Admin Functions (for testing) ============

    /**
     * @notice Manually complete a transfer (for testing)
     * @param messageId The message to complete
     */
    function completeTransfer(uint64 messageId) external {
        transferComplete[messageId] = true;
        emit TransferCompleted(messageId, block.timestamp);
    }

    /**
     * @notice Simulate receiving USDC from another chain (minting)
     * @param recipient Recipient address
     * @param amount Amount to mint/receive
     */
    function receiveMessage(address recipient, uint256 amount) external {
        // In a mock, we just transfer from our balance
        // In production, this would be triggered by Circle's attestation
        usdc.safeTransfer(recipient, amount);
    }

    /**
     * @notice Get transfer details
     * @param messageId The message ID
     * @return Transfer details
     */
    function getTransfer(uint64 messageId) external view returns (Transfer memory) {
        return transfers[messageId];
    }

    /**
     * @notice Set domain for a chain (admin)
     * @param chainId The chain ID
     * @param domain The domain ID
     */
    function setDomain(uint256 chainId, uint32 domain) external {
        chainDomains[chainId] = domain;
    }
}

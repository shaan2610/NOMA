// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ICircleGateway
 * @notice Interface for Circle's cross-chain USDC transfer (CCTP-like)
 * @dev Mocked for hackathon demo - real integration would use Circle's CCTP
 */
interface ICircleGateway {
    /// @notice Transfer USDC cross-chain via Circle
    /// @param destinationDomain The destination chain domain
    /// @param recipient The recipient address on destination chain
    /// @param amount Amount of USDC to transfer
    /// @return messageId The cross-chain message identifier
    function depositForBurn(
        uint32 destinationDomain,
        bytes32 recipient,
        uint256 amount
    ) external returns (uint64 messageId);

    /// @notice Check if a transfer is complete
    /// @param messageId The message identifier
    /// @return completed Whether the transfer is complete
    function isTransferComplete(uint64 messageId) external view returns (bool completed);

    /// @notice Get the domain ID for a chain
    /// @param chainId The EVM chain ID
    /// @return domain The Circle domain ID
    function getDomainId(uint256 chainId) external view returns (uint32 domain);
}

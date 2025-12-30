// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "./EduSealRegistry.sol";

/**
 * @title TemporaryDeployFactory
 * @notice EIP-6780 compliant factory for deploying EduSealRegistry
 * @dev Uses EVENT + SELFDESTRUCT pattern for parameter-free bytecode sharing
 * 
 * This factory enables universal deployment across all EVM chains without
 * requiring constructor parameters. The deployed contract addresses are
 * emitted via events before self-destruction, allowing deployment scripts
 * to programmatically retrieve them.
 */
contract TemporaryDeployFactory {
    /// @notice Emitted when contracts are deployed
    /// @param deployer Address that deployed the factory
    /// @param contractNames Array of deployed contract names
    /// @param contractAddresses Array of deployed contract addresses
    event ContractsDeployed(
        address indexed deployer,
        string[] contractNames,
        address[] contractAddresses
    );

    /// @notice Deploys EduSealRegistry and self-destructs
    /// @dev NO PARAMETERS - enables same bytecode on all chains
    constructor() {
        uint256 chainId = block.chainid;

        // Get Reclaim verifier address for current chain
        address reclaimVerifier = getReclaimVerifier(chainId);

        // Deploy EduSealRegistry
        EduSealRegistry registry = new EduSealRegistry(reclaimVerifier);

        // Build dynamic arrays for event
        string[] memory contractNames = new string[](1);
        contractNames[0] = "EduSealRegistry";

        address[] memory contractAddresses = new address[](1);
        contractAddresses[0] = address(registry);

        // Emit event with deployment info
        emit ContractsDeployed(msg.sender, contractNames, contractAddresses);

        // Self-destruct to clean up factory
        selfdestruct(payable(msg.sender));
    }

    /// @notice Returns Reclaim Protocol verifier address for given chain
    /// @param chainId The EVM chain ID
    /// @return Address of Reclaim verifier contract
    /// @dev Add more chains as Reclaim Protocol expands support
    function getReclaimVerifier(uint256 chainId) internal pure returns (address) {
        // Polygon Amoy Testnet (80002)
        // Note: As of deployment, Reclaim Protocol may not have official Amoy support
        // This is a placeholder - replace with actual address when available
        if (chainId == 80002) {
            // TODO: Replace with actual Reclaim verifier address on Polygon Amoy
            // For testing, you may need to deploy your own Reclaim verifier
            return 0x0000000000000000000000000000000000000001;
        }
        
        // Polygon Mumbai Testnet (80001) - deprecated but included for reference
        if (chainId == 80001) {
            // This is the documented Reclaim address for Mumbai
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Polygon Mainnet (137)
        if (chainId == 137) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Ethereum Mainnet (1)
        if (chainId == 1) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Ethereum Sepolia (11155111)
        if (chainId == 11155111) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Base (8453)
        if (chainId == 8453) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Base Sepolia (84532)
        if (chainId == 84532) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Arbitrum One (42161)
        if (chainId == 42161) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Optimism (10)
        if (chainId == 10) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // BSC (56)
        if (chainId == 56) {
            return 0x0000000000000000000000000000000000000001; // Replace with actual
        }

        // Anvil/Local testnet (31337) - for development
        if (chainId == 31337) {
            return 0x0000000000000000000000000000000000000001; // Mock address for testing
        }

        // Default: For testing/development on unknown chains, use mock address
        // In production, you should revert for unsupported chains
        // For now, return mock address to enable testing
        return 0x0000000000000000000000000000000000000001;
    }
}

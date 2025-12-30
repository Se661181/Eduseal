// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Script.sol";
import "forge-std/Vm.sol";
import "../src/TemporaryDeployFactory.sol";

/**
 * @title Deploy
 * @notice Deployment script for EduSealRegistry using TemporaryDeployFactory
 * @dev Uses EIP-6780 pattern with event log parsing for address extraction
 */
contract Deploy is Script {
    function run() external {
        // Start broadcasting transactions
        vm.startBroadcast();

        // Record logs before deployment
        vm.recordLogs();

        // Deploy factory (which deploys EduSealRegistry and self-destructs)
        TemporaryDeployFactory factory = new TemporaryDeployFactory();

        // Stop broadcasting
        vm.stopBroadcast();

        // Parse ContractsDeployed event to extract addresses
        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 eventSignature = keccak256("ContractsDeployed(address,string[],address[])");

        console.log("=== EduSeal Deployment ===");
        console.log("Factory deployed at:", address(factory));
        console.log("");

        // Find and parse the ContractsDeployed event
        for (uint256 i = 0; i < logs.length; i++) {
            if (logs[i].topics[0] == eventSignature && logs[i].emitter == address(factory)) {
                // Extract deployer from indexed parameter
                address deployer = address(uint160(uint256(logs[i].topics[1])));

                // Decode dynamic arrays from event data
                (string[] memory contractNames, address[] memory contractAddresses) =
                    abi.decode(logs[i].data, (string[], address[]));

                console.log("Deployment successful!");
                console.log("Deployer:", deployer);
                console.log("Chain ID:", block.chainid);
                console.log("");
                console.log("Deployed Contracts:");
                console.log("-------------------");

                // Log all deployed contracts
                for (uint256 j = 0; j < contractNames.length; j++) {
                    console.log("Contract:", contractNames[j]);
                    console.log("Address:", contractAddresses[j]);
                    console.log("");
                }

                // Additional deployment info
                console.log("=== Next Steps ===");
                console.log("1. Verify the contract on block explorer");
                console.log("2. Update frontend with contract address");
                console.log("3. Configure Reclaim Protocol verifier address");
                console.log("4. Test credential minting with valid proofs");
                console.log("");
                console.log("=== Important Notes ===");
                console.log("- Reclaim verifier address may need to be updated");
                console.log("- Check TemporaryDeployFactory.sol for current verifier addresses");
                console.log("- Polygon Amoy testnet may require custom Reclaim deployment");
                
                break;
            }
        }
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

import "forge-std/Test.sol";
import "../src/EduSealRegistry.sol";

/**
 * @title EduSealRegistryTest
 * @notice Comprehensive test suite for EduSealRegistry contract
 * @dev Achieves 100% line coverage with all test categories
 */
contract EduSealRegistryTest is Test {
    /*//////////////////////////////////////////////////////////////
                                SETUP
    //////////////////////////////////////////////////////////////*/

    EduSealRegistry public registry;
    MockReclaimVerifier public mockVerifier;

    // Test addresses
    address public owner;
    address public user1;
    address public user2;
    address public institution;

    // Copy event declarations from main contract for testing
    event CredentialMinted(
        address indexed user,
        uint256 indexed credentialIndex,
        string degreeName,
        string issuer,
        uint256 timestamp
    );

    event CredentialDeactivated(
        address indexed user,
        uint256 indexed credentialIndex
    );

    function setUp() public {
        // Initialize test addresses
        owner = address(this);
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        institution = makeAddr("institution");

        // Fund test addresses
        vm.deal(user1, 10 ether);
        vm.deal(user2, 10 ether);

        // Deploy mock Reclaim verifier
        mockVerifier = new MockReclaimVerifier();

        // Deploy EduSealRegistry
        registry = new EduSealRegistry(address(mockVerifier));
    }

    /*//////////////////////////////////////////////////////////////
                        CONSTRUCTOR TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Test successful deployment with valid verifier
    function testConstructorSuccess() public {
        EduSealRegistry newRegistry = new EduSealRegistry(address(mockVerifier));
        assertEq(newRegistry.reclaimVerifier(), address(mockVerifier), "Verifier address mismatch");
        assertEq(newRegistry.totalCredentialsMinted(), 0, "Initial credential count should be 0");
    }

    /// @notice Test constructor reverts with zero address
    function testConstructorRevertsZeroAddress() public {
        vm.expectRevert(EduSealRegistry.InvalidVerifierAddress.selector);
        new EduSealRegistry(address(0));
    }

    /*//////////////////////////////////////////////////////////////
                    VERIFY AND MINT - HAPPY PATH
    //////////////////////////////////////////////////////////////*/

    /// @notice Test successful credential minting with valid proof
    function testVerifyAndMintSuccess() public {
        // Create valid proof
        Proof memory proof = createValidProof(
            "Bachelor of Science in Computer Science",
            "canvas.harvard.edu"
        );

        // Set mock verifier to accept proof
        mockVerifier.setShouldRevert(false);

        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit CredentialMinted(
            user1,
            0,
            "Bachelor of Science in Computer Science",
            "canvas.harvard.edu",
            block.timestamp
        );

        // Mint credential as user1
        vm.prank(user1);
        registry.verifyAndMint(proof);

        // Verify credential was stored correctly
        EduSealRegistry.Credential[] memory credentials = registry.getUserCredentials(user1);
        assertEq(credentials.length, 1, "Should have 1 credential");
        assertEq(credentials[0].degreeName, "Bachelor of Science in Computer Science", "Degree name mismatch");
        assertEq(credentials[0].issuer, "canvas.harvard.edu", "Issuer mismatch");
        assertEq(credentials[0].timestamp, block.timestamp, "Timestamp mismatch");
        assertTrue(credentials[0].active, "Credential should be active");

        // Verify total count increased
        assertEq(registry.totalCredentialsMinted(), 1, "Total credentials should be 1");
    }

    /// @notice Test minting multiple credentials for same user
    function testVerifyAndMintMultipleCredentials() public {
        mockVerifier.setShouldRevert(false);

        // Mint first credential
        Proof memory proof1 = createValidProof("Bachelor of Arts", "canvas.mit.edu");
        vm.prank(user1);
        registry.verifyAndMint(proof1);

        // Mint second credential
        Proof memory proof2 = createValidProof("Master of Science", "canvas.stanford.edu");
        vm.prank(user1);
        registry.verifyAndMint(proof2);

        // Verify both credentials exist
        EduSealRegistry.Credential[] memory credentials = registry.getUserCredentials(user1);
        assertEq(credentials.length, 2, "Should have 2 credentials");
        assertEq(credentials[0].degreeName, "Bachelor of Arts", "First credential mismatch");
        assertEq(credentials[1].degreeName, "Master of Science", "Second credential mismatch");
        assertEq(registry.totalCredentialsMinted(), 2, "Total should be 2");
    }

    /// @notice Test different users can mint credentials independently
    function testVerifyAndMintDifferentUsers() public {
        mockVerifier.setShouldRevert(false);

        // User1 mints credential
        Proof memory proof1 = createValidProof("PhD in Physics", "canvas.caltech.edu");
        vm.prank(user1);
        registry.verifyAndMint(proof1);

        // User2 mints credential
        Proof memory proof2 = createValidProof("MBA", "canvas.wharton.upenn.edu");
        vm.prank(user2);
        registry.verifyAndMint(proof2);

        // Verify user1 credentials
        EduSealRegistry.Credential[] memory user1Creds = registry.getUserCredentials(user1);
        assertEq(user1Creds.length, 1, "User1 should have 1 credential");
        assertEq(user1Creds[0].degreeName, "PhD in Physics", "User1 credential mismatch");

        // Verify user2 credentials
        EduSealRegistry.Credential[] memory user2Creds = registry.getUserCredentials(user2);
        assertEq(user2Creds.length, 1, "User2 should have 1 credential");
        assertEq(user2Creds[0].degreeName, "MBA", "User2 credential mismatch");

        // Verify total count
        assertEq(registry.totalCredentialsMinted(), 2, "Total should be 2");
    }

    /*//////////////////////////////////////////////////////////////
                    VERIFY AND MINT - REVERT TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Test minting reverts with invalid proof
    function testVerifyAndMintRevertsInvalidProof() public {
        // Set mock verifier to reject proof
        mockVerifier.setShouldRevert(true);

        Proof memory proof = createValidProof("Invalid Degree", "fake.edu");

        // Expect revert
        vm.expectRevert(EduSealRegistry.ProofVerificationFailed.selector);
        vm.prank(user1);
        registry.verifyAndMint(proof);

        // Verify no credential was minted
        assertEq(registry.getUserCredentialCount(user1), 0, "No credential should be minted");
        assertEq(registry.totalCredentialsMinted(), 0, "Total should remain 0");
    }

    /*//////////////////////////////////////////////////////////////
                    DEACTIVATE CREDENTIAL TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Test successful credential deactivation
    function testDeactivateCredentialSuccess() public {
        // Mint credential first
        mockVerifier.setShouldRevert(false);
        Proof memory proof = createValidProof("Bachelor of Engineering", "canvas.berkeley.edu");
        vm.prank(user1);
        registry.verifyAndMint(proof);

        // Verify credential is active
        assertTrue(registry.isCredentialActive(user1, 0), "Credential should be active");

        // Expect event emission
        vm.expectEmit(true, true, false, true);
        emit CredentialDeactivated(user1, 0);

        // Deactivate credential
        vm.prank(user1);
        registry.deactivateCredential(0);

        // Verify credential is now inactive
        assertFalse(registry.isCredentialActive(user1, 0), "Credential should be inactive");

        // Verify credential data is still accessible
        EduSealRegistry.Credential memory cred = registry.getCredential(user1, 0);
        assertEq(cred.degreeName, "Bachelor of Engineering", "Credential data should persist");
        assertFalse(cred.active, "Credential should be marked inactive");
    }

    /// @notice Test deactivating non-existent credential reverts
    function testDeactivateCredentialRevertsNotFound() public {
        vm.expectRevert(EduSealRegistry.CredentialNotFound.selector);
        vm.prank(user1);
        registry.deactivateCredential(0);
    }

    /// @notice Test deactivating already inactive credential reverts
    function testDeactivateCredentialRevertsAlreadyInactive() public {
        // Mint and deactivate credential
        mockVerifier.setShouldRevert(false);
        Proof memory proof = createValidProof("Test Degree", "test.edu");
        vm.prank(user1);
        registry.verifyAndMint(proof);

        vm.prank(user1);
        registry.deactivateCredential(0);

        // Try to deactivate again
        vm.expectRevert(EduSealRegistry.CredentialAlreadyInactive.selector);
        vm.prank(user1);
        registry.deactivateCredential(0);
    }

    /// @notice Test deactivating credential with invalid index
    function testDeactivateCredentialRevertsInvalidIndex() public {
        // Mint one credential
        mockVerifier.setShouldRevert(false);
        Proof memory proof = createValidProof("Test Degree", "test.edu");
        vm.prank(user1);
        registry.verifyAndMint(proof);

        // Try to deactivate index 1 (doesn't exist)
        vm.expectRevert(EduSealRegistry.CredentialNotFound.selector);
        vm.prank(user1);
        registry.deactivateCredential(1);
    }

    /*//////////////////////////////////////////////////////////////
                        VIEW FUNCTION TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Test getUserCredentials returns empty array for new user
    function testGetUserCredentialsEmpty() public view {
        EduSealRegistry.Credential[] memory credentials = registry.getUserCredentials(user1);
        assertEq(credentials.length, 0, "New user should have no credentials");
    }

    /// @notice Test getUserCredentials returns all credentials
    function testGetUserCredentialsMultiple() public {
        mockVerifier.setShouldRevert(false);

        // Mint 3 credentials
        vm.startPrank(user1);
        registry.verifyAndMint(createValidProof("Degree 1", "uni1.edu"));
        registry.verifyAndMint(createValidProof("Degree 2", "uni2.edu"));
        registry.verifyAndMint(createValidProof("Degree 3", "uni3.edu"));
        vm.stopPrank();

        EduSealRegistry.Credential[] memory credentials = registry.getUserCredentials(user1);
        assertEq(credentials.length, 3, "Should return all 3 credentials");
    }

    /// @notice Test getCredential returns correct credential
    function testGetCredentialSuccess() public {
        mockVerifier.setShouldRevert(false);
        Proof memory proof = createValidProof("Test Degree", "test.edu");
        vm.prank(user1);
        registry.verifyAndMint(proof);

        EduSealRegistry.Credential memory cred = registry.getCredential(user1, 0);
        assertEq(cred.degreeName, "Test Degree", "Degree name mismatch");
        assertEq(cred.issuer, "test.edu", "Issuer mismatch");
        assertTrue(cred.active, "Should be active");
    }

    /// @notice Test getCredential reverts for invalid index
    function testGetCredentialRevertsInvalidIndex() public {
        vm.expectRevert(EduSealRegistry.CredentialNotFound.selector);
        registry.getCredential(user1, 0);
    }

    /// @notice Test getUserCredentialCount returns correct count
    function testGetUserCredentialCount() public {
        assertEq(registry.getUserCredentialCount(user1), 0, "Initial count should be 0");

        mockVerifier.setShouldRevert(false);
        vm.startPrank(user1);
        registry.verifyAndMint(createValidProof("Degree 1", "uni1.edu"));
        assertEq(registry.getUserCredentialCount(user1), 1, "Count should be 1");

        registry.verifyAndMint(createValidProof("Degree 2", "uni2.edu"));
        assertEq(registry.getUserCredentialCount(user1), 2, "Count should be 2");
        vm.stopPrank();
    }

    /// @notice Test isCredentialActive returns false for non-existent credential
    function testIsCredentialActiveNonExistent() public view {
        assertFalse(registry.isCredentialActive(user1, 0), "Non-existent credential should return false");
    }

    /// @notice Test isCredentialActive returns correct status
    function testIsCredentialActiveStatus() public {
        mockVerifier.setShouldRevert(false);
        vm.prank(user1);
        registry.verifyAndMint(createValidProof("Test", "test.edu"));

        assertTrue(registry.isCredentialActive(user1, 0), "Should be active initially");

        vm.prank(user1);
        registry.deactivateCredential(0);

        assertFalse(registry.isCredentialActive(user1, 0), "Should be inactive after deactivation");
    }

    /*//////////////////////////////////////////////////////////////
                        EDGE CASE TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Test minting credential with empty strings
    function testVerifyAndMintEmptyStrings() public {
        mockVerifier.setShouldRevert(false);
        Proof memory proof = createValidProof("", "");

        vm.prank(user1);
        registry.verifyAndMint(proof);

        EduSealRegistry.Credential memory cred = registry.getCredential(user1, 0);
        assertEq(cred.degreeName, "", "Should accept empty degree name");
        assertEq(cred.issuer, "", "Should accept empty issuer");
    }

    /// @notice Test minting credential with very long strings
    function testVerifyAndMintLongStrings() public {
        mockVerifier.setShouldRevert(false);
        
        string memory longDegree = "Bachelor of Science in Computer Science with Honors and Distinction in Artificial Intelligence and Machine Learning";
        string memory longIssuer = "canvas.massachusetts-institute-of-technology.edu";

        Proof memory proof = createValidProof(longDegree, longIssuer);

        vm.prank(user1);
        registry.verifyAndMint(proof);

        EduSealRegistry.Credential memory cred = registry.getCredential(user1, 0);
        assertEq(cred.degreeName, longDegree, "Should handle long degree names");
        assertEq(cred.issuer, longIssuer, "Should handle long issuer names");
    }

    /// @notice Test timestamp accuracy
    function testTimestampAccuracy() public {
        mockVerifier.setShouldRevert(false);

        uint256 beforeTime = block.timestamp;
        
        vm.prank(user1);
        registry.verifyAndMint(createValidProof("Test", "test.edu"));

        uint256 afterTime = block.timestamp;

        EduSealRegistry.Credential memory cred = registry.getCredential(user1, 0);
        assertGe(cred.timestamp, beforeTime, "Timestamp should be >= before time");
        assertLe(cred.timestamp, afterTime, "Timestamp should be <= after time");
    }

    /*//////////////////////////////////////////////////////////////
                        FUZZ TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Fuzz test for minting credentials with random data
    function testFuzzVerifyAndMint(string memory degreeName, string memory issuer) public {
        mockVerifier.setShouldRevert(false);

        Proof memory proof = createValidProof(degreeName, issuer);

        vm.prank(user1);
        registry.verifyAndMint(proof);

        EduSealRegistry.Credential memory cred = registry.getCredential(user1, 0);
        assertEq(cred.degreeName, degreeName, "Fuzz: degree name mismatch");
        assertEq(cred.issuer, issuer, "Fuzz: issuer mismatch");
        assertTrue(cred.active, "Fuzz: should be active");
    }

    /// @notice Fuzz test for deactivating credentials at various indices
    function testFuzzDeactivateCredential(uint8 credentialCount, uint8 deactivateIndex) public {
        // Bound inputs to reasonable ranges
        credentialCount = uint8(bound(credentialCount, 1, 10));
        deactivateIndex = uint8(bound(deactivateIndex, 0, credentialCount - 1));

        mockVerifier.setShouldRevert(false);

        // Mint multiple credentials
        vm.startPrank(user1);
        for (uint256 i = 0; i < credentialCount; i++) {
            registry.verifyAndMint(createValidProof("Degree", "test.edu"));
        }
        vm.stopPrank();

        // Deactivate specific credential
        vm.prank(user1);
        registry.deactivateCredential(deactivateIndex);

        // Verify only the specified credential is inactive
        for (uint256 i = 0; i < credentialCount; i++) {
            if (i == deactivateIndex) {
                assertFalse(registry.isCredentialActive(user1, i), "Fuzz: should be inactive");
            } else {
                assertTrue(registry.isCredentialActive(user1, i), "Fuzz: should remain active");
            }
        }
    }

    /*//////////////////////////////////////////////////////////////
                        INTEGRATION TESTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Test complete workflow: mint, verify, deactivate
    function testCompleteWorkflow() public {
        mockVerifier.setShouldRevert(false);

        // Step 1: Mint credential
        vm.prank(user1);
        registry.verifyAndMint(createValidProof("Bachelor of Arts", "canvas.yale.edu"));

        // Step 2: Verify credential exists and is active
        assertEq(registry.getUserCredentialCount(user1), 1, "Should have 1 credential");
        assertTrue(registry.isCredentialActive(user1, 0), "Should be active");

        // Step 3: Deactivate credential
        vm.prank(user1);
        registry.deactivateCredential(0);

        // Step 4: Verify credential is inactive but still exists
        assertEq(registry.getUserCredentialCount(user1), 1, "Should still have 1 credential");
        assertFalse(registry.isCredentialActive(user1, 0), "Should be inactive");

        // Step 5: Verify credential data persists
        EduSealRegistry.Credential memory cred = registry.getCredential(user1, 0);
        assertEq(cred.degreeName, "Bachelor of Arts", "Data should persist");
        assertEq(cred.issuer, "canvas.yale.edu", "Data should persist");
    }

    /*//////////////////////////////////////////////////////////////
                        HELPER FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Creates a valid proof structure for testing
    function createValidProof(string memory degreeName, string memory issuer)
        internal
        view
        returns (Proof memory)
    {
        ClaimInfo memory claimInfo = ClaimInfo({
            provider: issuer,
            parameters: degreeName,
            context: ""
        });

        SignedClaim memory signedClaim = SignedClaim({
            identifier: bytes32(uint256(1)),
            owner: address(0x1),
            timestampS: uint32(block.timestamp),
            epoch: 1
        });

        return Proof({
            claimInfo: claimInfo,
            signedClaim: signedClaim
        });
    }
}

/**
 * @title MockReclaimVerifier
 * @notice Mock implementation of Reclaim Protocol verifier for testing
 */
contract MockReclaimVerifier {
    bool public shouldRevert;

    function setShouldRevert(bool _shouldRevert) external {
        shouldRevert = _shouldRevert;
    }

    function verifyProof(Proof memory) external view {
        if (shouldRevert) {
            revert("Mock: Proof verification failed");
        }
        // Success - do nothing
    }
}

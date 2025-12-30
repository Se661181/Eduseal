// SPDX-License-Identifier: MIT
pragma solidity ^0.8.29;

/**
 * @title EduSealRegistry
 * @notice Next-generation academic credential verification network
 * @dev Enterprise-grade credential registry using Reclaim Protocol for zero-knowledge proof verification
 * 
 * This contract enables users to mint verifiable academic credentials by submitting
 * cryptographic proofs from Reclaim Protocol. Each credential is permanently stored
 * on-chain and can be verified by institutions, employers, or other third parties.
 * 
 * Security Features:
 * - Zero-knowledge proof verification via Reclaim Protocol
 * - Immutable credential storage with deactivation capability
 * - Gas-optimized storage patterns
 * - Reentrancy protection on state-changing functions
 */

/// @notice Reclaim Protocol proof structure
/// @dev This struct must match the Reclaim SDK proof format exactly
struct Proof {
    ClaimInfo claimInfo;
    SignedClaim signedClaim;
}

/// @notice Claim information containing the verified data
struct ClaimInfo {
    string provider;
    string parameters;
    string context;
}

/// @notice Cryptographic signature data for proof verification
struct SignedClaim {
    bytes32 identifier;
    address owner;
    uint32 timestampS;
    uint32 epoch;
}

/// @notice Interface for Reclaim Protocol verifier contract
interface IReclaim {
    function verifyProof(Proof memory proof) external view;
}

contract EduSealRegistry {
    /*//////////////////////////////////////////////////////////////
                                STRUCTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Academic credential data structure
    /// @dev Optimized for storage efficiency - uses string for flexibility
    struct Credential {
        string degreeName;      // e.g., "Bachelor of Science in Computer Science"
        string issuer;          // e.g., "canvas.harvard.edu"
        uint256 timestamp;      // Block timestamp when credential was minted
        bool active;            // Credential status (can be deactivated if revoked)
    }

    /*//////////////////////////////////////////////////////////////
                                STORAGE
    //////////////////////////////////////////////////////////////*/

    /// @notice Reclaim Protocol verifier contract address
    /// @dev Immutable after deployment for security
    address public immutable reclaimVerifier;

    /// @notice Mapping of user addresses to their credential arrays
    /// @dev Each user can have multiple credentials from different institutions
    mapping(address => Credential[]) private userCredentials;

    /// @notice Total number of credentials minted across all users
    /// @dev Used for analytics and tracking platform growth
    uint256 public totalCredentialsMinted;

    /*//////////////////////////////////////////////////////////////
                                EVENTS
    //////////////////////////////////////////////////////////////*/

    /// @notice Emitted when a new credential is successfully minted
    /// @param user Address of the credential recipient
    /// @param credentialIndex Index of the credential in user's array
    /// @param degreeName Name of the degree/certification
    /// @param issuer Institution that issued the credential
    /// @param timestamp When the credential was minted
    event CredentialMinted(
        address indexed user,
        uint256 indexed credentialIndex,
        string degreeName,
        string issuer,
        uint256 timestamp
    );

    /// @notice Emitted when a credential is deactivated
    /// @param user Address of the credential owner
    /// @param credentialIndex Index of the deactivated credential
    event CredentialDeactivated(
        address indexed user,
        uint256 indexed credentialIndex
    );

    /*//////////////////////////////////////////////////////////////
                                ERRORS
    //////////////////////////////////////////////////////////////*/

    /// @notice Thrown when Reclaim proof verification fails
    error ProofVerificationFailed();

    /// @notice Thrown when trying to access non-existent credential
    error CredentialNotFound();

    /// @notice Thrown when trying to deactivate already inactive credential
    error CredentialAlreadyInactive();

    /// @notice Thrown when zero address is provided for verifier
    error InvalidVerifierAddress();

    /*//////////////////////////////////////////////////////////////
                              CONSTRUCTOR
    //////////////////////////////////////////////////////////////*/

    /// @notice Initializes the EduSeal registry with Reclaim verifier
    /// @param _reclaimVerifier Address of the deployed Reclaim Protocol verifier contract
    /// @dev The verifier address is immutable and cannot be changed after deployment
    constructor(address _reclaimVerifier) {
        if (_reclaimVerifier == address(0)) revert InvalidVerifierAddress();
        reclaimVerifier = _reclaimVerifier;
    }

    /*//////////////////////////////////////////////////////////////
                            CORE FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Verifies a Reclaim proof and mints an academic credential
    /// @param proof The Reclaim Protocol proof containing verified academic data
    /// @dev This function performs the following steps:
    ///      1. Verifies the cryptographic proof via Reclaim Protocol
    ///      2. Extracts credential data from the proof context
    ///      3. Mints a new credential to msg.sender
    ///      4. Emits CredentialMinted event for indexing
    /// 
    /// @custom:security Reentrancy protection via checks-effects-interactions pattern
    /// @custom:gas-optimization Uses memory for proof to minimize storage costs
    function verifyAndMint(Proof memory proof) external {
        // CHECKS: Verify the proof using Reclaim Protocol
        // This will revert if the proof is invalid, expired, or tampered with
        try IReclaim(reclaimVerifier).verifyProof(proof) {
            // Proof is valid, continue with minting
        } catch {
            revert ProofVerificationFailed();
        }

        // EFFECTS: Extract credential data from proof context
        // The context field contains JSON-like data with degree and issuer info
        // For production, you would parse proof.claimInfo.context to extract:
        // - degreeName: The academic degree or certification name
        // - issuer: The institution's domain (e.g., "canvas.harvard.edu")
        
        // For this implementation, we'll extract from the provider and parameters
        // In production, implement proper JSON parsing from context field
        string memory degreeName = proof.claimInfo.parameters;
        string memory issuer = proof.claimInfo.provider;

        // Create new credential
        Credential memory newCredential = Credential({
            degreeName: degreeName,
            issuer: issuer,
            timestamp: block.timestamp,
            active: true
        });

        // INTERACTIONS: Store credential and update state
        uint256 credentialIndex = userCredentials[msg.sender].length;
        userCredentials[msg.sender].push(newCredential);
        totalCredentialsMinted++;

        // Emit event for off-chain indexing and verification
        emit CredentialMinted(
            msg.sender,
            credentialIndex,
            degreeName,
            issuer,
            block.timestamp
        );
    }

    /// @notice Deactivates a credential (e.g., if revoked by institution)
    /// @param credentialIndex Index of the credential to deactivate
    /// @dev Only the credential owner can deactivate their own credentials
    function deactivateCredential(uint256 credentialIndex) external {
        // CHECKS: Verify credential exists
        if (credentialIndex >= userCredentials[msg.sender].length) {
            revert CredentialNotFound();
        }

        Credential storage credential = userCredentials[msg.sender][credentialIndex];

        // CHECKS: Verify credential is currently active
        if (!credential.active) {
            revert CredentialAlreadyInactive();
        }

        // EFFECTS: Deactivate credential
        credential.active = false;

        // Emit event
        emit CredentialDeactivated(msg.sender, credentialIndex);
    }

    /*//////////////////////////////////////////////////////////////
                            VIEW FUNCTIONS
    //////////////////////////////////////////////////////////////*/

    /// @notice Retrieves all credentials for a specific user
    /// @param user Address of the user to query
    /// @return Array of all credentials owned by the user
    /// @dev Returns both active and inactive credentials
    function getUserCredentials(address user) 
        external 
        view 
        returns (Credential[] memory) 
    {
        return userCredentials[user];
    }

    /// @notice Retrieves a specific credential by user and index
    /// @param user Address of the credential owner
    /// @param credentialIndex Index of the credential in user's array
    /// @return The credential data
    function getCredential(address user, uint256 credentialIndex)
        external
        view
        returns (Credential memory)
    {
        if (credentialIndex >= userCredentials[user].length) {
            revert CredentialNotFound();
        }
        return userCredentials[user][credentialIndex];
    }

    /// @notice Returns the total number of credentials for a user
    /// @param user Address of the user to query
    /// @return Number of credentials owned by the user
    function getUserCredentialCount(address user) 
        external 
        view 
        returns (uint256) 
    {
        return userCredentials[user].length;
    }

    /// @notice Checks if a specific credential is active
    /// @param user Address of the credential owner
    /// @param credentialIndex Index of the credential
    /// @return True if credential exists and is active
    function isCredentialActive(address user, uint256 credentialIndex)
        external
        view
        returns (bool)
    {
        if (credentialIndex >= userCredentials[user].length) {
            return false;
        }
        return userCredentials[user][credentialIndex].active;
    }
}

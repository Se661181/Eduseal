// Eliza Framework Types and Interfaces
// Note: This file is designed for use with the Eliza AI Framework (ai16z)
// Install with: npm install @ai16z/eliza

interface Memory {
  userId: string;
  content: {
    text: string;
  };
}

interface State {
  recentMessagesData?: Memory[];
}

interface HandlerCallback {
  (response: {
    text: string;
    action: string;
    metadata?: Record<string, unknown>;
  }): void;
}

interface IAgentRuntime {
  // Runtime interface for LLM generation
  [key: string]: unknown;
}

enum ModelClass {
  SMALL = "small",
  LARGE = "large",
}

interface Action {
  name: string;
  similes: string[];
  description: string;
  validate: (runtime: IAgentRuntime, message: Memory) => Promise<boolean>;
  handler: (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    options: Record<string, unknown>,
    callback: HandlerCallback
  ) => Promise<boolean>;
  examples: Array<Array<{
    user: string;
    content: {
      text: string;
      action?: string;
    };
  }>>;
}

// Mock generateText function for standalone usage
// Replace with actual Eliza runtime when integrating
async function generateText({
  runtime,
  context,
  modelClass,
}: {
  runtime: IAgentRuntime;
  context: string;
  modelClass: ModelClass;
}): Promise<string> {
  // This is a placeholder - replace with actual Eliza generateText when integrated
  console.warn("Using mock generateText - integrate with Eliza runtime for production");
  return "Mock response";
}

// Template for extracting Ethereum address from conversation
const addressExtractionTemplate = `
# Task: Extract Ethereum Address
Analyze the conversation and extract the user's Ethereum address if mentioned.

Recent conversation:
{{recentMessages}}

# Instructions
- Look for Ethereum addresses (0x followed by 40 hexadecimal characters)
- If found, respond with ONLY the address
- If not found, respond with "NOT_FOUND"

Your response:`;

interface LedgerResponse {
  did: string;
  ledger_status: string;
  tier: string;
  assets: Array<{
    type: string;
    issuer: string;
    verified_at: string;
  }>;
  error?: string;
}

export const checkCredentialAction: Action = {
  name: "CHECK_CREDENTIAL",
  similes: [
    "VERIFY_CREDENTIAL",
    "CHECK_DEGREE",
    "VERIFY_DEGREE",
    "CHECK_SKILLS",
    "VERIFY_SKILLS",
    "CREDENTIAL_STATUS",
  ],
  description:
    "Checks if a user has verified educational credentials on the blockchain via EduSeal Registry",
  
  validate: async (runtime: IAgentRuntime, message: Memory): Promise<boolean> => {
    const text = message.content.text.toLowerCase();
    
    // Trigger phrases
    const triggers = [
      "do i have a degree",
      "verify my degree",
      "check my degree",
      "verify my skills",
      "check my skills",
      "verify my credentials",
      "check my credentials",
      "am i verified",
      "show my credentials",
      "credential status",
    ];
    
    return triggers.some((trigger) => text.includes(trigger));
  },

  handler: async (
    runtime: IAgentRuntime,
    message: Memory,
    state: State,
    _options: Record<string, unknown>,
    callback: HandlerCallback
  ): Promise<boolean> => {
    try {
      // Step 1: Extract Ethereum address from conversation
      let userAddress: string | null = null;
      
      // Check if address is in the message
      const addressMatch = message.content.text.match(/0x[a-fA-F0-9]{40}/);
      if (addressMatch) {
        userAddress = addressMatch[0];
      } else {
        // Try to extract from recent conversation using LLM
        const recentMessages = state.recentMessagesData
          ?.slice(-5)
          .map((msg: Memory) => `${msg.userId}: ${msg.content.text}`)
          .join("\n") || "";

        const extractionContext = addressExtractionTemplate.replace(
          "{{recentMessages}}",
          recentMessages
        );

        const extractedAddress = await generateText({
          runtime,
          context: extractionContext,
          modelClass: ModelClass.SMALL,
        });

        if (extractedAddress && extractedAddress.trim() !== "NOT_FOUND") {
          const match = extractedAddress.match(/0x[a-fA-F0-9]{40}/);
          if (match) {
            userAddress = match[0];
          }
        }
      }

      // If no address found, ask for it
      if (!userAddress) {
        callback({
          text: "I require your Ethereum wallet address to access the private ledger. Please provide the address beginning with '0x'.",
          action: "CHECK_CREDENTIAL",
        });
        return true;
      }

      // Step 2: Fetch credential data from API
      const apiUrl = `https://preview-e475308b-493c-4d22-aa1e-1611ef9a6a32.codenut.dev/api/verify-user?address=${userAddress}`;
      
      const response = await fetch(apiUrl);
      const data: LedgerResponse = await response.json();

      if (data.error) {
        callback({
          text: `I regret to inform you that the ledger query has encountered an error: ${data.error}. Please attempt again momentarily.`,
          action: "CHECK_CREDENTIAL",
        });
        return false;
      }

      // Step 3: Generate appropriate response based on verification status
      if (data.ledger_status === "ACTIVE" && data.assets.length > 0) {
        // Extract first credential for response
        const primaryAsset = data.assets[0];
        const assetCount = data.assets.length;
        
        let responseText = `[VERIFIED]\n\nIdentity confirmed, Sir/Madam. I have located ${assetCount === 1 ? 'a verified credential' : `${assetCount} verified credentials`} from ${primaryAsset.issuer}.`;
        
        if (assetCount > 1) {
          const additionalIssuers = data.assets.slice(1, 3).map(a => a.issuer).join(", ");
          if (additionalIssuers) {
            responseText += ` Additional records from ${additionalIssuers}.`;
          }
        }
        
        responseText += `\n\nYour ledger status is currently ${data.tier}.\n\nShall I proceed?`;

        callback({
          text: responseText,
          action: "CHECK_CREDENTIAL",
          metadata: {
            address: userAddress,
            ledger_status: data.ledger_status,
            tier: data.tier,
            asset_count: data.assets.length,
          },
        });
      } else {
        // No verified credentials
        callback({
          text: "I am unable to locate a verified record in the private ledger. Access is restricted until a Shadow Mint is performed.\n\n>> Please proceed to the verification portal: https://preview-e475308b-493c-4d22-aa1e-1611ef9a6a32.codenut.dev/",
          action: "CHECK_CREDENTIAL",
          metadata: {
            address: userAddress,
            ledger_status: data.ledger_status,
            tier: data.tier,
          },
        });
      }

      return true;
    } catch (error) {
      console.error("Error in CHECK_CREDENTIAL action:", error);
      callback({
        text: "I regret to inform you that the credential verification system is temporarily unavailable. Please attempt your query again momentarily.",
        action: "CHECK_CREDENTIAL",
      });
      return false;
    }
  },

  examples: [
    [
      {
        user: "{{user1}}",
        content: { text: "Do I have a degree?" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "I require your Ethereum wallet address to access the private ledger. Please provide the address beginning with '0x'.",
          action: "CHECK_CREDENTIAL",
        },
      },
      {
        user: "{{user1}}",
        content: { text: "My address is 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "[VERIFIED]\n\nIdentity confirmed, Sir/Madam. I have located a verified credential from Stanford University.\n\nYour ledger status is currently GOLD.\n\nShall I proceed?",
          action: "CHECK_CREDENTIAL",
        },
      },
    ],
    [
      {
        user: "{{user1}}",
        content: { text: "Verify my skills please" },
      },
      {
        user: "{{agent}}",
        content: {
          text: "I am unable to locate a verified record in the private ledger. Access is restricted until a Shadow Mint is performed.\n\n>> Please proceed to the verification portal: https://preview-e475308b-493c-4d22-aa1e-1611ef9a6a32.codenut.dev/",
          action: "CHECK_CREDENTIAL",
        },
      },
    ],
  ],
};

export default checkCredentialAction;

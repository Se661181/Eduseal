/**
 * EVM Configuration for EduSeal DApp
 * 
 * This file provides chain configuration and contract details for the EduSeal Registry.
 * To build for different chains, set the VITE_CHAIN environment variable:
 * 
 * VITE_CHAIN=devnet pnpm run build    (for local development - default)
 * VITE_CHAIN=polygon_amoy pnpm run build  (for Polygon Amoy testnet)
 */

import metadata from '../metadata.json';

const targetChainName = import.meta.env.VITE_CHAIN || 'devnet';

// Find the chain configuration by network name
const evmConfig = metadata.chains.find(chain => chain.network === targetChainName);

if (!evmConfig) {
  throw new Error(`Chain '${targetChainName}' not found in metadata.json`);
}

// Get the EduSealRegistry contract
const contractInfo = evmConfig.contracts[0];

export const selectedChain = evmConfig;
export const contractAddress = contractInfo.address as `0x${string}`;
export const contractABI = contractInfo.abi;
export const chainId = parseInt(evmConfig.chainId);
export const rpcUrl = evmConfig.rpc_url;
export const chainName = evmConfig.network;

// Chain configuration for wagmi/viem
export const chain = {
  id: chainId,
  name: chainName,
  network: chainName,
  nativeCurrency: {
    decimals: 18,
    name: 'ETH',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: [rpcUrl] },
    public: { http: [rpcUrl] },
  },
} as const;

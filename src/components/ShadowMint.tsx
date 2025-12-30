import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ReclaimProofRequest } from '@reclaimprotocol/js-sdk';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { contractAddress, contractABI } from '@/utils/evmConfig';
import { Button } from '@/components/ui/button';
import { CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';

interface ProofData {
  claimInfo: {
    provider: string;
    parameters: string;
    context: string;
  };
  signedClaim: {
    identifier: string;
    owner: string;
    timestampS: number;
    epoch: number;
  };
}

type MintingState = 'idle' | 'connecting' | 'verifying' | 'minting' | 'success' | 'error';

const LOADING_MESSAGES = [
  'Establishing Handshake...',
  'Verifying Packets...',
  'Minting Proof...',
];

export function ShadowMint() {
  const { address, isConnected } = useAccount();
  const [mintingState, setMintingState] = useState<MintingState>('idle');
  const [proofData, setProofData] = useState<ProofData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [degreeName, setDegreeName] = useState<string>('');
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);

  const { writeContract, data: hash } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  });

  // Cycle through loading messages
  useEffect(() => {
    if (mintingState === 'connecting' || mintingState === 'verifying' || mintingState === 'minting') {
      const interval = setInterval(() => {
        setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [mintingState]);

  const handleConnectUniversity = async () => {
    // Optimistic UI update
    setMintingState('connecting');
    setErrorMessage('');
    setLoadingMessageIndex(0);
    toast.loading('Initializing verification...', { id: 'reclaim-init' });
    
    try {

      // Initialize Reclaim SDK
      const APP_ID = import.meta.env.VITE_RECLAIM_APP_ID;
      const APP_SECRET = import.meta.env.VITE_RECLAIM_APP_SECRET;
      const PROVIDER_ID = import.meta.env.VITE_RECLAIM_PROVIDER_ID;

      if (!APP_ID || !APP_SECRET || !PROVIDER_ID) {
        toast.dismiss('reclaim-init');
        toast.error('Missing Reclaim Protocol configuration');
        throw new Error('Missing Reclaim Protocol configuration. Please check your .env file.');
      }
      
      toast.dismiss('reclaim-init');
      toast.success('SDK initialized');
      toast.loading('Opening verification window...', { id: 'reclaim-verify' });

      const reclaimProofRequest = await ReclaimProofRequest.init(APP_ID, APP_SECRET, PROVIDER_ID);

      // Generate request URL
      const requestUrl = await reclaimProofRequest.getRequestUrl();
      
      setMintingState('verifying');

      // Open verification in new window
      window.open(requestUrl, '_blank', 'width=600,height=800');

      // Start session and wait for proof
      toast.dismiss('reclaim-verify');
      toast.info('Complete verification in the popup window');
      
      await reclaimProofRequest.startSession({
        onSuccess: (proofs) => {
          toast.success('Verification complete!');
          
          // Handle proof data - can be string, single proof, or array
          let proof: any;
          if (Array.isArray(proofs)) {
            proof = proofs[0];
          } else if (typeof proofs === 'string') {
            proof = JSON.parse(proofs);
          } else {
            proof = proofs;
          }
          
          // Extract degree information from proof context with sanitization
          const contextString = proof?.claimData?.context || '{}';
          const sanitizedContext = contextString.trim().replace(/[<>]/g, ''); // Remove potential HTML tags
          const context = JSON.parse(sanitizedContext);
          const extractedDegreeName = (context.degreeName || 'Academic Credential').trim().substring(0, 100); // Limit length
          
          setDegreeName(extractedDegreeName);
          setProofData(proof as ProofData);
          setMintingState('idle');
        },
        onError: (error) => {
          console.error('Verification failed:', error);
          const errorMsg = error instanceof Error ? error.message : 'Verification failed. Please try again.';
          toast.error(errorMsg);
          setErrorMessage(errorMsg);
          setMintingState('error');
        },
      });
    } catch (error) {
      console.error('Error connecting to university:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to connect. Please check your configuration.';
      toast.dismiss('reclaim-init');
      toast.dismiss('reclaim-verify');
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
      setMintingState('error');
    }
  };

  const handleMintCredential = async () => {
    if (!proofData || !address) return;

    // Optimistic UI update
    setMintingState('minting');
    setErrorMessage('');
    setLoadingMessageIndex(0);
    toast.loading('Minting credential on-chain...', { id: 'mint-tx' });

    try {
      // Sanitize proof data before sending to contract
      const sanitizedProofData = {
        ...proofData,
        claimInfo: {
          ...proofData.claimInfo,
          provider: proofData.claimInfo.provider.trim().substring(0, 200),
          parameters: proofData.claimInfo.parameters.trim().substring(0, 500),
          context: proofData.claimInfo.context.trim().substring(0, 1000),
        },
      };

      // Call verifyAndMint on the smart contract
      writeContract({
        address: contractAddress,
        abi: contractABI,
        functionName: 'verifyAndMint',
        args: [sanitizedProofData],
      });
    } catch (error) {
      console.error('Error minting credential:', error);
      toast.dismiss('mint-tx');
      toast.error('Minting failed. Please try again.');
      setErrorMessage('Minting failed. Please try again.');
      setMintingState('error');
    }
  };

  // Handle transaction confirmation
  if (isConfirmed && mintingState === 'minting') {
    toast.dismiss('mint-tx');
    toast.success('Credential sealed on-chain!');
    setMintingState('success');
    
    // Trigger confetti animation
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#D4AF37', '#FFFFFF', '#333333'],
    });
  }

  const isLoading = mintingState === 'connecting' || mintingState === 'verifying' || mintingState === 'minting' || isConfirming;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-2xl mx-auto"
    >
      {/* Matte Black Card */}
      <div className="relative overflow-hidden bg-[#0A0A0A] border border-white/10 z-50">
        <div className="relative p-10 space-y-8">
          {/* Header */}
          <div className="space-y-3">
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-serif text-white"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              Acquire Credential.
            </motion.h2>
            
            <p className="text-[#D4AF37] text-xs font-mono uppercase tracking-wider">
              Initiate TLS verification sequence.
            </p>
          </div>

          {/* Connection Status */}
          {!isConnected ? (
            <div className="flex flex-col items-start gap-4 py-4">
              <p className="text-white/60 text-sm font-mono uppercase tracking-wide">Connect wallet to proceed</p>
              <ConnectButton />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {mintingState === 'success' ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6 py-4"
                >
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-center gap-3 p-4 border border-white/10 bg-white/5"
                  >
                    <CheckCircle2 className="w-6 h-6 text-[#D4AF37] flex-shrink-0" />
                    <div>
                      <h3 className="text-lg font-serif text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
                        Credential Sealed.
                      </h3>
                      <p className="text-sm text-white/60 font-mono mt-1">
                        {degreeName} permanently recorded on-chain
                      </p>
                    </div>
                  </motion.div>

                  <Button
                    onClick={() => {
                      setMintingState('idle');
                      setProofData(null);
                      setDegreeName('');
                    }}
                    className="w-full h-11 border border-white text-white bg-transparent hover:bg-white hover:text-black transition-colors text-sm font-mono uppercase tracking-wider cursor-pointer"
                  >
                    Initiate New Sequence
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="minting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Verification Status */}
                  {proofData && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-white/10 bg-white/5"
                    >
                      <div className="flex items-center gap-2 text-[#D4AF37]">
                        <CheckCircle2 className="w-5 h-5" />
                        <span className="font-mono text-xs uppercase tracking-wider">Verification Complete</span>
                      </div>
                      <p className="text-sm text-white/60 font-mono mt-1">
                        Ready: {degreeName}
                      </p>
                    </motion.div>
                  )}

                  {/* Error Message */}
                  {errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 border border-red-500/30 bg-red-500/10 text-red-400 text-sm font-mono"
                    >
                      {errorMessage}
                    </motion.div>
                  )}

                  {/* Loading State */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-4 border border-white/10 bg-white/5"
                    >
                      <p className="text-[#D4AF37] text-sm font-mono uppercase tracking-wider">
                        {LOADING_MESSAGES[loadingMessageIndex]}
                      </p>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {!proofData ? (
                      <Button
                        onClick={handleConnectUniversity}
                        disabled={isLoading}
                        className="w-full h-11 border border-white text-white bg-transparent hover:bg-white hover:text-black transition-colors text-sm font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isLoading ? 'Initializing...' : 'Initiate Bridge'}
                      </Button>
                    ) : (
                      <Button
                        onClick={handleMintCredential}
                        disabled={isLoading}
                        className="w-full h-11 border border-white text-white bg-transparent hover:bg-white hover:text-black transition-colors text-sm font-mono uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {isLoading ? 'Minting...' : 'Mint Credential'}
                      </Button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </motion.div>
  );
}

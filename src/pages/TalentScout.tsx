import { useState, useRef, useEffect } from 'react';
import { Search, CheckCircle2, Award, Calendar, Building2, ArrowRight, Shield, Home, Users, Database, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { isAddress, createPublicClient, http, parseAbiItem } from 'viem';
import { contractAddress, contractABI, rpcUrl } from '@/utils/evmConfig';

type Credential = {
  degreeName: string;
  issuer: string;
  timestamp: number;
  active: boolean;
};

type CandidateProfile = {
  address: string;
  isVerified: boolean;
  degrees: string[];
  issuerConfidence: string;
  mintDate: string | null;
  credentialCount: number;
  activeCredentials: number;
  credentials?: Credential[];
  trustScore: number;
};

export default function TalentScout() {
  const [searchAddress, setSearchAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfile[]>([]);
  const [error, setError] = useState('');
  const [isLoadingCandidates, setIsLoadingCandidates] = useState(true);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end']
  });
  
  const headerOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0.8]);

  // Create public client for reading blockchain data
  const publicClient = createPublicClient({
    transport: http(rpcUrl),
  });

  // Fetch all candidates from blockchain on mount
  useEffect(() => {
    fetchAllCandidates();
  }, []);

  const fetchAllCandidates = async () => {
    setIsLoadingCandidates(true);
    try {
      // Fetch CredentialMinted event logs
      const logs = await publicClient.getLogs({
        address: contractAddress,
        event: parseAbiItem('event CredentialMinted(address indexed user, uint256 indexed credentialIndex, string degreeName, string issuer, uint256 timestamp)'),
        fromBlock: 'earliest',
        toBlock: 'latest',
      });

      // Group logs by user address
      const userMap = new Map<string, any>();

      for (const log of logs) {
        const { user, degreeName, issuer, timestamp } = log.args as any;
        const userAddress = user.toLowerCase();

        if (!userMap.has(userAddress)) {
          userMap.set(userAddress, {
            address: user,
            degrees: [],
            issuers: [],
            timestamps: [],
          });
        }

        const userData = userMap.get(userAddress);
        userData.degrees.push(degreeName);
        userData.issuers.push(issuer);
        userData.timestamps.push(Number(timestamp));
      }

      // Convert to candidate profiles
      const candidateProfiles: CandidateProfile[] = Array.from(userMap.values()).map((userData) => {
        const trustScore = generateTrustScore(userData.address);
        const confidence = trustScore >= 90 ? 'High' : trustScore >= 75 ? 'Medium' : 'Low';
        
        return {
          address: userData.address,
          isVerified: true,
          degrees: userData.degrees,
          issuerConfidence: confidence,
          mintDate: userData.timestamps.length > 0 
            ? new Date(userData.timestamps[0] * 1000).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })
            : null,
          credentialCount: userData.degrees.length,
          activeCredentials: userData.degrees.length,
          trustScore,
        };
      });

      setCandidates(candidateProfiles);
      setFilteredCandidates(candidateProfiles);
    } catch (err) {
      console.error('Error fetching candidates:', err);
      setError('Failed to load candidates from blockchain');
    } finally {
      setIsLoadingCandidates(false);
    }
  };

  // Generate deterministic trust score from address
  const generateTrustScore = (address: string): number => {
    const hash = parseInt(address.slice(-4), 16);
    return (hash % 20) + 80; // Score between 80-99
  };

  const handleSearch = () => {
    if (!searchAddress.trim()) {
      setFilteredCandidates(candidates);
      setError('');
      return;
    }

    const query = searchAddress.toLowerCase();
    
    // Filter by address or degree
    const filtered = candidates.filter(candidate => 
      candidate.address.toLowerCase().includes(query) ||
      candidate.degrees.some(degree => degree.toLowerCase().includes(query))
    );

    if (filtered.length === 0) {
      setError('No candidates found matching your search');
    } else {
      setError('');
    }

    setFilteredCandidates(filtered);
  };

  // Mock data for stats (can be replaced with real contract data)
  const globalStats = {
    activeCandidates: candidates.length,
    verifiedBlocks: candidates.reduce((sum, c) => sum + c.credentialCount, 0),
    networkTrust: candidates.length > 0 
      ? (candidates.reduce((sum, c) => sum + c.trustScore, 0) / candidates.length).toFixed(1)
      : 99.8
  };

  return (
    <div ref={containerRef} className="min-h-screen bg-void relative overflow-x-hidden">
      {/* Subtle Aurora Background */}
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] opacity-10 pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.3) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-void/50 to-void pointer-events-none" style={{ zIndex: 1 }} />
      
      {/* Header - The "God View" */}
      <motion.div 
        style={{ opacity: headerOpacity }}
        className="relative z-10 border-b border-white/5"
      >
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex items-start justify-between mb-12">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-5xl font-serif text-white tracking-tight mb-4">Global Talent Index.</h1>
              <p className="text-sm font-mono text-luxury-gold uppercase tracking-[0.3em]">
                Search the verified ledger for sovereign human capital.
              </p>
            </motion.div>
            <motion.a
              href="/"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex items-center gap-2 text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
            >
              <Home className="w-4 h-4" />
              Exit
            </motion.a>
          </div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="glass-panel p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-luxury-gold" />
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Active Candidates</p>
              </div>
              <p className="text-4xl font-serif text-white">
                {isLoadingCandidates ? '...' : globalStats.activeCandidates.toLocaleString()}
              </p>
            </div>
            <div className="glass-panel p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <Database className="w-5 h-5 text-luxury-gold" />
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Verified Blocks</p>
              </div>
              <p className="text-4xl font-serif text-white">
                {isLoadingCandidates ? '...' : globalStats.verifiedBlocks.toLocaleString()}
              </p>
            </div>
            <div className="glass-panel p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="w-5 h-5 text-luxury-gold" />
                <p className="text-xs font-mono text-gray-400 uppercase tracking-wider">Network Trust</p>
              </div>
              <p className="text-4xl font-serif text-white">{globalStats.networkTrust}%</p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        {/* Command Palette Search */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by Skill, Degree, or DID..."
                value={searchAddress}
                onChange={(e) => setSearchAddress(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="pl-16 pr-6 h-16 text-lg font-sans tracking-tight rounded-lg border-2 border-white/10 bg-black/80 text-white placeholder:text-gray-500 focus:ring-2 focus:ring-luxury-gold focus:border-luxury-gold transition-all duration-300"
              />
            </div>
            <div className="flex justify-center mt-6">
              <Button
                onClick={handleSearch}
                disabled={isLoadingCandidates}
                className="h-14 px-10 bg-luxury-gold hover:bg-luxury-gold/90 text-void text-base font-semibold rounded-lg transition-all duration-500 group"
              >
                {isLoadingCandidates ? 'Loading Ledger...' : (
                  <>
                    Search Talent
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-center text-sm text-red-400 font-sans tracking-tight"
              >
                {error}
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Results Grid - Identity Cards */}
        <AnimatePresence mode="wait">
          {!isLoadingCandidates && filteredCandidates.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-2xl font-serif text-white mb-8 text-center">
                {filteredCandidates.length} Verified {filteredCandidates.length === 1 ? 'Identity' : 'Identities'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.address}
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="glass-panel p-8 rounded-xl hover:shadow-2xl hover:shadow-luxury-gold/20 transition-all duration-500 relative overflow-hidden"
                  >
                    {/* Passport Style Card */}
                    <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                      <div className="w-full h-full" style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)`,
                      }}></div>
                    </div>

                    {/* Avatar with Verified Badge */}
                    <div className="flex justify-center mb-6">
                      <div className="relative">
                        <img 
                          src={`https://source.boringavatars.com/beam/120/${candidate.address}?colors=D4AF37,1a1a1a,8B5CF6,ffffff,6366f1`}
                          alt="Avatar"
                          className="w-24 h-24 rounded-full"
                        />
                        {candidate.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-luxury-gold flex items-center justify-center border-4 border-void">
                            <CheckCircle2 className="w-4 h-4 text-void" />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Name */}
                    <div className="text-center mb-6">
                      <h3 className="text-xl font-serif text-white mb-2">Verified Talent</h3>
                      <p className="text-xs font-mono text-gray-400 break-all">
                        {candidate.address.slice(0, 10)}...{candidate.address.slice(-8)}
                      </p>
                    </div>

                    {/* Primary Skill Tag */}
                    <div className="flex justify-center mb-6">
                      <Badge className="px-4 py-2 bg-luxury-gold/20 text-luxury-gold border border-luxury-gold/30 font-mono text-xs uppercase tracking-wider">
                        {candidate.degrees[0]?.split(' ')[0] || 'Verified'}
                      </Badge>
                    </div>

                    {/* Trust Score Radial */}
                    <div className="mb-6">
                      <div className="flex justify-center mb-3">
                        <svg className="w-28 h-28 -rotate-90">
                          <circle
                            cx="56"
                            cy="56"
                            r="50"
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth="6"
                            fill="none"
                          />
                          <circle
                            cx="56"
                            cy="56"
                            r="50"
                            stroke="#D4AF37"
                            strokeWidth="6"
                            fill="none"
                            strokeDasharray={`${2 * Math.PI * 50}`}
                            strokeDashoffset={`${2 * Math.PI * 50 * (1 - candidate.trustScore / 100)}`}
                            strokeLinecap="round"
                            className="transition-all duration-1000"
                          />
                          <text
                            x="56"
                            y="56"
                            textAnchor="middle"
                            dy="0.3em"
                            className="text-2xl font-serif fill-white rotate-90"
                            transform="rotate(90 56 56)"
                          >
                            {candidate.trustScore}%
                          </text>
                        </svg>
                      </div>
                      <p className="text-center text-xs font-mono text-gray-400 uppercase tracking-wider">Trust Score</p>
                    </div>

                    {/* Stats */}
                    <div className="space-y-3 pt-6 border-t border-white/10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Credentials</span>
                        <span className="text-lg font-serif text-white">{candidate.credentialCount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Active</span>
                        <span className="text-lg font-serif text-luxury-gold">{candidate.activeCredentials}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Confidence</span>
                        <Badge
                          className={`px-3 py-1 rounded-md font-mono text-xs uppercase tracking-wider ${
                            candidate.issuerConfidence === 'High'
                              ? 'bg-luxury-gold/20 text-luxury-gold border-luxury-gold/30'
                              : candidate.issuerConfidence === 'Medium'
                              ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                              : 'bg-white/10 text-gray-400 border-white/20'
                          }`}
                        >
                          {candidate.issuerConfidence}
                        </Badge>
                      </div>
                    </div>

                    {/* Degrees List */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <p className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3">Credentials</p>
                      <div className="space-y-2">
                        {candidate.degrees.slice(0, 2).map((degree, idx) => (
                          <div key={idx} className="flex items-start gap-2">
                            <Award className="w-4 h-4 text-luxury-gold mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-white font-sans leading-tight">{degree}</p>
                          </div>
                        ))}
                        {candidate.degrees.length > 2 && (
                          <p className="text-xs text-gray-500 font-mono">+{candidate.degrees.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty State */}
        {!isLoadingCandidates && filteredCandidates.length === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="glass-panel p-16 text-center rounded-xl"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-3xl font-serif text-white mb-4">No Records Found</h3>
            <p className="text-gray-400 font-mono text-sm tracking-tight max-w-md mx-auto">
              {candidates.length === 0 
                ? 'The ledger is empty. No credentials have been minted yet.'
                : 'No candidates match your search criteria. Try a different query.'}
            </p>
          </motion.div>
        )}

        {/* Loading State */}
        {isLoadingCandidates && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass-panel p-16 text-center rounded-xl"
          >
            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Database className="w-10 h-10 text-luxury-gold animate-pulse" />
            </div>
            <h3 className="text-3xl font-serif text-white mb-4">Scanning Ledger...</h3>
            <p className="text-gray-400 font-mono text-sm tracking-tight max-w-md mx-auto">
              Reading verified credentials from the blockchain.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

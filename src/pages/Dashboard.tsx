import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Search } from 'lucide-react';
import { WalletButton } from '@/components/WalletButton';
import { useAccount, useDisconnect } from 'wagmi';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { ShadowMintModal } from '@/components/ShadowMintModal';
import { CredentialDetailsModal } from '@/components/CredentialDetailsModal';
import { InfoTooltip } from '@/components/InfoTooltip';

type Credential = {
  id: string;
  date: string;
  issuer: string;
  degree: string;
  status: 'active' | 'pending' | 'verified';
  txHash?: string;
  proofData?: any;
  isDemo?: boolean;
};

const DEMO_CREDENTIALS: Credential[] = [
  {
    id: 'demo-1',
    date: '2024.03.15',
    issuer: 'Stanford University',
    degree: 'CS Demo',
    status: 'verified',
    isDemo: true,
    proofData: { demo: true, note: 'This is demonstration data' },
  },
  {
    id: 'demo-2',
    date: '2024.01.08',
    issuer: 'Stanford University',
    degree: 'CS Demo',
    status: 'verified',
    isDemo: true,
    proofData: { demo: true, note: 'This is demonstration data' },
  },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('credentials');
  const [agentActive, setAgentActive] = useState(false);
  const [publicVisibility, setPublicVisibility] = useState(false);
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();
  const navigate = useNavigate();
  const [isLoadingCredentials] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);
  const [selectedCredential, setSelectedCredential] = useState<Credential | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [realCredentials] = useState<Credential[]>([]); // TODO: Replace with actual blockchain data

  // Inject demo data if no real credentials exist
  const credentials = realCredentials.length === 0 ? DEMO_CREDENTIALS : realCredentials;

  // Filter credentials based on search query
  const filteredCredentials = useMemo(() => {
    if (!searchQuery.trim()) return credentials;
    const query = searchQuery.toLowerCase();
    return credentials.filter(
      (cred) =>
        cred.issuer.toLowerCase().includes(query) ||
        cred.degree.toLowerCase().includes(query)
    );
  }, [credentials, searchQuery]);

  return (
    <div className="min-h-screen bg-[#020202] flex">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-6 focus:py-3 focus:bg-[#D4AF37] focus:text-black focus:font-semibold focus:rounded-md focus:shadow-lg"
      >
        Skip to main content
      </a>
      {/* Fixed Sidebar */}
      <aside className="w-64 bg-[#0A0A0A] border-r border-white/10 fixed left-0 top-0 h-screen flex flex-col">
        <div className="p-8 border-b border-white/10">
          <Link to="/" className="block hover:opacity-80 transition-opacity">
            <h1 className="text-white font-serif text-2xl" style={{ fontFamily: 'Playfair Display, serif' }}>
              Private Ledger
            </h1>
          </Link>
        </div>
        
        <nav className="flex-1 p-6 space-y-2">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`w-full text-left flex items-center gap-2 font-mono text-xs uppercase tracking-wider py-2 transition-colors cursor-pointer ${
              activeTab === 'credentials' ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
            aria-label="Navigate to credentials view"
            aria-current={activeTab === 'credentials' ? 'page' : undefined}
          >
            {activeTab === 'credentials' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />}
            Credentials
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-full text-left flex items-center gap-2 font-mono text-xs uppercase tracking-wider py-2 transition-colors cursor-pointer ${
              activeTab === 'history' ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
            aria-label="Navigate to transaction history"
            aria-current={activeTab === 'history' ? 'page' : undefined}
          >
            {activeTab === 'history' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />}
            History
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full text-left flex items-center gap-2 font-mono text-xs uppercase tracking-wider py-2 transition-colors cursor-pointer ${
              activeTab === 'settings' ? 'text-white' : 'text-gray-500 hover:text-white'
            }`}
            aria-label="Navigate to settings"
            aria-current={activeTab === 'settings' ? 'page' : undefined}
          >
            {activeTab === 'settings' && <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" aria-hidden="true" />}
            Settings
          </button>
          <Link
            to="/talent-scout"
            className="w-full text-left flex items-center gap-2 font-mono text-xs uppercase tracking-wider py-2 text-gray-500 hover:text-white transition-colors cursor-pointer"
            aria-label="Navigate to talent search"
          >
            Talent Search
          </Link>
        </nav>

        <div className="mt-auto">
          <div className="p-6 border-t border-white/10">
            {isConnected ? (
              <>
                <p className="text-white/40 font-mono text-xs">
                  Connected
                </p>
                <a
                  href={`https://amoy.polygonscan.com/address/${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white/60 font-mono text-xs mt-1 truncate block hover:underline cursor-pointer"
                >
                  {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                </a>
              </>
            ) : (
              <p className="text-white/40 font-mono text-xs uppercase tracking-wider">
                Offline Mode
              </p>
            )}
          </div>
          
          <div className="p-6 border-t border-white/10">
            <button
              type="button"
              onClick={async () => {
                toast.loading('Exiting protocol...', { id: 'exit' });
                await disconnect();
                toast.dismiss('exit');
                toast.success('Session terminated');
                navigate('/');
              }}
              className="flex items-center gap-2 text-xs font-mono text-red-400 hover:text-red-300 transition-colors uppercase tracking-widest cursor-pointer bg-transparent border-none relative z-50"
            >
              <LogOut className="w-3 h-3" />
              Exit Protocol
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main id="main-content" className="flex-1 ml-64">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#020202] sticky top-0 z-10">
          <div className="px-12 py-6 flex items-center justify-between">
            <div>
              <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-2">
                Academic Registry
              </p>
              <h2 className="text-white font-serif text-3xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                {activeTab === 'credentials' && 'Verified Credentials'}
                {activeTab === 'history' && 'Transaction Log'}
                {activeTab === 'settings' && 'Control Panel'}
              </h2>
            </div>

            <div className="flex items-center gap-4">
              {activeTab === 'credentials' && (
                <button
                  onClick={() => setAgentActive(!agentActive)}
                  className="text-white/60 hover:text-white font-mono text-xs uppercase tracking-wider transition-colors cursor-pointer"
                  aria-label={`Agent access is currently ${agentActive ? 'enabled' : 'disabled'}. Click to ${agentActive ? 'disable' : 'enable'}`}
                  aria-pressed={agentActive}
                >
                  Activate Agent [{agentActive ? 'ON' : 'OFF'}]
                </button>
              )}
              <WalletButton />
            </div>
          </div>
        </header>

        {/* Modals */}
        <ShadowMintModal open={isMintModalOpen} onOpenChange={setIsMintModalOpen} />
        <CredentialDetailsModal
          credential={selectedCredential}
          open={isDetailsModalOpen}
          onOpenChange={setIsDetailsModalOpen}
        />

        {/* Content Views */}
        <div className="px-12 py-12">
          {/* Credentials View */}
          {activeTab === 'credentials' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Action Bar */}
              <div className="flex items-center justify-between mb-8 gap-4">
                {/* Search Input */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                  <input
                    type="text"
                    placeholder="Filter by Issuer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 text-white placeholder:text-white/40 font-mono text-sm focus:outline-none focus:border-white/20 transition-colors"
                  />
                </div>

                {/* Shadow Mint Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsMintModalOpen(true)}
                    className="px-6 py-2.5 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors font-mono text-xs uppercase tracking-wider"
                  >
                    Shadow Mint
                  </button>
                  <InfoTooltip content="Generate ZK-TLS proofs from your university portal without revealing login details." />
                </div>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-8 pb-4 border-b border-white/10">
                <div className="col-span-2">
                  <p className="text-white/40 font-mono text-xs uppercase tracking-wider">
                    Date
                  </p>
                </div>
                <div className="col-span-7">
                  <p className="text-white/40 font-mono text-xs uppercase tracking-wider">
                    Issuer
                  </p>
                </div>
                <div className="col-span-3">
                  <p className="text-white/40 font-mono text-xs uppercase tracking-wider">
                    Status
                  </p>
                </div>
              </div>

              {/* Loading Skeletons */}
              {isLoadingCredentials ? (
                <div className="divide-y divide-white/5">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="grid grid-cols-12 gap-8 py-6">
                      <div className="col-span-2">
                        <Skeleton className="h-5 w-20" />
                      </div>
                      <div className="col-span-7 space-y-2">
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64" />
                      </div>
                      <div className="col-span-3">
                        <Skeleton className="h-5 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredCredentials.length === 0 ? (
                /* Empty Search State */
                <div className="py-24 text-center">
                  <p className="text-white/60 font-serif text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                    {searchQuery ? 'No credentials match your search.' : 'The ledger awaits its first sovereign credential.'}
                  </p>
                </div>
              ) : (
                /* Table Rows */
                <div className="divide-y divide-white/5">
                  {filteredCredentials.map((credential, index) => (
                  <motion.div
                    key={credential.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    onClick={() => {
                      setSelectedCredential(credential);
                      setIsDetailsModalOpen(true);
                    }}
                    className="grid grid-cols-12 gap-8 py-6 hover:bg-white/[0.02] transition-colors cursor-pointer"
                  >
                    {/* Date */}
                    <div className="col-span-2">
                      <p className="text-white/60 font-mono text-sm">
                        {credential.date}
                      </p>
                    </div>

                    {/* Issuer & Degree */}
                    <div className="col-span-7">
                      <div className="flex items-center gap-2">
                        <p className="text-white font-serif text-lg" style={{ fontFamily: 'Playfair Display, serif' }}>
                          {credential.issuer}
                        </p>
                        {credential.isDemo && (
                          <span className="px-2 py-0.5 bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] font-mono text-[10px] uppercase tracking-wider">
                            Demo Data
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 font-mono text-xs mt-1">
                        {credential.degree}
                      </p>
                    </div>

                    {/* Status */}
                    <div className="col-span-3 flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        credential.status === 'verified' ? 'bg-[#D4AF37]' : 
                        credential.status === 'active' ? 'bg-[#D4AF37]' : 
                        'bg-white/40'
                      }`} />
                      <p className="text-white/60 font-mono text-xs uppercase tracking-wider">
                        {credential.status}
                      </p>
                    </div>
                  </motion.div>
                  ))}
                </div>
              )}


            </motion.div>
          )}

          {/* History View */}
          {activeTab === 'history' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-4 py-3 border-b border-white/5">
                  <p className="text-white/60 font-mono text-sm">
                    2024-11-28 14:30
                  </p>
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm">
                      SHADOW_MINT_INITIATED
                    </p>
                    <p className="text-yellow-500 font-mono text-xs mt-1">
                      Pending
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3 border-b border-white/5">
                  <p className="text-white/60 font-mono text-sm">
                    2024-11-28 14:32
                  </p>
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm">
                      TLS_PROOF_VERIFIED
                    </p>
                    <p className="text-[#D4AF37] font-mono text-xs mt-1">
                      Success
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3 border-b border-white/5">
                  <p className="text-white/60 font-mono text-sm">
                    2024-11-27 09:15
                  </p>
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm">
                      CREDENTIAL_MINTED
                    </p>
                    <p className="text-[#D4AF37] font-mono text-xs mt-1">
                      Success
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 py-3 border-b border-white/5">
                  <p className="text-white/60 font-mono text-sm">
                    2024-11-26 16:42
                  </p>
                  <div className="flex-1">
                    <p className="text-white font-mono text-sm">
                      WALLET_CONNECTED
                    </p>
                    <p className="text-[#D4AF37] font-mono text-xs mt-1">
                      Success
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Settings View */}
          {activeTab === 'settings' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl space-y-8"
            >
              {/* Agent Access Toggle */}
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <p className="text-white font-mono text-sm uppercase tracking-wider">
                    Agent Access
                  </p>
                  <p className="text-white/40 font-mono text-xs mt-1">
                    Allow AI agents to access your credentials
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAgentActive(!agentActive);
                    toast.success(agentActive ? 'Agent access disabled' : 'Agent access enabled');
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                    agentActive ? 'bg-[#D4AF37]' : 'bg-white/10'
                  }`}
                  role="switch"
                  aria-checked={agentActive}
                  aria-label="Toggle agent access"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      agentActive ? 'translate-x-8' : 'translate-x-1'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Public Visibility Toggle */}
              <div className="flex items-center justify-between py-4 border-b border-white/10">
                <div>
                  <p className="text-white font-mono text-sm uppercase tracking-wider">
                    Public Visibility
                  </p>
                  <p className="text-white/40 font-mono text-xs mt-1">
                    Make your credentials publicly viewable
                  </p>
                </div>
                <button
                  onClick={() => {
                    setPublicVisibility(!publicVisibility);
                    toast.success(publicVisibility ? 'Credentials now private' : 'Credentials now public');
                  }}
                  className={`relative w-14 h-7 rounded-full transition-colors cursor-pointer ${
                    publicVisibility ? 'bg-[#D4AF37]' : 'bg-white/10'
                  }`}
                  role="switch"
                  aria-checked={publicVisibility}
                  aria-label="Toggle public visibility of credentials"
                >
                  <div
                    className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${
                      publicVisibility ? 'translate-x-8' : 'translate-x-1'
                    }`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {/* Disconnect Wallet */}
              <div className="pt-8">
                <button
                  onClick={async () => {
                    toast.loading('Disconnecting...', { id: 'disconnect' });
                    await disconnect();
                    toast.dismiss('disconnect');
                    toast.success('Wallet disconnected');
                    navigate('/');
                  }}
                  className="px-6 py-3 bg-red-900/20 border border-red-500/30 text-red-400 font-mono text-xs uppercase tracking-wider hover:bg-red-900/30 transition-colors cursor-pointer"
                  aria-label="Disconnect wallet and return to home"
                >
                  Disconnect Wallet
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}

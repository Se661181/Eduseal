import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Credential {
  id: string;
  date: string;
  issuer: string;
  degree: string;
  status: 'active' | 'pending' | 'verified';
  txHash?: string;
  proofData?: any;
}

interface CredentialDetailsModalProps {
  credential: Credential | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CredentialDetailsModal({ credential, open, onOpenChange }: CredentialDetailsModalProps) {
  if (!credential) return null;

  const polygonscanUrl = credential.txHash 
    ? `https://amoy.polygonscan.com/tx/${credential.txHash}`
    : `https://amoy.polygonscan.com`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#0A0A0A] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Credential Details
          </DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 mt-4"
        >
          {/* Credential Info */}
          <div className="space-y-4 border-b border-white/10 pb-6">
            <div>
              <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Issuer</p>
              <p className="text-white font-serif text-xl" style={{ fontFamily: 'Playfair Display, serif' }}>
                {credential.issuer}
              </p>
            </div>
            
            <div>
              <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Degree</p>
              <p className="text-white/80 font-mono text-sm">{credential.degree}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Date Issued</p>
                <p className="text-white/80 font-mono text-sm">{credential.date}</p>
              </div>
              
              <div>
                <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    credential.status === 'verified' ? 'bg-[#D4AF37]' : 
                    credential.status === 'active' ? 'bg-[#D4AF37]' : 
                    'bg-white/40'
                  }`} />
                  <p className="text-white/80 font-mono text-xs uppercase tracking-wider">
                    {credential.status}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Proof Data */}
          {credential.proofData && (
            <div>
              <p className="text-white/40 font-mono text-xs uppercase tracking-wider mb-3">Raw Proof Data</p>
              <div className="bg-black/40 border border-white/5 p-4 rounded-sm max-h-64 overflow-y-auto">
                <pre className="text-white/60 font-mono text-xs whitespace-pre-wrap break-all">
                  {JSON.stringify(credential.proofData, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Polygonscan Link */}
          <div className="pt-4">
            <a
              href={polygonscanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors font-mono text-xs uppercase tracking-wider"
            >
              View on Polygonscan
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

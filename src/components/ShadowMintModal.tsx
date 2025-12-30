import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShadowMint } from '@/components/ShadowMint';

interface ShadowMintModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShadowMintModal({ open, onOpenChange }: ShadowMintModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-[#0A0A0A] border border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-serif text-white" style={{ fontFamily: 'Playfair Display, serif' }}>
            Shadow Mint Protocol
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          <ShadowMint />
        </div>
      </DialogContent>
    </Dialog>
  );
}

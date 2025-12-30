import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, TrendingUp, Shield, Zap } from 'lucide-react';

export function OverlayUI() {
  return (
    <div className="relative z-10 w-full h-screen pointer-events-none">
      {/* Logo - Top Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="absolute top-8 left-8"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-luxury-gold/10 border border-luxury-gold/30 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-luxury-gold" />
          </div>
          <h2 className="text-white font-serif font-semibold text-2xl tracking-tight">
            NEXUS
          </h2>
        </div>
      </motion.div>

      {/* Hero Section - Center */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center max-w-5xl px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass-panel mb-8 pointer-events-auto border-luxury-gold/20">
              <Shield className="w-4 h-4 text-luxury-gold" />
              <span className="text-sm text-white/90 font-medium">Enterprise-Grade Security</span>
            </div>
            
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-serif font-semibold text-white mb-8 tracking-tight leading-none">
              Wealth
              <br />
              <span className="text-luxury-gold">Reimagined</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Experience the future of premium financial services. 
              Where sophistication meets innovation.
            </p>
            
            <div className="flex items-center justify-center gap-4">
              <Button
                className="pointer-events-auto bg-luxury-gold hover:bg-luxury-gold/90 text-void border-0 px-10 py-7 text-lg font-semibold group shadow-2xl shadow-luxury-gold/20"
                size="lg"
              >
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button
                variant="outline"
                className="pointer-events-auto glass-panel border-luxury-gold/30 text-white hover:bg-white/10 px-10 py-7 text-lg"
                size="lg"
              >
                Explore Features
              </Button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Feature Cards - Bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-6xl px-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="glass-panel rounded-2xl p-6 pointer-events-auto border-luxury-gold/20 hover:border-luxury-gold/40 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-gold/20 transition-colors">
                <TrendingUp className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <div className="text-2xl font-serif font-semibold text-white mb-1">$2.4B+</div>
                <div className="text-sm text-white/60">Assets Under Management</div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 pointer-events-auto border-luxury-gold/20 hover:border-luxury-gold/40 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-gold/20 transition-colors">
                <Shield className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <div className="text-2xl font-serif font-semibold text-white mb-1">Bank-Level</div>
                <div className="text-sm text-white/60">Security & Encryption</div>
              </div>
            </div>
          </div>
          
          <div className="glass-panel rounded-2xl p-6 pointer-events-auto border-luxury-gold/20 hover:border-luxury-gold/40 transition-all group">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-luxury-gold/10 flex items-center justify-center flex-shrink-0 group-hover:bg-luxury-gold/20 transition-colors">
                <Zap className="w-6 h-6 text-luxury-gold" />
              </div>
              <div>
                <div className="text-2xl font-serif font-semibold text-white mb-1">Instant</div>
                <div className="text-sm text-white/60">Transaction Processing</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { Shield, Zap, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WalletButton } from '@/components/WalletButton';

const Index = () => {
  return (
    <main className="min-h-screen w-full bg-[#020202] relative overflow-hidden">
      {/* Aurora Blob - Bottom Right */}
      <div className="fixed bottom-0 right-0 w-[800px] h-[800px] opacity-20 pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-full h-full rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(0, 0, 0, 0) 70%)',
            filter: 'blur(80px)',
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 right-0 z-50 p-8 relative">
        <div className="flex items-center gap-8">
          <a 
            href="#manifesto"
            className="text-white/60 hover:text-white hover:opacity-80 transition-all text-sm tracking-widest uppercase font-mono cursor-pointer">
            Manifesto
          </a>
          <Link 
            to="/dashboard"
            className="text-white/60 hover:text-white hover:opacity-80 transition-all text-sm tracking-widest uppercase font-mono cursor-pointer"
          >
            Dashboard
          </Link>
          <Link 
            to="/talent-scout"
            className="text-xs font-mono text-gray-500 hover:text-white uppercase tracking-widest transition-colors cursor-pointer"
          >
            For Recruiters
          </Link>
          <WalletButton />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center relative z-50">
        {/* Vertical Divider */}
        <div className="absolute left-1/3 top-0 bottom-0 w-px bg-white/10" />

        <div className="container mx-auto px-12 py-20">
          <div className="max-w-4xl">
            {/* Label */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="mb-12"
            >
              <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-mono">
                EST. 2025 // PROTOCOL V1
              </p>
            </motion.div>

            {/* Main Headline */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="mb-16"
            >
              <h1 className="text-[clamp(4rem,12vw,10rem)] font-serif leading-[0.9] text-white text-left">
                Sovereignty
              </h1>
              <h1 className="text-[clamp(4rem,12vw,10rem)] font-serif italic leading-[0.9] text-white text-left">
                Verified
              </h1>
            </motion.div>

            {/* Subtext */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="text-white/60 text-lg max-w-xl mb-12 font-light leading-relaxed"
            >
              The verifiable credential layer for the sovereign individual. 
              Academic proof without institutional gatekeeping.
            </motion.p>

            {/* CTA */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="flex items-center gap-6"
            >
              <Link 
                to="/dashboard"
                className="group flex items-center gap-3 text-white hover:text-[#D4AF37] hover:opacity-80 transition-all cursor-pointer">
                <span className="text-sm tracking-widest uppercase font-mono">Enter Protocol</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Glass Bento Grid - Features */}
      <section className="relative z-10 container mx-auto px-12 py-32">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Feature 1 - Shadow Mint */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-all"
          >
            <div className="mb-6">
              <Shield className="w-8 h-8 text-[#D4AF37] mb-4" />
              <h3 className="text-2xl font-serif text-white mb-3">Shadow Mint</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Zero-knowledge credential minting. Your proof, your privacy.
              </p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-mono">
                Reclaim Protocol
              </p>
            </div>
          </motion.div>

          {/* Feature 2 - Agent API */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-all"
          >
            <div className="mb-6">
              <Zap className="w-8 h-8 text-[#D4AF37] mb-4" />
              <h3 className="text-2xl font-serif text-white mb-3">Agent API</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                AI-powered verification. Autonomous credential validation.
              </p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-mono">
                Eliza Framework
              </p>
            </div>
          </motion.div>

          {/* Feature 3 - On-Chain Proof */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-lg p-8 backdrop-blur-sm hover:bg-white/[0.07] transition-all"
          >
            <div className="mb-6">
              <Lock className="w-8 h-8 text-[#D4AF37] mb-4" />
              <h3 className="text-2xl font-serif text-white mb-3">Immutable</h3>
              <p className="text-white/50 text-sm leading-relaxed">
                Permanent, tamper-proof records on Polygon blockchain.
              </p>
            </div>
            <div className="pt-6 border-t border-white/10">
              <p className="text-[#D4AF37] text-xs tracking-[0.2em] uppercase font-mono">
                EVM Compatible
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* The Manifesto Section */}
      <section id="manifesto" className="relative z-10 container mx-auto px-12 py-32">
        <div className="max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          >
            <p className="text-[#D4AF37] text-xs tracking-[0.3em] uppercase font-mono mb-8">
              The Thesis
            </p>
            <h2 className="text-5xl font-serif text-white mb-8 leading-tight">
              Academic credentials should be{' '}
              <span className="italic">sovereign</span>, not institutional.
            </h2>
            <p className="text-white/60 text-lg leading-relaxed mb-6">
              Universities control your proof of education. They can revoke it, 
              lose it, or charge you to access it. This is not sovereignty.
            </p>
            <p className="text-white/60 text-lg leading-relaxed">
              EduSeal puts credentials on-chain with zero-knowledge proofs. 
              You own your academic identity. Forever.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-50 border-t border-white/10 py-12">
        <div className="container mx-auto px-12">
          <div className="flex items-center justify-between">
            <p className="text-white/40 text-xs tracking-[0.2em] uppercase font-mono">
              © 2025 EduSeal Protocol
            </p>
            <div className="flex items-center gap-8">
              <a 
                href="https://docs.eduseal.xyz"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white hover:opacity-80 transition-all text-xs tracking-[0.2em] uppercase font-mono cursor-pointer">
                Docs
              </a>
              <a 
                href="https://github.com/eduseal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white hover:opacity-80 transition-all text-xs tracking-[0.2em] uppercase font-mono cursor-pointer">
                GitHub
              </a>
              <a 
                href="https://twitter.com/eduseal"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/40 hover:text-white hover:opacity-80 transition-all text-xs tracking-[0.2em] uppercase font-mono cursor-pointer">
                Twitter
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Index;

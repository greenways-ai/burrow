'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Shield, Lock, MessageSquare, Wallet, Fingerprint, Scan, CheckCircle } from '@/components/icons';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Fingerprint className="w-6 h-6 text-accent" />
            <span className="text-lg font-bold tracking-wider">BURROW</span>
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <ConnectButton 
              showBalance={false}
              chainStatus="none"
              accountStatus="address"
            />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col">
        {/* Main Hero */}
        <section className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />
          
          <div className="text-center max-w-4xl mx-auto relative z-10">
            {/* Status Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/30 rounded-full mb-8">
              <span className="w-2 h-2 bg-accent rounded-full animate-pulse" />
              <span className="text-xs font-medium tracking-widest uppercase text-accent">Secure Forensic Engine</span>
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-black mb-6 leading-tight">
              <span className="text-white">PRIVATE CONTENT</span>
              <br />
              <span className="text-accent">FORENSICS.</span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto">
              End-to-end encrypted AI conversations. Your data never leaves your control. 
              Verified. Secured. Private.
            </p>

            {isConnected ? (
              <Link
                href="/chat"
                className="inline-flex items-center gap-3 px-8 py-4 bg-accent hover:bg-accent-dark text-white font-semibold text-lg transition-all glow-red"
              >
                <Scan className="w-5 h-5" />
                <span>Initialize Secure Chat</span>
              </Link>
            ) : (
              <div className="space-y-4">
                <ConnectButton 
                  showBalance={false}
                  chainStatus="none"
                  accountStatus="full"
                />
              </div>
            )}
          </div>
        </section>

        {/* Feature Cards */}
        <section className="py-20 border-t border-border bg-surface">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-3 gap-6">
              <FeatureCard
                icon={<Fingerprint className="w-8 h-8 text-accent" />}
                label="Integrity Check"
                title="Zero-Knowledge Verification"
                description="Messages encrypted with wallet-derived keys. No one can read your conversations—not even us."
                metric="100%"
                metricLabel="Privacy"
              />
              <FeatureCard
                icon={<Scan className="w-8 h-8 text-accent" />}
                label="Forensic Hash"
                title="Authentic Conversations"
                description="Every message is cryptographically signed. Verify authenticity with blockchain-grade security."
                metric="VALID"
                metricLabel="Status"
              />
              <FeatureCard
                icon={<CheckCircle className="w-8 h-8 text-accent" />}
                label="Secure Protocol"
                title="Verify With Privacy"
                description="Access your encrypted history from any device. Just connect your wallet—no passwords needed."
                metric="VERIFIED"
                metricLabel="Access"
              />
            </div>
          </div>
        </section>

        {/* Tags Section */}
        <section className="py-12 border-t border-border">
          <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center gap-4">
            <Tag label="#ENCRYPTION" />
            <Tag label="#PRIVACY" />
            <Tag label="#WALLET" />
            <Tag label="#SECURITY" />
            <Tag label="#AI" />
            <Tag label="#BLOCKCHAIN" />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-text-muted text-sm">
          <p>BURROW — Private by design. Encrypted by default.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  label,
  title,
  description,
  metric,
  metricLabel,
}: { 
  icon: React.ReactNode; 
  label: string;
  title: string;
  description: string;
  metric: string;
  metricLabel: string;
}) {
  return (
    <div className="p-8 bg-black border border-border hover:border-accent/50 transition-all group">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium tracking-widest uppercase text-text-muted">{label}</span>
      </div>
      <div className="mb-6">{icon}</div>
      <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
      <p className="text-text-secondary text-sm mb-6 leading-relaxed">{description}</p>
      <div className="pt-6 border-t border-border">
        <div className="text-3xl font-black text-accent">{metric}</div>
        <div className="text-xs text-text-muted uppercase tracking-wider mt-1">{metricLabel}</div>
      </div>
    </div>
  );
}

function Tag({ label }: { label: string }) {
  return (
    <span className="px-4 py-2 border border-border text-text-muted text-xs font-medium tracking-wider hover:border-accent hover:text-accent transition-colors cursor-default">
      {label}
    </span>
  );
}

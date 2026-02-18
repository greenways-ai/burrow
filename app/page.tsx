'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { Shield, Lock, MessageSquare, Wallet } from '@/components/icons';

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-burrow-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold">Burrow</span>
          </div>
          <ConnectButton 
            showBalance={false}
            chainStatus="none"
            accountStatus="address"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Hero Section */}
        <section className="flex-1 flex flex-col items-center justify-center px-4 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-burrow-900/50 border border-burrow-700/50 mb-8">
              <Lock className="w-4 h-4 text-burrow-400" />
              <span className="text-sm text-burrow-300">End-to-End Encrypted</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Private AI Conversations
            </h1>
            
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Chat with AI using your wallet. Your conversations are encrypted with keys 
              only you control. No one else can read your messages—not even us.
            </p>

            {isConnected ? (
              <Link
                href="/chat"
                className="inline-flex items-center space-x-3 px-8 py-4 bg-burrow-500 hover:bg-burrow-600 text-white rounded-xl font-semibold text-lg transition-colors"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Start Chatting</span>
              </Link>
            ) : (
              <div className="space-y-4">
                <p className="text-gray-500 mb-4">
                  Connect your wallet to get started
                </p>
                <ConnectButton 
                  showBalance={false}
                  chainStatus="none"
                  accountStatus="full"
                />
              </div>
            )}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Wallet className="w-6 h-6 text-burrow-400" />}
                title="Wallet-Based"
                description="Use any Ethereum wallet. Your private key never leaves your device."
              />
              <FeatureCard
                icon={<Lock className="w-6 h-6 text-burrow-400" />}
                title="True Privacy"
                description="Messages encrypted with AES-256-GCM using keys derived from your signature."
              />
              <FeatureCard
                icon={<Shield className="w-6 h-6 text-burrow-400" />}
                title="Zero Knowledge"
                description="Server only stores encrypted blobs. Only you can decrypt your conversations."
              />
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          <p>Burrow - Private by design. Encrypted by default.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="p-6 rounded-2xl bg-gray-900/50 border border-gray-800 hover:border-burrow-700/50 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
}

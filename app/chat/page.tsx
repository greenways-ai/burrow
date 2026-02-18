'use client';

import { useEffect, useState, useRef } from 'react';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Sidebar } from '@/components/chat/Sidebar';
import { useConversations } from '@/hooks/useConversations';
import { useEncryption } from '@/hooks/useEncryption';
import { useEncryptionStore } from '@/lib/store/encryptionStore';
import { Fingerprint, Scan } from '@/components/icons';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function ChatPage() {
  const { isConnected, address } = useAccount();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const { isDeriving, error: encryptionError, deriveKey } = useEncryption();
  const { 
    conversations, 
    isLoading: isLoadingConversations,
    loadConversations 
  } = useConversations();

  const hasAttemptedDerivation = useRef(false);

  useEffect(() => {
    if (isConnected && address && !hasAttemptedDerivation.current) {
      hasAttemptedDerivation.current = true;
      const existingKey = useEncryptionStore.getState().key;
      if (!existingKey) {
        deriveKey();
      }
    }
  }, [isConnected, address, deriveKey]);

  useEffect(() => {
    if (!isConnected) {
      hasAttemptedDerivation.current = false;
    }
  }, [isConnected]);

  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected, loadConversations]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center max-w-md">
          <div className="w-20 h-20 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-8 glow-red">
            <Fingerprint className="w-10 h-10 text-accent" />
          </div>
          <h1 className="text-3xl font-black mb-4 tracking-tight text-text-primary">INITIALIZE CONNECTION</h1>
          <p className="text-text-secondary mb-8 leading-relaxed">
            Connect your wallet to establish an encrypted session. 
            Your private key never leaves your device.
          </p>
          <ConnectButton 
            showBalance={false}
            chainStatus="none"
            accountStatus="full"
          />
        </div>
      </div>
    );
  }

  if (isDeriving) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="absolute inset-0 scan-line opacity-50" />
        <div className="w-16 h-16 border-2 border-accent/30 border-t-accent rounded-full animate-spin mb-6" />
        <p className="text-accent font-mono text-sm tracking-widest uppercase mb-2">Deriving Encryption Key</p>
        <p className="text-text-muted text-sm">Please sign the verification message in your wallet</p>
      </div>
    );
  }

  if (encryptionError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-black mb-4 text-accent">Encryption Error</h1>
          <p className="text-text-secondary mb-6">{encryptionError}</p>
          <button
            onClick={() => deriveKey()}
            className="px-6 py-3 bg-accent hover:bg-accent-dark text-white font-semibold transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <Sidebar
        conversations={conversations}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedId={selectedConversationId}
        onSelect={setSelectedConversationId}
        isLoading={isLoadingConversations}
      />

      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface
          conversationId={selectedConversationId}
          onConversationCreated={(id) => setSelectedConversationId(id)}
        />
      </main>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react;
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Sidebar } from '@/components/chat/Sidebar';
import { useConversations } from '@/hooks/useConversations';
import { useEncryption } from '@/hooks/useEncryption';
import { Shield } from '@/components/icons';

export default function ChatPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  
  const { isDeriving, error: encryptionError, deriveKey } = useEncryption();
  const { 
    conversations, 
    isLoading: isLoadingConversations,
    loadConversations 
  } = useConversations();

  // Derive encryption key on mount
  useEffect(() => {
    if (isConnected && address) {
      deriveKey();
    }
  }, [isConnected, address, deriveKey]);

  // Load conversations when connected
  useEffect(() => {
    if (isConnected) {
      loadConversations();
    }
  }, [isConnected, loadConversations]);

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-burrow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Connect Your Wallet</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            Connect your wallet to access your encrypted conversations. 
            Your private key is never shared with the server.
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
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-burrow-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-400">Deriving encryption key...</p>
        <p className="text-sm text-gray-500 mt-2">Please sign the message in your wallet</p>
      </div>
    );
  }

  if (encryptionError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-semibold mb-4 text-red-400">Encryption Error</h1>
          <p className="text-gray-400 mb-6">{encryptionError}</p>
          <button
            onClick={() => deriveKey()}
            className="px-6 py-3 bg-burrow-500 hover:bg-burrow-600 text-white rounded-xl font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        selectedId={selectedConversationId}
        onSelect={setSelectedConversationId}
        isLoading={isLoadingConversations}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatInterface
          conversationId={selectedConversationId}
          onConversationCreated={(id) => setSelectedConversationId(id)}
        />
      </main>
    </div>
  );
}

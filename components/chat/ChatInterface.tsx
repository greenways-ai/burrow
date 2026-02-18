'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Shield, Key } from '@/components/icons';

interface ChatInterfaceProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ 
  conversationId, 
  onConversationCreated 
}: ChatInterfaceProps) {
  const { address } = useAccount();
  const {
    messages,
    isStreaming,
    error: chatError,
    currentConversationId,
    sendMessage,
    loadConversation,
    startNewConversation,
  } = useChat();

  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation when ID changes
  useEffect(() => {
    if (conversationId) {
      setIsLoading(true);
      loadConversation(conversationId).finally(() => setIsLoading(false));
    } else {
      startNewConversation();
    }
  }, [conversationId, loadConversation, startNewConversation]);

  // Notify parent when new conversation is created
  useEffect(() => {
    if (currentConversationId && !conversationId) {
      onConversationCreated(currentConversationId);
    }
  }, [currentConversationId, conversationId, onConversationCreated]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-burrow-500/20 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-burrow-400" />
          </div>
          <div>
            <h1 className="font-semibold">
              {conversationId ? 'Conversation' : 'New Chat'}
            </h1>
            <p className="text-xs text-gray-500 flex items-center">
              <Key className="w-3 h-3 mr-1" />
              End-to-end encrypted
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <a
            href="/admin"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Admin
          </a>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {messages.length === 0 && !isLoading ? (
          <EmptyState />
        ) : (
          <div className="max-w-3xl mx-auto px-4 py-8">
            <MessageList 
              messages={messages} 
              isLoading={isLoading || isStreaming}
            />
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Error Banner */}
      {chatError && (
        <div className="px-4 py-3 bg-red-500/10 border-t border-red-500/20 text-red-400 text-sm">
          Error: {chatError}
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <ChatInput 
            onSend={handleSendMessage}
            disabled={isStreaming}
            placeholder={isStreaming ? 'AI is thinking...' : 'Type your message...'}
          />
          <p className="text-center text-xs text-gray-500 mt-2">
            Messages are encrypted with your wallet key. Only you can read them.
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center max-w-md px-4">
        <div className="w-16 h-16 bg-burrow-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Shield className="w-8 h-8 text-burrow-400" />
        </div>
        <h2 className="text-2xl font-semibold mb-3">Welcome to Burrow</h2>
        <p className="text-gray-400 mb-6">
          Start a private conversation with AI. Your messages are encrypted 
          with keys only you control.
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <SuggestionChip text="What is end-to-end encryption?" />
          <SuggestionChip text="How does wallet-based auth work?" />
          <SuggestionChip text="Explain zero-knowledge architecture" />
        </div>
      </div>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  return (
    <button
      onClick={() => {
        // This would trigger the parent to send this message
        // For now, it's just visual
      }}
      className="px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-full text-sm text-gray-300 transition-colors"
    >
      {text}
    </button>
  );
}

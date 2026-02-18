'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import { useChat } from '@/hooks/useChat';
import { useConversations } from '@/hooks/useConversations';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { Fingerprint, Lock, Scan, FileSearch, MessageSquare, X } from '@/components/icons';
import { ThemeToggle } from '@/components/ThemeToggle';
import { AnalysisWorkflow } from '@/components/analysis/AnalysisWorkflow';

interface ChatInterfaceProps {
  conversationId: string | null;
  onConversationCreated: (id: string) => void;
}

export function ChatInterface({ 
  conversationId, 
  onConversationCreated 
}: ChatInterfaceProps) {
  const { address } = useAccount();
  const [mode, setMode] = useState<'chat' | 'analysis'>('chat');
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversationId && mode === 'chat') {
      setIsLoading(true);
      loadConversation(conversationId).finally(() => setIsLoading(false));
    } else if (!conversationId) {
      startNewConversation();
    }
  }, [conversationId, loadConversation, startNewConversation, mode]);

  useEffect(() => {
    if (currentConversationId && !conversationId) {
      onConversationCreated(currentConversationId);
    }
  }, [currentConversationId, conversationId, onConversationCreated]);

  const handleSendMessage = async (content: string) => {
    await sendMessage(content);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-accent/30 rounded-full flex items-center justify-center glow-red">
            <Fingerprint className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h1 className="font-bold tracking-wide text-text-primary">
              {mode === 'analysis' ? 'FORENSIC ANALYSIS' : (conversationId ? 'SECURE SESSION' : 'NEW SESSION')}
            </h1>
            <div className="flex items-center gap-2 text-xs">
              <Lock className="w-3 h-3 text-accent" />
              <span className="text-accent uppercase tracking-wider">End-to-end encrypted</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Mode Toggle */}
          <div className="flex bg-background border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setMode('chat')}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors flex items-center gap-2 ${
                mode === 'chat'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              Chat
            </button>
            <button
              onClick={() => setMode('analysis')}
              className={`px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors flex items-center gap-2 ${
                mode === 'analysis'
                  ? 'bg-accent text-white'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              <FileSearch className="w-4 h-4" />
              Analyze
            </button>
          </div>
          
          <ThemeToggle />
          <a
            href="/admin"
            className="text-sm text-text-muted hover:text-text-primary transition-colors uppercase tracking-wider text-xs"
          >
            Admin
          </a>
        </div>
      </header>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {mode === 'analysis' ? (
          <div className="h-full py-8">
            <AnalysisWorkflow onComplete={() => {}} />
          </div>
        ) : messages.length === 0 && !isLoading ? (
          <EmptyState onStartAnalysis={() => setMode('analysis')} />
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
      {chatError && mode === 'chat' && (
        <div className="px-4 py-3 bg-accent/10 border-t border-accent/30 text-accent text-sm font-mono">
          Error: {chatError}
        </div>
      )}

      {/* Input Area - Only show in chat mode */}
      {mode === 'chat' && (
        <div className="border-t border-border bg-surface">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <ChatInput 
              onSend={handleSendMessage}
              disabled={isStreaming}
              placeholder={isStreaming ? 'AI processing...' : 'Enter encrypted message...'}
            />
            <p className="text-center text-xs text-text-muted mt-2 font-mono uppercase tracking-wider">
              All messages encrypted with AES-256-GCM
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ onStartAnalysis }: { onStartAnalysis: () => void }) {
  return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-4">
        <div className="w-20 h-20 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-8 glow-red">
          <Scan className="w-10 h-10 text-accent" />
        </div>
        <h2 className="text-2xl font-black mb-4 tracking-tight text-text-primary">INITIATE SECURE DIALOGUE</h2>
        <p className="text-text-secondary mb-8 leading-relaxed">
          Begin an encrypted conversation with our AI, or launch a forensic analysis 
          of a narrative using the Obsidian Prism framework.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <SuggestionChip text="Verify encryption protocols" />
          <SuggestionChip text="How does wallet auth work?" />
          <button
            onClick={onStartAnalysis}
            className="px-4 py-2 bg-accent hover:bg-accent-dark text-white text-sm font-medium transition-colors flex items-center gap-2"
          >
            <FileSearch className="w-4 h-4" />
            Analyze Article
          </button>
        </div>
      </div>
    </div>
  );
}

function SuggestionChip({ text }: { text: string }) {
  return (
    <button
      onClick={() => {}}
      className="px-4 py-2 border border-border text-text-muted text-sm hover:border-accent hover:text-accent transition-colors"
    >
      {text}
    </button>
  );
}

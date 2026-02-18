'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Fingerprint, ChevronLeft, Save, History } from '@/components/icons';
import { truncateAddress } from '@/lib/utils/format';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS?.toLowerCase();

export default function AdminPage() {
  const { isConnected, address } = useAccount();
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isAdmin = !ADMIN_WALLET || address?.toLowerCase() === ADMIN_WALLET;

  useEffect(() => {
    if (isConnected && isAdmin) {
      fetchCurrentPrompt();
    }
  }, [isConnected, isAdmin]);

  const fetchCurrentPrompt = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/prompt');
      if (!response.ok) throw new Error('Failed to fetch prompt');
      
      const data = await response.json();
      setPrompt(data.prompt?.content || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompt');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!address || !prompt.trim()) return;

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: address,
          content: prompt.trim(),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save prompt');
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
        <div className="text-center">
          <div className="w-16 h-16 border border-accent/30 rounded-full flex items-center justify-center mx-auto mb-6 glow-red">
            <Fingerprint className="w-8 h-8 text-accent" />
          </div>
          <h1 className="text-2xl font-black mb-4 tracking-tight">ADMIN ACCESS</h1>
          <p className="text-text-secondary mb-8">
            Connect your wallet to access the admin panel.
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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-black">
        <div className="text-center">
          <h1 className="text-2xl font-black mb-4 text-accent">ACCESS DENIED</h1>
          <p className="text-text-secondary mb-6">
            Wallet {truncateAddress(address || '')} is not authorized.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 bg-surface hover:bg-surface-hover border border-border transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Return to Chat</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/chat"
              className="p-2 hover:bg-surface transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <Fingerprint className="w-6 h-6 text-accent" />
              <div>
                <h1 className="font-bold tracking-wide">ADMIN PANEL</h1>
                <p className="text-xs text-text-muted uppercase tracking-wider">Master Prompt Configuration</p>
              </div>
            </div>
          </div>
          
          <ConnectButton 
            showBalance={false}
            chainStatus="none"
            accountStatus="address"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 p-4 bg-accent/10 border border-accent/30 text-accent font-mono text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 border border-green-500/30 text-green-500 font-mono text-sm">
            System prompt updated successfully
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-surface border border-border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-bold tracking-wide">MASTER SYSTEM PROMPT</h2>
                <p className="text-sm text-text-muted mt-1">
                  This prompt is used as the system context for all AI conversations.
                </p>
              </div>
              <button
                onClick={fetchCurrentPrompt}
                className="flex items-center gap-2 px-4 py-2 border border-border hover:border-accent transition-colors text-sm"
              >
                <History className="w-4 h-4" />
                <span className="uppercase tracking-wider text-xs">Reload</span>
              </button>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-border border-t-accent rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter the system prompt..."
                  className="w-full h-64 px-4 py-3 bg-black border border-border focus:border-accent focus:outline-none text-white placeholder-text-muted font-mono text-sm resize-none"
                />
                
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <div className="text-sm text-text-muted font-mono">
                    {prompt.length} characters
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !prompt.trim()}
                    className="flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-dark disabled:bg-surface disabled:cursor-not-allowed text-white font-semibold transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="uppercase tracking-wider text-xs">Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span className="uppercase tracking-wider text-xs">Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="bg-surface border border-border p-6">
            <h3 className="font-bold mb-4 tracking-wide">CONFIGURATION NOTES</h3>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li>• Define the AI&apos;s role and personality clearly</li>
              <li>• Include constraints and guidelines the AI should follow</li>
              <li>• Consider adding context about Burrow&apos;s privacy-focused nature</li>
              <li>• Test changes before deploying to production</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

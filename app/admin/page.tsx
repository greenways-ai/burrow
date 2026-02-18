'use client';

import { useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Shield, Settings, ChevronLeft, Save, History } from '@/components/icons';
import { SystemPrompt } from '@/types';
import { truncateAddress } from '@/lib/utils/format';

const ADMIN_WALLET = process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS?.toLowerCase();

export default function AdminPage() {
  const { isConnected, address } = useAccount();
  const router = useRouter();
  
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isAdmin = address?.toLowerCase() === ADMIN_WALLET;

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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-burrow-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Admin Access</h1>
          <p className="text-gray-400 mb-8 max-w-md">
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
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Settings className="w-8 h-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-semibold mb-4 text-red-400">Access Denied</h1>
          <p className="text-gray-400 mb-8 max-w-md">
            Your wallet ({truncateAddress(address || '')}) is not authorized to access the admin panel.
          </p>
          <Link
            href="/chat"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            <span>Back to Chat</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              href="/chat"
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-burrow-500 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-semibold">Admin Panel</h1>
                <p className="text-xs text-gray-500">Master Prompt Configuration</p>
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
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400">
            System prompt updated successfully!
          </div>
        )}

        {/* Prompt Editor */}
        <div className="space-y-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Master System Prompt</h2>
                <p className="text-sm text-gray-500 mt-1">
                  This prompt is used as the system context for all AI conversations.
                </p>
              </div>
              <button
                onClick={fetchCurrentPrompt}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm transition-colors"
              >
                <History className="w-4 h-4" />
                <span>Reload</span>
              </button>
            </div>

            {isLoading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-gray-600 border-t-burrow-500 rounded-full animate-spin" />
              </div>
            ) : (
              <>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Enter the system prompt..."
                  className="w-full h-64 px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl resize-none focus:outline-none focus:border-burrow-500 focus:ring-1 focus:ring-burrow-500 text-gray-100 placeholder-gray-500 font-mono text-sm"
                />
                
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    {prompt.length} characters
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !prompt.trim()}
                    className="flex items-center space-x-2 px-6 py-3 bg-burrow-500 hover:bg-burrow-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                  >
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Tips for System Prompts</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>• Be specific about the AI&apos;s role and personality</li>
              <li>• Include any constraints or guidelines the AI should follow</li>
              <li>• Consider adding context about the privacy-focused nature of Burrow</li>
              <li>• Test changes in a conversation before finalizing</li>
              <li>• Keep important instructions near the beginning of the prompt</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

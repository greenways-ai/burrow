'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { ConversationMetadata } from '@/types';
import { Plus, Trash, ChevronLeft, Menu, LogOut, Fingerprint } from '@/components/icons';
import { useConversations } from '@/hooks/useConversations';
import { truncateText, formatRelativeTime, truncateAddress } from '@/lib/utils/format';

interface SidebarProps {
  conversations: ConversationMetadata[];
  isOpen: boolean;
  onToggle: () => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  isLoading: boolean;
}

export function Sidebar({
  conversations,
  isOpen,
  onToggle,
  selectedId,
  onSelect,
  isLoading,
}: SidebarProps) {
  const { address } = useAccount();
  const { disconnect } = useDisconnect();
  const { deleteConversation } = useConversations();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleNewChat = () => {
    onSelect(null);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation(id);
      if (selectedId === id) {
        onSelect(null);
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 p-3 bg-surface border border-border"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-surface border-r border-border transform transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-3">
                <Fingerprint className="w-6 h-6 text-accent" />
                <span className="font-bold tracking-wider">BURROW</span>
              </Link>
              <button
                onClick={onToggle}
                className="hidden lg:block p-2 hover:bg-surface-hover transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-accent hover:bg-accent-dark text-white font-semibold transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="tracking-wide">NEW CHAT</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-border border-t-accent rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-text-muted">
                <p className="text-sm">No conversations found</p>
                <p className="text-xs mt-1">Start a new encrypted chat</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`w-full group flex items-center justify-between p-3 text-left transition-all border-l-2 ${
                    selectedId === conv.id
                      ? 'bg-surface-hover border-accent'
                      : 'border-transparent hover:bg-surface-hover'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-white">
                      {truncateText(conv.title, 40)}
                    </p>
                    <p className="text-xs text-text-muted mt-1 font-mono">
                      {formatRelativeTime(conv.updated_at)}
                      <span className="mx-2">·</span>
                      {conv.message_count} msgs
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className="opacity-0 group-hover:opacity-100 p-2 hover:text-accent transition-all"
                  >
                    {deletingId === conv.id ? (
                      <div className="w-4 h-4 border-2 border-border border-t-accent rounded-full animate-spin" />
                    ) : (
                      <Trash className="w-4 h-4" />
                    )}
                  </button>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-mono text-xs text-text-secondary">{truncateAddress(address || '')}</p>
                <p className="text-xs text-accent uppercase tracking-wider">Connected</p>
              </div>
              <button
                onClick={() => disconnect()}
                className="p-2 hover:text-accent transition-colors"
                title="Disconnect"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/80 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}

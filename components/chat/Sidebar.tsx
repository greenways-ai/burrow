'use client';

import { useState } from 'react';
import { useAccount, useDisconnect } from 'wagmi';
import Link from 'next/link';
import { ConversationMetadata } from '@/types';
import { Plus, Trash, ChevronLeft, Menu, LogOut, Shield } from '@/components/icons';
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-80 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:opacity-0 lg:overflow-hidden'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-burrow-500 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold">Burrow</span>
              </Link>
              <button
                onClick={onToggle}
                className="hidden lg:block p-1.5 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>
            
            <button
              onClick={handleNewChat}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-burrow-500 hover:bg-burrow-600 text-white rounded-xl font-medium transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Chat</span>
            </button>
          </div>

          {/* Conversations List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-gray-600 border-t-burrow-500 rounded-full animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No conversations yet</p>
                <p className="text-sm mt-1">Start a new chat to begin</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={`w-full group flex items-center justify-between p-3 rounded-xl text-left transition-colors ${
                    selectedId === conv.id
                      ? 'bg-gray-800 border border-gray-700'
                      : 'hover:bg-gray-800/50'
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {truncateText(conv.title, 40)}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatRelativeTime(conv.updated_at)}
                      <span className="mx-2">·</span>
                      {conv.message_count} messages
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDelete(e, conv.id)}
                    disabled={deletingId === conv.id}
                    className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                  >
                    {deletingId === conv.id ? (
                      <div className="w-4 h-4 border-2 border-gray-600 border-t-red-500 rounded-full animate-spin" />
                    ) : (
                      <Trash className="w-4 h-4" />
                    )}
                  </button>
                </button>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="text-sm">
                <p className="font-medium">{truncateAddress(address || '')}</p>
                <p className="text-xs text-gray-500">Connected</p>
              </div>
              <button
                onClick={() => disconnect()}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
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
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={onToggle}
        />
      )}
    </>
  );
}

'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';
import { supabase } from '@/lib/supabase';
import { useEncryption } from './useEncryption';
import { ConversationMetadata, Message } from '@/types';
import { generateConversationTitle } from '@/lib/crypto';

interface UseConversationsReturn {
  conversations: ConversationMetadata[];
  isLoading: boolean;
  error: string | null;
  loadConversations: () => Promise<void>;
  createConversation: (messages: Message[]) => Promise<string>;
  updateConversation: (id: string, messages: Message[]) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  loadConversationMessages: (id: string) => Promise<Message[]>;
}

export function useConversations(): UseConversationsReturn {
  const { address, isConnected } = useAccount();
  const { encryptMessages, decryptMessages } = useEncryption();
  
  const [conversations, setConversations] = useState<ConversationMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!isConnected || !address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Call RPC to set wallet context for RLS
      await supabase.rpc('get_or_create_user', {
        p_wallet_address: address,
      });

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select('id, title, created_at, updated_at, message_count')
        .order('updated_at', { ascending: false });

      if (fetchError) throw fetchError;

      setConversations(data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load conversations';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [address, isConnected]);

  const createConversation = useCallback(async (messages: Message[]): Promise<string> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const title = generateConversationTitle(messages);
    const encryptedData = await encryptMessages(messages);

    // Get or create user and get user_id
    const { data: userData, error: userError } = await supabase.rpc('get_or_create_user', {
      p_wallet_address: address,
    });

    if (userError) throw userError;

    const { data, error: insertError } = await supabase
      .from('conversations')
      .insert({
        user_id: userData,
        title,
        encrypted_data: encryptedData,
        message_count: messages.length,
      })
      .select('id')
      .single();

    if (insertError) throw insertError;
    if (!data) throw new Error('Failed to create conversation');

    // Refresh conversations list
    await loadConversations();

    return data.id;
  }, [address, isConnected, encryptMessages, loadConversations]);

  const updateConversation = useCallback(async (id: string, messages: Message[]): Promise<void> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const title = generateConversationTitle(messages);
    const encryptedData = await encryptMessages(messages);

    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        title,
        encrypted_data: encryptedData,
        message_count: messages.length,
      })
      .eq('id', id);

    if (updateError) throw updateError;

    // Refresh conversations list
    await loadConversations();
  }, [address, isConnected, encryptMessages, loadConversations]);

  const deleteConversation = useCallback(async (id: string): Promise<void> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const { error: deleteError } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id);

    if (deleteError) throw deleteError;

    // Refresh conversations list
    await loadConversations();
  }, [address, isConnected, loadConversations]);

  const loadConversationMessages = useCallback(async (id: string): Promise<Message[]> => {
    if (!isConnected || !address) {
      throw new Error('Wallet not connected');
    }

    const { data, error: fetchError } = await supabase
      .from('conversations')
      .select('encrypted_data')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;
    if (!data) throw new Error('Conversation not found');

    return decryptMessages(data.encrypted_data);
  }, [address, isConnected, decryptMessages]);

  // Auto-load conversations when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [isConnected, address, loadConversations]);

  return {
    conversations,
    isLoading,
    error,
    loadConversations,
    createConversation,
    updateConversation,
    deleteConversation,
    loadConversationMessages,
  };
}

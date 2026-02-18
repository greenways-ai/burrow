'use client';

import { useCallback, useState } from 'react';
import { Message } from '@/types';
import { useConversations } from './useConversations';
import { useEncryption } from './useEncryption';

interface UseChatReturn {
  messages: Message[];
  isStreaming: boolean;
  error: string | null;
  currentConversationId: string | null;
  sendMessage: (content: string) => Promise<void>;
  loadConversation: (conversationId: string) => Promise<void>;
  startNewConversation: () => void;
}

export function useChat(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);

  const { createConversation, updateConversation, loadConversationMessages } = useConversations();
  const { encryptMessages } = useEncryption();

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      const loadedMessages = await loadConversationMessages(conversationId);
      setMessages(loadedMessages);
      setCurrentConversationId(conversationId);
      setError(null);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load conversation';
      setError(errorMsg);
    }
  }, [loadConversationMessages]);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
    setError(null);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setError(null);
    setIsStreaming(true);

    try {
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);

      // Encrypt messages for API
      const encryptedMessages = await encryptMessages(updatedMessages);

      // Start streaming response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: currentConversationId,
          message: content,
          encryptedMessages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response stream');
      }

      // Create assistant message placeholder
      const assistantMessage: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Read stream
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || !trimmed.startsWith('data: ')) continue;

          try {
            const data = JSON.parse(trimmed.slice(6));
            
            if (data.content) {
              fullContent += data.content;
              setMessages(prev => {
                const newMessages = [...prev];
                const lastMessage = newMessages[newMessages.length - 1];
                if (lastMessage?.role === 'assistant') {
                  lastMessage.content = fullContent;
                }
                return newMessages;
              });
            }

            if (data.conversationId && !currentConversationId) {
              setCurrentConversationId(data.conversationId);
            }
          } catch (e) {
            // Skip invalid JSON
            continue;
          }
        }
      }

      // Save conversation
      const finalMessages = [...updatedMessages, { ...assistantMessage, content: fullContent }];
      
      if (currentConversationId) {
        await updateConversation(currentConversationId, finalMessages);
      } else {
        const newId = await createConversation(finalMessages);
        setCurrentConversationId(newId);
      }

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to send message';
      setError(errorMsg);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, currentConversationId, encryptMessages, createConversation, updateConversation]);

  return {
    messages,
    isStreaming,
    error,
    currentConversationId,
    sendMessage,
    loadConversation,
    startNewConversation,
  };
}

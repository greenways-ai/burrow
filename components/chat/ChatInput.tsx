'use client';

import { useState, useRef, useCallback } from 'react';
import { Send } from '@/components/icons';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
  disabled?: boolean;
  placeholder?: string;
}

export function ChatInput({ onSend, disabled, placeholder }: ChatInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    if (!input.trim() || disabled) return;
    
    const message = input.trim();
    setInput('');
    
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    
    await onSend(message);
  }, [input, disabled, onSend]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }, [handleSend]);

  const handleInput = useCallback((e: React.FormEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    target.style.height = 'auto';
    target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
  }, []);

  return (
    <div className="relative">
      <textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        placeholder={placeholder || 'Type your message...'}
        disabled={disabled}
        rows={1}
        className="w-full px-4 py-3 pr-12 bg-gray-800 border border-gray-700 rounded-xl resize-none focus:outline-none focus:border-burrow-500 focus:ring-1 focus:ring-burrow-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-100 placeholder-gray-500"
        style={{ minHeight: '52px', maxHeight: '200px' }}
      />
      
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="absolute right-3 bottom-3 p-2 bg-burrow-500 hover:bg-burrow-600 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg transition-colors"
      >
        <Send className="w-4 h-4 text-white" />
      </button>
    </div>
  );
}

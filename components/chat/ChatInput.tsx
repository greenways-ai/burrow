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
        placeholder={placeholder || 'Enter encrypted message...'}
        disabled={disabled}
        rows={1}
        className="w-full px-4 py-3 pr-12 bg-black border border-border focus:border-accent focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed text-white placeholder-text-muted font-mono text-sm resize-none"
        style={{ minHeight: '52px', maxHeight: '200px' }}
      />
      
      <button
        onClick={handleSend}
        disabled={!input.trim() || disabled}
        className="absolute right-3 bottom-3 p-2 bg-accent hover:bg-accent-dark disabled:bg-surface disabled:cursor-not-allowed text-white transition-colors"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}

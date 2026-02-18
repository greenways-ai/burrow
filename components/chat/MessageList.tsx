'use client';

import { Message } from '@/types';
import { User, Bot } from './MessageAvatar';
import ReactMarkdown from 'react-markdown';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="space-y-6">
      {messages.map((message, index) => (
        <MessageItem 
          key={message.id} 
          message={message} 
          isLast={index === messages.length - 1}
        />
      ))}
      
      {isLoading && (
        <LoadingMessage />
      )}
    </div>
  );
}

function MessageItem({ message, isLast }: { message: Message; isLast: boolean }) {
  const isUser = message.role === 'user';
  
  return (
    <div 
      className={`flex items-start gap-4 animate-fade-in ${
        isUser ? 'flex-row-reverse' : ''
      }`}
    >
      <div className="flex-shrink-0">
        {isUser ? <User /> : <Bot />}
      </div>
      
      <div className={`flex-1 min-w-0 ${isUser ? 'text-right' : ''}`}>
        <div 
          className={`inline-block max-w-full text-left px-5 py-3 ${
            isUser 
              ? 'bg-accent text-white' 
              : 'bg-surface border border-border text-white'
          }`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap font-mono text-sm">{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>
                {message.content}
              </ReactMarkdown>
            </div>
          )}
        </div>
        
        <p className="text-xs text-text-muted mt-2 font-mono">
          {new Date(message.timestamp).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          })}
        </p>
      </div>
    </div>
  );
}

function LoadingMessage() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0">
        <Bot />
      </div>
      
      <div className="flex-1">
        <div className="inline-flex items-center gap-2 px-5 py-3 bg-surface border border-border">
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse animation-delay-200" />
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse animation-delay-400" />
        </div>
      </div>
    </div>
  );
}

import { Address } from 'viem';

// User and Wallet Types
export interface User {
  id: string;
  wallet_address: Address;
  created_at: string;
  last_login: string;
}

// Message Types
export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  encrypted?: boolean;
}

export interface EncryptedMessage {
  iv: string;        // Initialization vector (hex)
  ciphertext: string; // Encrypted content (hex)
  tag: string;       // Authentication tag (hex)
}

// Conversation Types
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  encrypted_data: string;  // JSON string of EncryptedMessage[]
  created_at: string;
  updated_at: string;
  message_count: number;
}

export interface ConversationMetadata {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count: number;
}

// AI Provider Types
export type AIProviderType = 'kimi' | 'vertex';

export interface AIProviderConfig {
  type: AIProviderType;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIProvider {
  stream(messages: Message[], systemPrompt: string): AsyncGenerator<string>;
}

// System Prompt Types
export interface SystemPrompt {
  id: string;
  content: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

// Encryption Types
export interface EncryptionKey {
  key: CryptoKey;
  raw: Uint8Array;
}

export interface WalletSignature {
  signature: string;
  message: string;
}

// API Types
export interface ChatRequest {
  conversationId?: string;
  message: string;
  encryptedMessages: string; // JSON string of EncryptedMessage[]
}

export interface ChatResponse {
  conversationId: string;
  encryptedContent: string;
}

// Admin Types
export interface AdminSession {
  isAdmin: boolean;
  walletAddress: Address;
}

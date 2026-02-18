import { keccak256, toBytes, toHex, hexToBytes } from 'viem';
import { EncryptedMessage, Message } from '@/types';

const ENCRYPTION_ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

/**
 * Derive encryption key from wallet signature
 * This deterministic derivation ensures the same wallet always produces the same key
 */
export async function deriveKeyFromSignature(
  signature: string,
  salt: string
): Promise<CryptoKey> {
  // Combine signature with salt
  const combined = `${signature}:${salt}`;
  const combinedBytes = toBytes(combined);
  
  // Hash to get fixed-length key material
  const hash = keccak256(combinedBytes);
  const keyMaterial = hexToBytes(hash);
  
  // Convert to standard Uint8Array for WebCrypto compatibility
  const keyBuffer = new Uint8Array(keyMaterial);
  
  // Import as WebCrypto key
  return await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: ENCRYPTION_ALGORITHM, length: KEY_LENGTH },
    false, // not extractable
    ['encrypt', 'decrypt']
  );
}

/**
 * Generate a deterministic message for wallet signing
 * This ensures users always sign the same message to get the same key
 */
export function getKeyDerivationMessage(walletAddress: string): string {
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'burrow.chat';
  return `Sign this message to enable encrypted messaging on ${appDomain}.\n\nThis signature is used to derive your encryption key. It cannot be used to access your funds.\n\nWallet: ${walletAddress.toLowerCase()}`;
}

/**
 * Encrypt a string using AES-GCM
 */
export async function encryptString(
  plaintext: string,
  key: CryptoKey
): Promise<EncryptedMessage> {
  const encoder = new TextEncoder();
  const plaintextBytes = encoder.encode(plaintext);
  
  // Generate random IV
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  
  // Encrypt
  const encrypted = await crypto.subtle.encrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    plaintextBytes
  );
  
  // Extract ciphertext and auth tag (last 16 bytes in GCM)
  const encryptedBytes = new Uint8Array(encrypted);
  const ciphertext = encryptedBytes.slice(0, -16);
  const tag = encryptedBytes.slice(-16);
  
  return {
    iv: toHex(iv),
    ciphertext: toHex(ciphertext),
    tag: toHex(tag),
  };
}

/**
 * Decrypt an encrypted message
 */
export async function decryptString(
  encryptedMessage: EncryptedMessage,
  key: CryptoKey
): Promise<string> {
  const iv = new Uint8Array(hexToBytes(encryptedMessage.iv as `0x${string}`));
  const ciphertext = new Uint8Array(hexToBytes(encryptedMessage.ciphertext as `0x${string}`));
  const tag = new Uint8Array(hexToBytes(encryptedMessage.tag as `0x${string}`));
  
  // Combine ciphertext and tag for decryption
  const combined = new Uint8Array(ciphertext.length + tag.length);
  combined.set(ciphertext);
  combined.set(tag, ciphertext.length);
  
  // Decrypt
  const decrypted = await crypto.subtle.decrypt(
    { name: ENCRYPTION_ALGORITHM, iv },
    key,
    combined
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * Encrypt an array of messages
 */
export async function encryptMessages(
  messages: Message[],
  key: CryptoKey
): Promise<string> {
  const encryptedMessages: EncryptedMessage[] = [];
  
  for (const message of messages) {
    const encrypted = await encryptString(JSON.stringify(message), key);
    encryptedMessages.push(encrypted);
  }
  
  return JSON.stringify(encryptedMessages);
}

/**
 * Decrypt an array of messages
 */
export async function decryptMessages(
  encryptedData: string,
  key: CryptoKey
): Promise<Message[]> {
  const encryptedMessages: EncryptedMessage[] = JSON.parse(encryptedData);
  const messages: Message[] = [];
  
  for (const encrypted of encryptedMessages) {
    const decrypted = await decryptString(encrypted, key);
    messages.push(JSON.parse(decrypted));
  }
  
  return messages;
}

/**
 * Encrypt a single message
 */
export async function encryptMessage(
  message: Message,
  key: CryptoKey
): Promise<string> {
  const encrypted = await encryptString(JSON.stringify(message), key);
  return JSON.stringify(encrypted);
}

/**
 * Decrypt a single message
 */
export async function decryptMessage(
  encryptedData: string,
  key: CryptoKey
): Promise<Message> {
  const encrypted: EncryptedMessage = JSON.parse(encryptedData);
  const decrypted = await decryptString(encrypted, key);
  return JSON.parse(decrypted);
}

/**
 * Generate a conversation title from the first user message
 */
export function generateConversationTitle(messages: Message[]): string {
  const firstUserMessage = messages.find(m => m.role === 'user');
  if (!firstUserMessage) return 'New Conversation';
  
  // Truncate to first 50 chars
  const title = firstUserMessage.content.slice(0, 50);
  return title.length < firstUserMessage.content.length ? title + '...' : title;
}

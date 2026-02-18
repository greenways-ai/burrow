'use client';

import { useCallback, useState } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { 
  deriveKeyFromSignature, 
  getKeyDerivationMessage,
  encryptMessages as encryptMessagesLib,
  decryptMessages as decryptMessagesLib,
  encryptMessage as encryptMessageLib,
  decryptMessage as decryptMessageLib,
} from '@/lib/crypto';
import { Message } from '@/types';

const ENCRYPTION_SALT = process.env.NEXT_PUBLIC_ENCRYPTION_SALT || 'burrow-default-salt-change-in-production';

interface UseEncryptionReturn {
  key: CryptoKey | null;
  isDeriving: boolean;
  error: string | null;
  deriveKey: () => Promise<CryptoKey | null>;
  encryptMessages: (messages: Message[]) => Promise<string>;
  decryptMessages: (encryptedData: string) => Promise<Message[]>;
  encryptMessage: (message: Message) => Promise<string>;
  decryptMessage: (encryptedData: string) => Promise<Message>;
  clearKey: () => void;
}

export function useEncryption(): UseEncryptionReturn {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  
  const [key, setKey] = useState<CryptoKey | null>(null);
  const [isDeriving, setIsDeriving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deriveKey = useCallback(async (): Promise<CryptoKey | null> => {
    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    if (key) {
      return key;
    }

    setIsDeriving(true);
    setError(null);

    try {
      const message = getKeyDerivationMessage(address);
      const signature = await signMessageAsync({ message });
      
      const derivedKey = await deriveKeyFromSignature(signature, ENCRYPTION_SALT);
      setKey(derivedKey);
      
      return derivedKey;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to derive encryption key';
      setError(errorMsg);
      return null;
    } finally {
      setIsDeriving(false);
    }
  }, [address, isConnected, key, signMessageAsync]);

  const encryptMessages = useCallback(async (messages: Message[]): Promise<string> => {
    const encryptionKey = key || await deriveKey();
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return encryptMessagesLib(messages, encryptionKey);
  }, [key, deriveKey]);

  const decryptMessages = useCallback(async (encryptedData: string): Promise<Message[]> => {
    const encryptionKey = key || await deriveKey();
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return decryptMessagesLib(encryptedData, encryptionKey);
  }, [key, deriveKey]);

  const encryptMessage = useCallback(async (message: Message): Promise<string> => {
    const encryptionKey = key || await deriveKey();
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return encryptMessageLib(message, encryptionKey);
  }, [key, deriveKey]);

  const decryptMessage = useCallback(async (encryptedData: string): Promise<Message> => {
    const encryptionKey = key || await deriveKey();
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return decryptMessageLib(encryptedData, encryptionKey);
  }, [key, deriveKey]);

  const clearKey = useCallback(() => {
    setKey(null);
    setError(null);
  }, []);

  return {
    key,
    isDeriving,
    error,
    deriveKey,
    encryptMessages,
    decryptMessages,
    encryptMessage,
    decryptMessage,
    clearKey,
  };
}

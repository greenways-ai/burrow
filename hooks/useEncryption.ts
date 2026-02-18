'use client';

import { useCallback, useRef } from 'react';
import { useAccount, useSignMessage } from 'wagmi';
import { 
  deriveKeyFromSignature, 
  getKeyDerivationMessage,
  encryptMessages as encryptMessagesLib,
  decryptMessages as decryptMessagesLib,
  encryptMessage as encryptMessageLib,
  decryptMessage as decryptMessageLib,
} from '@/lib/crypto';
import { useEncryptionStore } from '@/lib/store/encryptionStore';
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
  
  // Use global store for key state
  const key = useEncryptionStore((state) => state.key);
  const isDeriving = useEncryptionStore((state) => state.isDeriving);
  const error = useEncryptionStore((state) => state.error);
  const setKey = useEncryptionStore((state) => state.setKey);
  const setIsDeriving = useEncryptionStore((state) => state.setIsDeriving);
  const setError = useEncryptionStore((state) => state.setError);
  const clearKey = useEncryptionStore((state) => state.clearKey);

  // Use ref to track if we're currently deriving to prevent duplicate calls
  const isDerivingRef = useRef(false);

  const deriveKey = useCallback(async (): Promise<CryptoKey | null> => {
    // Check store first - if we have a key, return it immediately
    const currentKey = useEncryptionStore.getState().key;
    if (currentKey) {
      return currentKey;
    }

    // Prevent multiple simultaneous derivation attempts
    if (isDerivingRef.current) {
      // Wait for derivation to complete
      while (isDerivingRef.current) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      const derivedKey = useEncryptionStore.getState().key;
      return derivedKey;
    }

    if (!isConnected || !address) {
      setError('Wallet not connected');
      return null;
    }

    isDerivingRef.current = true;
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
      isDerivingRef.current = false;
      setIsDeriving(false);
    }
  }, [address, isConnected, signMessageAsync, setKey, setIsDeriving, setError]);

  const encryptMessages = useCallback(async (messages: Message[]): Promise<string> => {
    // Always check store first for the key
    let encryptionKey = useEncryptionStore.getState().key;
    if (!encryptionKey) {
      encryptionKey = await deriveKey();
    }
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return encryptMessagesLib(messages, encryptionKey);
  }, [deriveKey]);

  const decryptMessages = useCallback(async (encryptedData: string): Promise<Message[]> => {
    // Always check store first for the key
    let encryptionKey = useEncryptionStore.getState().key;
    if (!encryptionKey) {
      encryptionKey = await deriveKey();
    }
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return decryptMessagesLib(encryptedData, encryptionKey);
  }, [deriveKey]);

  const encryptMessage = useCallback(async (message: Message): Promise<string> => {
    // Always check store first for the key
    let encryptionKey = useEncryptionStore.getState().key;
    if (!encryptionKey) {
      encryptionKey = await deriveKey();
    }
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return encryptMessageLib(message, encryptionKey);
  }, [deriveKey]);

  const decryptMessage = useCallback(async (encryptedData: string): Promise<Message> => {
    // Always check store first for the key
    let encryptionKey = useEncryptionStore.getState().key;
    if (!encryptionKey) {
      encryptionKey = await deriveKey();
    }
    if (!encryptionKey) {
      throw new Error('Encryption key not available');
    }
    return decryptMessageLib(encryptedData, encryptionKey);
  }, [deriveKey]);

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

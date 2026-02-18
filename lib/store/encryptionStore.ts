import { create } from 'zustand';

interface EncryptionState {
  key: CryptoKey | null;
  isDeriving: boolean;
  error: string | null;
  setKey: (key: CryptoKey) => void;
  setIsDeriving: (isDeriving: boolean) => void;
  setError: (error: string | null) => void;
  clearKey: () => void;
}

export const useEncryptionStore = create<EncryptionState>((set) => ({
  key: null,
  isDeriving: false,
  error: null,
  setKey: (key) => set({ key, isDeriving: false, error: null }),
  setIsDeriving: (isDeriving) => set({ isDeriving }),
  setError: (error) => set({ error, isDeriving: false }),
  clearKey: () => set({ key: null, isDeriving: false, error: null }),
}));

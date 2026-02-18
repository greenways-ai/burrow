'use client';

import { useEffect, useState } from 'react';

// Dynamic import to prevent SSR issues
import dynamic from 'next/dynamic';

const DynamicWagmiProvider = dynamic(
  () => import('./WagmiProvider').then((mod) => mod.WagmiProvider),
  {
    ssr: false,
    loading: () => <div suppressHydrationWarning>{null}</div>,
  }
);

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  // Return children without providers during SSR
  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return (
    <DynamicWagmiProvider>
      {children}
    </DynamicWagmiProvider>
  );
}

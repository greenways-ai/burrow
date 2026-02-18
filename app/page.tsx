'use client';

import dynamic from 'next/dynamic';
import { Suspense } from 'react';

const HomePageClient = dynamic(() => import('./HomePageClient'), {
  ssr: false,
});

export default function Page() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-gray-400 tracking-wider">INITIALIZING...</span>
        </div>
      </div>
    }>
      <HomePageClient />
    </Suspense>
  );
}

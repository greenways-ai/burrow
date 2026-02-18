'use client';

import dynamic from 'next/dynamic';
import { ClientProviders } from '../ClientProviders';

const ChatPageContent = dynamic(() => import('./ChatPage'), {
  ssr: false,
});

export default function Page() {
  return (
    <ClientProviders>
      <ChatPageContent />
    </ClientProviders>
  );
}

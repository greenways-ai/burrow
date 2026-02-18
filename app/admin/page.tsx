'use client';

import dynamic from 'next/dynamic';
import { ClientProviders } from '../ClientProviders';

const AdminPageContent = dynamic(() => import('./AdminPage'), {
  ssr: false,
});

export default function Page() {
  return (
    <ClientProviders>
      <AdminPageContent />
    </ClientProviders>
  );
}

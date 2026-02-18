import { Metadata } from 'next';
import HomePageClient from './HomePageClient';

export const metadata: Metadata = {
  title: 'Burrow - Private AI Chat',
  description: 'End-to-end encrypted AI conversations. Your data never leaves your control.',
};

// Force static generation
export const dynamic = 'force-static';

export default function Page() {
  return <HomePageClient />;
}

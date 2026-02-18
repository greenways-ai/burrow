import { Inter } from 'next/font/google';
import { ClientProviders } from './ClientProviders';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Burrow - Private AI Chat',
  description: 'Private, end-to-end encrypted chat with various AI models.',
};

// Force static generation - prevents SSR issues with Wagmi
export const dynamic = 'force-static';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}

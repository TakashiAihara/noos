import '@/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { Metadata } from 'next';

import { TRPCReactProvider } from '@/trpc/react';

export const metadata: Metadata = {
  title: 'Noos',
  description: 'Noos is a web application for managing your personal knowledge base.',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}

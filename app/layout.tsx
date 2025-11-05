import type { Metadata } from 'next';
import './globals.css';
import { NavigationHeader } from '@/components/navigation-header';

export const metadata: Metadata = {
  title: 'Vereen - Data Management & Herindicatie',
  description: 'AI-powered data management and herindicatie platform for WLZ care',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased">
        <NavigationHeader />
        {children}
      </body>
    </html>
  );
}

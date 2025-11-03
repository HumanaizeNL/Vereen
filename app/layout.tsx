import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Vereen - Meerzorg & Herindicatie',
  description: 'AI-powered Meerzorg and Herindicatie documentation platform',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}

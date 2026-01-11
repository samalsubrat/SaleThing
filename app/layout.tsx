import type { Metadata } from 'next';
import { Hanken_Grotesk } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken-grotesk',
  subsets: ['latin']
});

export const metadata: Metadata = {
  title: 'SaleThing',
  description: 'Sale Page for anyone.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${hankenGrotesk.variable} font-sans antialiased`}>
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}

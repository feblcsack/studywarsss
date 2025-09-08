import type { Metadata } from 'next';
import { IBM_Plex_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext'; // <-- 1. TAMBAHKAN IMPORT INI
import { Toaster } from '@/components/ui/toaster';

const ibmPlexMono = IBM_Plex_Mono({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-ibm-plex-mono',
});

export const metadata: Metadata = {
  title: 'Study War!',
  description: 'Just...cool',
  icons: {
    icon: "/kucing.jpeg"
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ibmPlexMono.variable}>
      <body className={`${ibmPlexMono.className} antialiased bg-slate-900`}> {/* Saya tambahkan bg default di sini */}
        <AuthProvider>
          <SettingsProvider> {/* <-- 2. BUNGKUS {children} DENGAN INI */}
            {children}
          </SettingsProvider>
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
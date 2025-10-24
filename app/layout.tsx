
import type { Metadata } from 'next';
import { Inter, Lora } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', weight: ['400', '700'] });

const metadata: Metadata = {
  title: 'BeGood',
  description: 'A place to connect',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="light">
      <body className={`${inter.variable} ${lora.variable}`}>
        <Providers>
            <FirebaseClientProvider>
                {children}
            </FirebaseClientProvider>
        </Providers>
      </body>
    </html>
  );
}


import type { Metadata } from 'next';
import { Inter, Lora, Montserrat } from 'next/font/google';
import { Providers } from '@/components/providers';
import './globals.css';
import { FirebaseClientProvider } from '@/firebase/client-provider';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const lora = Lora({ subsets: ['latin'], variable: '--font-lora', weight: ['400', '700'] });
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-montserrat', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
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
      <body className={`${inter.variable} ${lora.variable} ${montserrat.variable}`}>
        <FirebaseClientProvider>
          <Providers>
            {children}
          </Providers>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}

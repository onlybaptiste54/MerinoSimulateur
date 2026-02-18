import type { Metadata } from 'next';
import { Rubik } from 'next/font/google';
import './globals.css';
import { Providers } from './providers';

const rubik = Rubik({ subsets: ['latin'], variable: '--font-rubik' });

export const metadata: Metadata = {
  title: 'RestoSim - Simulateur de Rentabilité Restaurant',
  description: 'Calculez le seuil de rentabilité et le résultat net de votre restaurant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={rubik.variable}>
      <body className="font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

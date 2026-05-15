import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { Navigation } from '@/components/Navigation';
import { TabsProvider } from '@/components/TabsProvider';
import { TabBar } from '@/components/TabBar';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata = {
  title: 'ComboTool - Combinatorics Visualizer',
  description: 'Interactive visualizations for combinatorics and linear algebra',
  themeColor: '#0b1120',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body>
        <TabsProvider>
          <div className="app">
            <Navigation />
            <TabBar />
            <div className="content">{children}</div>
          </div>
        </TabsProvider>
      </body>
    </html>
  );
}

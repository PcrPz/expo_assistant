// src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ToastContainer } from '../components/ui/Toast';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ExpoAssistant',
  description: 'Expo and Event Management System',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body>
        {children}
        <ToastContainer />
      </body>
    </html>
  );
}
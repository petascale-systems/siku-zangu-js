import './global.css';
import { ReactNode } from 'react';
import { WUIAppProviders } from './wui-app-providers.component';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="w-full h-screen bg-white font-display">
        <WUIAppProviders>{children}</WUIAppProviders>
      </body>
    </html>
  );
}

import '@daglesia/daglesias-library-of-components/dist/daglesias-library-of-components.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'Steam Login Demo',
  description: 'Sign in with Steam and browse your games + achievements',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}

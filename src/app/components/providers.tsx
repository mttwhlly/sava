'use client';

import { SessionProvider } from 'next-auth/react';
import { AuthStatus } from './auth-status';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthStatus />
      {children}
    </SessionProvider>
  );
}

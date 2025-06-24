'use client';

import { useSession, signIn, signOut } from 'next-auth/react';

export function AuthStatus() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="mb-4 w-full flex p-4">
        <div className="flex flex-row gap-4 justify-between w-full">
          Signed in as {session.user?.email}{' '}
          <button
            className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black cursor-pointer"
            onClick={() => signOut()}
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-4 w-full flex p-4">
      <button
        className="border border-white px-4 py-2 rounded hover:bg-white hover:text-black cursor-pointer"
        onClick={() => signIn('google')}
      >
        Sign in with Google
      </button>
    </div>
  );
}

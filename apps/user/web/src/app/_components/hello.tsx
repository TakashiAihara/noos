'use client';

import { api } from '@/trpc/react';

export function Hello() {
  const { data: message, isLoading, error } = api.hello.hello.useQuery();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="w-full max-w-xs">
      {message && <p className="truncate">{message}</p>}
    </div>
  );
}

'use client';

import { api } from '@/trpc/react';

export function Hello() {
  const [message] = api.hello.hello.useSuspenseQuery();

  return <div className="w-full max-w-xs">{message && <p className="truncate">{message}</p>}</div>;
}

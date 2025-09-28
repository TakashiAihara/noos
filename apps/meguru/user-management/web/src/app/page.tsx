import { HydrateClient } from '@/trpc/server';
import { Hello } from './_components/hello';

export default async function Home() {
  return (
    <HydrateClient>
      <main className="flex min-h-screen items-center justify-center bg-gray-900 p-4">
        <Hello />
      </main>
    </HydrateClient>
  );
}

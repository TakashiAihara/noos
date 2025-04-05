import { NextResponse } from 'next/server';

export async function GET() {
  console.log('🟢 Health check was called!');
  return NextResponse.json({ status: 'ok' });
}

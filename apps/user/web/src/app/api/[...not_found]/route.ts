import { NextRequest, NextResponse } from 'next/server';

interface ErrorResponseBody {
  error: string;
}

function logApiNotFound(method: string, path: string): void {
  console.error(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      type: 'api_not_found',
      method: method,
      path: path,
      statusCode: 404,
    }),
  );
}

export async function GET(request: NextRequest): Promise<NextResponse<ErrorResponseBody>> {
  const path: string = request.nextUrl.pathname;
  logApiNotFound('GET', path);
  return NextResponse.json({ error: `API not found: ${path}` }, { status: 404 });
}

export async function POST(request: NextRequest): Promise<NextResponse<ErrorResponseBody>> {
  const path: string = request.nextUrl.pathname;
  logApiNotFound('POST', path);
  return NextResponse.json({ error: `API not found: ${path}` }, { status: 404 });
}

export async function PUT(request: NextRequest): Promise<NextResponse<ErrorResponseBody>> {
  const path: string = request.nextUrl.pathname;
  logApiNotFound('PUT', path);
  return NextResponse.json({ error: `API not found: ${path}` }, { status: 404 });
}

export async function DELETE(request: NextRequest): Promise<NextResponse<ErrorResponseBody>> {
  const path: string = request.nextUrl.pathname;
  logApiNotFound('DELETE', path);
  return NextResponse.json({ error: `API not found: ${path}` }, { status: 404 });
}

export async function PATCH(request: NextRequest): Promise<NextResponse<ErrorResponseBody>> {
  const path: string = request.nextUrl.pathname;
  logApiNotFound('PATCH', path);
  return NextResponse.json({ error: `API not found: ${path}` }, { status: 404 });
}

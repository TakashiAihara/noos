#!/usr/bin/env bun
import type { CategorySummary, GrowthPoint, SearchResult, TrendingItem } from '@meguru/types';

// ----------------------------------------------------------------
// Config
// ----------------------------------------------------------------

const GATEWAY_URL =
  // biome-ignore lint/complexity/useLiteralKeys: tsconfig strictest requires bracket notation for index signatures
  process.env['MEGURU_GATEWAY_URL'] ?? 'https://meguru-gateway.example.workers.dev';

// ----------------------------------------------------------------
// API client
// ----------------------------------------------------------------

async function fetchApi<T>(path: string): Promise<T> {
  const url = `${GATEWAY_URL}${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    const text = await response.text().catch(() => '');
    console.error(`[meguru] API error ${response.status}: ${text}`, { url });
    process.exit(1);
  }
  return response.json() as Promise<T>;
}

// ----------------------------------------------------------------
// Output formatters
// ----------------------------------------------------------------

type OutputFormat = 'json' | 'table' | 'text';

function toTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return '(no results)';
  const first = rows[0];
  if (!first) return '(no results)';
  const keys = Object.keys(first);
  const colWidths = keys.map((k) =>
    Math.max(k.length, ...rows.map((r) => String(r[k] ?? '').length)),
  );
  const header = keys.map((k, i) => k.padEnd(colWidths[i] ?? 0)).join('  ');
  const divider = colWidths.map((w) => '-'.repeat(w)).join('  ');
  const body = rows.map((r) =>
    keys.map((k, i) => String(r[k] ?? '').padEnd(colWidths[i] ?? 0)).join('  '),
  );
  return [header, divider, ...body].join('\n');
}

function print(data: unknown, format: OutputFormat): void {
  if (format === 'json') {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
  } else if (format === 'table' && Array.isArray(data)) {
    process.stdout.write(`${toTable(data as Record<string, unknown>[])}\n`);
  } else {
    process.stdout.write(`${String(data)}\n`);
  }
}

// ----------------------------------------------------------------
// Argument helpers
// ----------------------------------------------------------------

const args = process.argv.slice(2);
const command = args[0] ?? '';

function getFlag(name: string, fallback: string): string {
  const idx = args.indexOf(`--${name}`);
  return idx >= 0 && args[idx + 1] != null ? (args[idx + 1] as string) : fallback;
}

const format = getFlag('format', 'json') as OutputFormat;
const period = getFlag('period', 'weekly');
const limit = getFlag('limit', '20');
const days = getFlag('days', '30');

// ----------------------------------------------------------------
// Commands
// ----------------------------------------------------------------

switch (command) {
  // meguru trending [--period weekly|daily|monthly] [--limit 20] [--format json|table|text]
  case 'trending': {
    const data = await fetchApi<TrendingItem[]>(`/api/trending?period=${period}&limit=${limit}`);
    if (format === 'table') {
      print(
        data.map((d) => ({
          name: d.name,
          installs: d.install_count ?? '-',
          trending_weekly: d.trending_weekly ?? '-',
          rating: d.average_rating?.toFixed(1) ?? '-',
        })),
        format,
      );
    } else {
      print(data, format);
    }
    break;
  }

  // meguru growth <extensionId> [--days 30] [--format json|table|text]
  case 'growth': {
    const extensionId = args[1];
    if (!extensionId) {
      console.error('Usage: meguru growth <extensionId> [--days 30]');
      process.exit(1);
    }
    const data = await fetchApi<GrowthPoint[]>(
      `/api/growth?id=${encodeURIComponent(extensionId)}&days=${days}`,
    );
    print(data, format);
    break;
  }

  // meguru categories [--format json|table|text]
  case 'categories': {
    const data = await fetchApi<CategorySummary[]>('/api/categories');
    if (format === 'table') {
      print(
        data.map((d) => ({
          category: d.category,
          extensions: d.total_extensions,
          total_installs: d.total_installs,
        })),
        format,
      );
    } else {
      print(data, format);
    }
    break;
  }

  // meguru search <query> [--limit 50] [--format json|table|text]
  case 'search': {
    const query = args[1];
    if (!query) {
      console.error('Usage: meguru search <query>');
      process.exit(1);
    }
    const data = await fetchApi<SearchResult[]>(
      `/api/search?q=${encodeURIComponent(query)}&limit=${limit}`,
    );
    if (format === 'table') {
      print(
        data.map((d) => ({
          name: d.name,
          publisher: d.publisher_name,
          installs: d.install_count ?? '-',
          description: (d.short_description ?? '').slice(0, 60),
        })),
        format,
      );
    } else {
      print(data, format);
    }
    break;
  }

  // meguru summary [--format json|text]
  case 'summary': {
    const [trending, categories] = await Promise.all([
      fetchApi<TrendingItem[]>(`/api/trending?period=${period}&limit=5`),
      fetchApi<CategorySummary[]>('/api/categories'),
    ]);

    if (format === 'text') {
      process.stdout.write(`=== Top 5 Trending (${period}) ===\n`);
      for (const [i, t] of trending.entries()) {
        process.stdout.write(
          `${i + 1}. ${t.display_name} (${t.publisher_name}) — installs: ${t.install_count ?? '?'}\n`,
        );
      }
      process.stdout.write('\n=== Top Categories ===\n');
      for (const [i, c] of categories.slice(0, 5).entries()) {
        process.stdout.write(`${i + 1}. ${c.category} — ${c.total_extensions} extensions\n`);
      }
    } else {
      print({ trending, categories }, format);
    }
    break;
  }

  default: {
    process.stderr.write(
      `${[
        'meguru — VSCode Marketplace Trend Tracker CLI',
        '',
        'Commands:',
        '  trending   [--period weekly|daily|monthly] [--limit N]',
        '  growth     <extensionId> [--days N]',
        '  categories',
        '  search     <query> [--limit N]',
        '  summary    [--format json|text]',
        '',
        'Options:',
        '  --format   json (default) | table | text',
        '  --period   weekly (default) | daily | monthly',
        '  --limit    20 (default)',
        '  --days     30 (default)',
        '',
        'Environment:',
        '  MEGURU_GATEWAY_URL   Gateway URL (default: https://meguru-gateway.example.workers.dev)',
        '',
        'Examples:',
        '  meguru trending --period weekly --limit 20 --format table',
        '  meguru growth ms-python.python --days 30',
        '  meguru search "copilot" --format table',
        '  meguru summary --format text',
      ].join('\n')}\n`,
    );
    if (command) process.exit(1);
    break;
  }
}

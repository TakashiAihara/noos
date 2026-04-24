import type { CategorySummary, TrendingItem } from '@meguru/types';
import { Hono } from 'hono';

interface Env {
  REPOSITORY: Fetcher;
}

const VALID_PERIODS = new Set(['daily', 'weekly', 'monthly'] as const);
type Period = 'daily' | 'weekly' | 'monthly';

function normalizePeriod(value: string | undefined): Period {
  return VALID_PERIODS.has(value as Period) ? (value as Period) : 'weekly';
}

function formatNumber(n: number): string {
  return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

const app = new Hono<{ Bindings: Env }>();

// ----------------------------------------------------------------
// Layout
// ----------------------------------------------------------------

function Layout({ title, children }: { title: string; children: unknown }) {
  return (
    <html lang="ja">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} — Meguru</title>
        <style>{`
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: system-ui, sans-serif; background: #0d1117; color: #e6edf3; line-height: 1.5; }
          header { background: #161b22; border-bottom: 1px solid #30363d; padding: 12px 24px; display: flex; align-items: center; gap: 16px; }
          header h1 { font-size: 1.2rem; font-weight: 600; color: #58a6ff; }
          nav a { color: #8b949e; text-decoration: none; padding: 4px 8px; border-radius: 6px; }
          nav a:hover { color: #e6edf3; background: #21262d; }
          main { max-width: 1200px; margin: 24px auto; padding: 0 24px; }
          h2 { font-size: 1.4rem; font-weight: 600; margin-bottom: 16px; color: #e6edf3; }
          table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
          thead th { text-align: left; padding: 8px 12px; border-bottom: 1px solid #30363d; color: #8b949e; font-weight: 500; }
          tbody tr { border-bottom: 1px solid #21262d; }
          tbody tr:hover { background: #161b22; }
          tbody td { padding: 10px 12px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; background: #21262d; color: #8b949e; margin: 1px; }
          .num { text-align: right; font-variant-numeric: tabular-nums; }
          .rank { color: #8b949e; font-size: 0.85rem; }
          .ext-name { font-weight: 500; color: #58a6ff; }
          .ext-pub { color: #8b949e; font-size: 0.85rem; }
          .section { margin-bottom: 40px; }
          .tab-bar { display: flex; gap: 8px; margin-bottom: 20px; }
          .tab-bar a { padding: 6px 16px; border-radius: 6px; text-decoration: none; color: #8b949e; background: #21262d; }
          .tab-bar a.active { background: #1f6feb; color: #fff; }
          .stars { color: #f9c513; }
        `}</style>
      </head>
      <body>
        <header>
          <h1>🔭 Meguru</h1>
          <nav>
            <a href="/">Trending</a>
            <a href="/categories">Categories</a>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}

// ----------------------------------------------------------------
// Trending page
// ----------------------------------------------------------------

app.get('/', async (c) => {
  const period = normalizePeriod(c.req.query('period'));
  const limit = 50;

  let items: TrendingItem[] = [];
  try {
    const res = await c.env.REPOSITORY.fetch(
      `http://internal/trending?period=${period}&limit=${limit}`,
    );
    if (!res.ok) throw new Error(`Repository error ${res.status}`);
    items = (await res.json()) as TrendingItem[];
  } catch (err) {
    console.error('[dashboard] / fetch error:', err);
    return c.html(
      <Layout title="Trending">
        <div class="section">
          <h2>Trending Extensions</h2>
          <p style="color:#f85149">Failed to load data. Please try again later.</p>
        </div>
      </Layout>,
      500,
    );
  }

  const tabs = [
    { label: 'Weekly', value: 'weekly' },
    { label: 'Daily', value: 'daily' },
    { label: 'Monthly', value: 'monthly' },
  ];

  return c.html(
    <Layout title="Trending">
      <div class="section">
        <h2>Trending Extensions</h2>
        <div class="tab-bar">
          {tabs.map((t) => (
            <a
              key={t.value}
              href={`/?period=${t.value}`}
              class={period === t.value ? 'active' : ''}
            >
              {t.label}
            </a>
          ))}
        </div>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Extension</th>
              <th>Categories</th>
              <th class="num">Installs</th>
              <th class="num">Trending ({period})</th>
              <th class="num">Rating</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={item.extension_id}>
                <td class="rank">{i + 1}</td>
                <td>
                  <div class="ext-name">{item.display_name}</div>
                  <div class="ext-pub">{item.publisher_name}</div>
                </td>
                <td>
                  {item.categories.slice(0, 3).map((cat) => (
                    <span key={cat} class="badge">
                      {cat}
                    </span>
                  ))}
                </td>
                <td class="num">
                  {item.install_count != null ? formatNumber(item.install_count) : '—'}
                </td>
                <td class="num">
                  {period === 'daily'
                    ? (item.trending_daily?.toFixed(2) ?? '—')
                    : period === 'monthly'
                      ? (item.trending_monthly?.toFixed(2) ?? '—')
                      : (item.trending_weekly?.toFixed(2) ?? '—')}
                </td>
                <td class="num">
                  {item.average_rating != null ? (
                    <span>
                      <span class="stars">★</span> {item.average_rating.toFixed(1)}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>,
  );
});

// ----------------------------------------------------------------
// Categories page
// ----------------------------------------------------------------

app.get('/categories', async (c) => {
  let categories: CategorySummary[] = [];
  try {
    const res = await c.env.REPOSITORY.fetch('http://internal/categories');
    if (!res.ok) throw new Error(`Repository error ${res.status}`);
    categories = (await res.json()) as CategorySummary[];
  } catch (err) {
    console.error('[dashboard] /categories fetch error:', err);
    return c.html(
      <Layout title="Categories">
        <div class="section">
          <h2>Categories</h2>
          <p style="color:#f85149">Failed to load data. Please try again later.</p>
        </div>
      </Layout>,
      500,
    );
  }

  return c.html(
    <Layout title="Categories">
      <div class="section">
        <h2>Categories</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Category</th>
              <th class="num">Extensions</th>
              <th class="num">Total Installs</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => (
              <tr key={cat.category}>
                <td class="rank">{i + 1}</td>
                <td>{cat.category}</td>
                <td class="num">{formatNumber(cat.total_extensions)}</td>
                <td class="num">{formatNumber(cat.total_installs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>,
  );
});

// ----------------------------------------------------------------
// Health check
// ----------------------------------------------------------------

app.get('/health', (c) => c.json({ ok: true }));

export default app;

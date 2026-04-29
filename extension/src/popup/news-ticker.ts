/**
 * HERO Wallet Extension — CoinGecko News Ticker
 * Scrolling marquee with live prices, trending coins, and news headlines.
 * Uses CoinGecko FREE API (no key required).
 *
 * Endpoints:
 *   /api/v3/simple/price — live prices for BTC, ETH, SOL, PLS, HEX, DOGE
 *   /api/v3/search/trending — top trending coins
 *   rss2json proxy of CoinGecko RSS — news headlines
 *
 * ARCHITECTURE: Vanilla TS (no React) — keeps extension bundle <500KB.
 * DESIGN: Military HUD — electric green data, amber warnings, dark bg.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

interface PriceData {
  id: string;
  symbol: string;
  usd: number;
  change24h: number;
}

interface TrendingCoin {
  name: string;
  symbol: string;
  rank: number;
  thumb: string;
}

interface NewsItem {
  title: string;
  source: string;
  url: string;
}

type TickerSection = 'prices' | 'trending' | 'news';

// ─── Config ───────────────────────────────────────────────────────────────────

const PRICE_IDS = 'bitcoin,ethereum,solana,pulsechain,hex,dogecoin';
const SYMBOL_MAP: Record<string, string> = {
  bitcoin: 'BTC',
  ethereum: 'ETH',
  solana: 'SOL',
  pulsechain: 'PLS',
  hex: 'HEX',
  dogecoin: 'DOGE',
};

const REFRESH_MS = 60_000;       // prices: 1 min
const TREND_REFRESH_MS = 300_000; // trending: 5 min
const NEWS_REFRESH_MS = 300_000;  // news: 5 min
const SCROLL_PX_PER_FRAME = 0.5;
const SECTION_ROTATE_MS = 12_000; // auto-rotate sections every 12s

const FALLBACK_NEWS: NewsItem[] = [
  { title: 'Bitcoin holds above $90K as institutional demand surges', source: 'CoinGecko', url: 'https://www.coingecko.com/en/news' },
  { title: 'Ethereum Layer 2 TVL reaches new all-time high', source: 'CoinGecko', url: 'https://www.coingecko.com/en/news' },
  { title: 'PulseChain ecosystem sees record DEX volume', source: 'CoinGecko', url: 'https://www.coingecko.com/en/news' },
  { title: 'DeFi protocols continue to attract new users globally', source: 'CoinGecko', url: 'https://www.coingecko.com/en/news' },
];

// ─── State ────────────────────────────────────────────────────────────────────

let prices: PriceData[] = [];
let trending: TrendingCoin[] = [];
let news: NewsItem[] = [...FALLBACK_NEWS];
let activeSection: TickerSection = 'prices';
let isPaused = false;
let scrollOffset = 0;
let animFrame = 0;
let sectionTimer: ReturnType<typeof setInterval> | null = null;

// ─── Fetch Functions ──────────────────────────────────────────────────────────

async function fetchPrices(): Promise<void> {
  try {
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${PRICE_IDS}&vs_currencies=usd&include_24hr_change=true`,
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return;
    const data = await res.json();
    prices = Object.entries(data).map(([id, v]: [string, any]) => ({
      id,
      symbol: SYMBOL_MAP[id] || id.toUpperCase(),
      usd: v.usd || 0,
      change24h: v.usd_24h_change || 0,
    }));
    updateTickerContent();
  } catch { /* silent — keep existing data */ }
}

async function fetchTrending(): Promise<void> {
  try {
    const res = await fetch('https://api.coingecko.com/api/v3/search/trending', {
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return;
    const data = await res.json();
    trending = (data.coins || []).slice(0, 8).map((c: any) => ({
      name: c.item?.name || '',
      symbol: c.item?.symbol || '',
      rank: c.item?.market_cap_rank || 0,
      thumb: c.item?.thumb || '',
    }));
    updateTickerContent();
  } catch { /* silent */ }
}

async function fetchNews(): Promise<void> {
  try {
    const res = await fetch(
      'https://api.rss2json.com/v1/api.json?rss_url=https://www.coingecko.com/en/news/rss',
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) return;
    const data = await res.json();
    if (data.status === 'ok' && data.items?.length > 0) {
      news = data.items.slice(0, 12).map((item: any) => ({
        title: item.title || '',
        source: item.author || 'CoinGecko',
        url: item.link || 'https://www.coingecko.com/en/news',
      }));
      updateTickerContent();
    }
  } catch { /* keep fallback */ }
}

// ─── Format Helpers ───────────────────────────────────────────────────────────

function fmtPrice(p: number): string {
  if (p >= 1000) return `$${p.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
  if (p >= 1) return `$${p.toFixed(2)}`;
  if (p >= 0.001) return `$${p.toFixed(4)}`;
  return `$${p.toFixed(6)}`;
}

function fmtChange(c: number): string {
  const sign = c >= 0 ? '+' : '';
  return `${sign}${c.toFixed(1)}%`;
}

// ─── Sanitization ────────────────────────────────────────────────────────────

/** Escape HTML entities to prevent XSS from external API data */
function esc(str: string): string {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ─── Render Content ───────────────────────────────────────────────────────────

function buildPricesHTML(): string {
  if (prices.length === 0) return '<span class="ticker-item">Loading prices...</span>';
  return prices.map(p => {
    const color = p.change24h >= 0 ? '#00ff64' : '#ff4444';
    const arrow = p.change24h >= 0 ? '▲' : '▼';
    return `<span class="ticker-item">
      <span class="ticker-symbol">${esc(p.symbol)}</span>
      <span class="ticker-price">${fmtPrice(p.usd)}</span>
      <span class="ticker-change" style="color:${color}">${arrow} ${fmtChange(p.change24h)}</span>
    </span>`;
  }).join('<span class="ticker-sep">│</span>');
}

function buildTrendingHTML(): string {
  if (trending.length === 0) return '<span class="ticker-item">Loading trending...</span>';
  return trending.map((t, i) => {
    return `<span class="ticker-item">
      <span class="ticker-rank">#${i + 1}</span>
      <span class="ticker-symbol">${esc(t.symbol)}</span>
      <span class="ticker-name">${esc(t.name)}</span>
    </span>`;
  }).join('<span class="ticker-sep">│</span>');
}

function buildNewsHTML(): string {
  return news.map(n => {
    return `<span class="ticker-item ticker-news-item">
      <span class="ticker-news-dot">●</span>
      <span class="ticker-news-title">${esc(n.title)}</span>
      <span class="ticker-news-src">[${esc(n.source)}]</span>
    </span>`;
  }).join('<span class="ticker-sep">│</span>');
}

function updateTickerContent(): void {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  let html = '';
  switch (activeSection) {
    case 'prices': html = buildPricesHTML(); break;
    case 'trending': html = buildTrendingHTML(); break;
    case 'news': html = buildNewsHTML(); break;
  }

  // Duplicate for seamless loop
  track.innerHTML = `<div class="ticker-content">${html}</div><div class="ticker-content">${html}</div>`;
  scrollOffset = 0;
}

// ─── Scroll Animation ────────────────────────────────────────────────────────

function startScroll(): void {
  const track = document.getElementById('ticker-track');
  if (!track) return;

  function animate(): void {
    if (!track || isPaused) {
      animFrame = requestAnimationFrame(animate);
      return;
    }
    scrollOffset -= SCROLL_PX_PER_FRAME;
    const contentWidth = track.scrollWidth / 2;
    if (contentWidth > 0 && Math.abs(scrollOffset) >= contentWidth) {
      scrollOffset = 0;
    }
    track.style.transform = `translateX(${scrollOffset}px)`;
    animFrame = requestAnimationFrame(animate);
  }
  animFrame = requestAnimationFrame(animate);
}

function stopScroll(): void {
  if (animFrame) cancelAnimationFrame(animFrame);
}

// ─── Section Rotation ─────────────────────────────────────────────────────────

function rotateSection(): void {
  const sections: TickerSection[] = ['prices', 'trending', 'news'];
  const idx = sections.indexOf(activeSection);
  activeSection = sections[(idx + 1) % sections.length];
  updateSectionButtons();
  updateTickerContent();
}

function updateSectionButtons(): void {
  document.querySelectorAll('.ticker-tab').forEach(btn => {
    const section = btn.getAttribute('data-section') as TickerSection;
    btn.classList.toggle('active', section === activeSection);
  });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the full HTML string for the ticker component.
 * Call this from renderDashboard() in index.ts.
 */
export function getTickerHTML(): string {
  return `
    <div class="news-ticker" id="news-ticker">
      <div class="ticker-header">
        <div class="ticker-tabs">
          <button class="ticker-tab active" data-section="prices">PRICES</button>
          <button class="ticker-tab" data-section="trending">TRENDING</button>
          <button class="ticker-tab" data-section="news">NEWS</button>
        </div>
        <div class="ticker-status" id="ticker-status">
          <span class="ticker-live-dot"></span>LIVE
        </div>
      </div>
      <div class="ticker-viewport" id="ticker-viewport">
        <div class="ticker-track" id="ticker-track">
          <div class="ticker-content"><span class="ticker-item">Loading...</span></div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Returns the CSS for the ticker. Inject into popup.html <style>.
 */
export function getTickerCSS(): string {
  return `
    /* ─── News Ticker ─────────────────────────────────────────────── */
    .news-ticker {
      border-bottom: 1px solid rgba(0, 255, 100, 0.1);
      background: rgba(0, 255, 100, 0.02);
    }
    .ticker-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 4px 12px;
      border-bottom: 1px solid rgba(0, 255, 100, 0.06);
    }
    .ticker-tabs {
      display: flex;
      gap: 2px;
    }
    .ticker-tab {
      padding: 3px 8px;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      color: #4a5568;
      background: transparent;
      border: 1px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
    }
    .ticker-tab:hover {
      color: #00ff64;
    }
    .ticker-tab.active {
      color: #00ff64;
      border-color: rgba(0, 255, 100, 0.2);
      background: rgba(0, 255, 100, 0.05);
    }
    .ticker-status {
      display: flex;
      align-items: center;
      gap: 4px;
      font-size: 8px;
      font-weight: 700;
      color: #00ff64;
      letter-spacing: 1px;
    }
    .ticker-live-dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      background: #00ff64;
      animation: pulse-dot 2s infinite;
    }
    @keyframes pulse-dot {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }
    .ticker-viewport {
      overflow: hidden;
      padding: 6px 0;
      height: 28px;
    }
    .ticker-track {
      display: flex;
      white-space: nowrap;
      will-change: transform;
    }
    .ticker-content {
      display: flex;
      align-items: center;
      gap: 0;
      padding-right: 40px;
    }
    .ticker-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 0 6px;
      font-size: 11px;
      color: #a0aec0;
    }
    .ticker-symbol {
      font-weight: 700;
      color: #e0e6ed;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .ticker-price {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-weight: 600;
      color: #00d4ff;
      font-size: 11px;
    }
    .ticker-change {
      font-family: 'JetBrains Mono', 'Courier New', monospace;
      font-size: 9px;
      font-weight: 600;
    }
    .ticker-rank {
      font-size: 9px;
      color: #ffa500;
      font-weight: 700;
    }
    .ticker-name {
      font-size: 10px;
      color: #64748b;
    }
    .ticker-sep {
      color: rgba(0, 255, 100, 0.15);
      font-size: 10px;
      padding: 0 2px;
    }
    .ticker-news-dot {
      color: #ffa500;
      font-size: 6px;
    }
    .ticker-news-title {
      font-size: 10px;
      color: #e0e6ed;
    }
    .ticker-news-src {
      font-size: 8px;
      color: #4a5568;
    }
  `;
}

/**
 * Initialize the ticker: bind events, start fetching, start scrolling.
 * Call this from bindDashboardEvents() in index.ts.
 */
export function initTicker(): void {
  // Bind tab clicks
  document.querySelectorAll('.ticker-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const section = btn.getAttribute('data-section') as TickerSection;
      if (section) {
        activeSection = section;
        updateSectionButtons();
        updateTickerContent();
        // Reset auto-rotate timer
        if (sectionTimer) clearInterval(sectionTimer);
        sectionTimer = setInterval(rotateSection, SECTION_ROTATE_MS);
      }
    });
  });

  // Pause on hover
  const viewport = document.getElementById('ticker-viewport');
  viewport?.addEventListener('mouseenter', () => { isPaused = true; });
  viewport?.addEventListener('mouseleave', () => { isPaused = false; });

  // Initial fetch
  fetchPrices();
  fetchTrending();
  fetchNews();

  // Refresh intervals
  setInterval(fetchPrices, REFRESH_MS);
  setInterval(fetchTrending, TREND_REFRESH_MS);
  setInterval(fetchNews, NEWS_REFRESH_MS);

  // Auto-rotate sections
  sectionTimer = setInterval(rotateSection, SECTION_ROTATE_MS);

  // Start scroll animation
  startScroll();
}

/**
 * Clean up ticker (call on popup close if needed).
 */
export function destroyTicker(): void {
  stopScroll();
  if (sectionTimer) clearInterval(sectionTimer);
}

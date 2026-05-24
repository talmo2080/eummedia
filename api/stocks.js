/* global process */
// Vercel 서버리스 함수 — 공공데이터포털 증시 시세 통합 프록시 (3종 API)
// 환경변수: VITE_STOCK_API_KEY (Vercel 대시보드 + 로컬 .env)
// CORS 우회 — 브라우저 → 이 함수 → data.go.kr
//
// 호출 대상:
//   ① 지수 — GetMarketIndexInfoService/getStockMarketIndex (코스피, 코스닥)
//   ② 종목 — GetStockSecuritiesInfoService/getStockPriceInfo (삼성전자, SK하이닉스, 현대차)
//   ③ ETF  — GetSecuritiesProductInfoService/getETFPriceInfo (KODEX 200, TIGER 미국S&P500)
//
// 각 API는 service-by-service 신청·승인. 미승인·미활성 시 각 호출이 403 등 실패 →
// try/catch로 빈 배열 fallback. 화면은 빈 블록을 "데이터 준비 중"으로 표시.
//
// 응답 형식:
//   {
//     basDt: 'YYYY.MM.DD',
//     indices: [{ name, value, change, pct, up }],
//     stocks:  [{ name, code, price, change, pct, up }],
//     etfs:    [{ name, price, change, pct, up }],
//   }

export const config = { maxDuration: 30 };

const INDICES = [
  { name: '코스피',   idxNm: '코스피' },
  { name: '코스닥',   idxNm: '코스닥' },
];

const STOCKS = [
  { name: '삼성전자',   code: '005930' },
  { name: 'SK하이닉스', code: '000660' },
  { name: '현대차',     code: '005380' },
];

const ETFS = [
  { name: 'KODEX 200',         likeItmsNm: 'KODEX 200' },
  { name: 'TIGER 미국S&P500',  likeItmsNm: 'TIGER 미국S&P500' },
];

const URL_INDEX = 'https://apis.data.go.kr/1160100/service/GetMarketIndexInfoService/getStockMarketIndex';
const URL_STOCK = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
const URL_ETF   = 'https://apis.data.go.kr/1160100/service/GetSecuritiesProductInfoService/getETFPriceInfo';

// ───────── 포맷터 ─────────
function fmtPrice(n) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toLocaleString('ko-KR') : '-';
}
function fmtChange(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '-';
  if (x > 0) return '+' + x.toLocaleString('ko-KR');
  if (x < 0) return x.toLocaleString('ko-KR');
  return '0';
}
function fmtPct(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return '-';
  const sign = x > 0 ? '+' : '';
  return sign + x.toFixed(2) + '%';
}
function fmtBasDt(basDt) {
  const s = String(basDt || '');
  if (s.length !== 8) return s;
  return `${s.slice(0, 4)}.${s.slice(4, 6)}.${s.slice(6, 8)}`;
}

// ───────── 공통 fetch 헬퍼 ─────────
async function callApi(baseUrl, params, apiKey) {
  const search =
    'serviceKey=' + apiKey +
    '&resultType=json' +
    Object.entries(params).map(([k, v]) => `&${k}=${encodeURIComponent(v)}`).join('') +
    '&numOfRows=1&pageNo=1';
  const resp = await fetch(baseUrl + '?' + search);
  const text = await resp.text();
  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status}: ${text.slice(0, 80)}`);
  }
  let data;
  try { data = JSON.parse(text); }
  catch { throw new Error(`JSON 파싱 실패: ${text.slice(0, 80)}`); }
  const header = data?.response?.header;
  if (header?.resultCode && header.resultCode !== '00') {
    throw new Error(`API 에러: ${header.resultCode} ${header.resultMsg}`);
  }
  const items = data?.response?.body?.items?.item;
  return Array.isArray(items) ? items[0] : items;
}

// ───────── ① 지수 ─────────
async function fetchIndex(idx, apiKey) {
  const item = await callApi(URL_INDEX, { idxNm: idx.idxNm }, apiKey);
  if (!item) throw new Error('데이터 없음');
  const vs = Number(item.vs);
  return {
    name: idx.name,
    value: fmtPrice(item.clpr),
    change: fmtChange(item.vs),
    pct: fmtPct(item.fltRt),
    up: Number.isFinite(vs) ? vs >= 0 : true,
    basDt: item.basDt || '',
  };
}

// ───────── ② 종목 ─────────
async function fetchStock(sym, apiKey) {
  const item = await callApi(URL_STOCK, { likeSrtnCd: sym.code }, apiKey);
  if (!item) throw new Error('데이터 없음');
  const vs = Number(item.vs);
  return {
    name: sym.name,
    code: sym.code,
    price: fmtPrice(item.clpr),
    change: fmtChange(item.vs),
    pct: fmtPct(item.fltRt),
    up: Number.isFinite(vs) ? vs >= 0 : true,
    basDt: item.basDt || '',
  };
}

// ───────── ③ ETF ─────────
async function fetchEtf(etf, apiKey) {
  const item = await callApi(URL_ETF, { likeItmsNm: etf.likeItmsNm }, apiKey);
  if (!item) throw new Error('데이터 없음');
  const vs = Number(item.vs);
  return {
    name: etf.name,
    price: fmtPrice(item.clpr),
    change: fmtChange(item.vs),
    pct: fmtPct(item.fltRt),
    up: Number.isFinite(vs) ? vs >= 0 : true,
    basDt: item.basDt || '',
  };
}

// ───────── 안전 호출 — 실패 시 빈 배열 ─────────
async function safeAll(items, fetcher, apiKey, label) {
  const settled = await Promise.allSettled(items.map(it => fetcher(it, apiKey)));
  const ok = [];
  const errs = [];
  settled.forEach((r, i) => {
    if (r.status === 'fulfilled') ok.push(r.value);
    else errs.push(`${items[i].name}: ${r.reason?.message?.slice(0, 60)}`);
  });
  if (errs.length) console.warn(`[stocks][${label}] 일부/전체 실패:`, errs.join(' | '));
  return ok;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.VITE_STOCK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: '주식 API 키 설정 누락 (VITE_STOCK_API_KEY)' });
  }

  // CDN/브라우저 캐시 — 6시간
  res.setHeader('Cache-Control', 's-maxage=21600, stale-while-revalidate=43200');

  const [indices, stocks, etfs] = await Promise.all([
    safeAll(INDICES, fetchIndex, apiKey, 'indices'),
    safeAll(STOCKS,  fetchStock, apiKey, 'stocks'),
    safeAll(ETFS,    fetchEtf,   apiKey, 'etfs'),
  ]);

  // basDt — 모든 응답 중 최신
  const allBasDt = [
    ...indices.map(x => x.basDt),
    ...stocks.map(x => x.basDt),
    ...etfs.map(x => x.basDt),
  ].filter(Boolean).sort();
  const latestBasDt = allBasDt.pop() || '';

  return res.status(200).json({
    basDt: fmtBasDt(latestBasDt),
    indices,
    stocks,
    etfs,
  });
}

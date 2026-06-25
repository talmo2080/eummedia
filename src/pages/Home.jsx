import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import VideoGallery from "../components/VideoGallery";

const CC = {
  "이음매거진":"#0d2d52","이음뉴스":"#c0392b","이음에듀":"#1a6b3c",
  "이음피플":"#5c2d8a","이음트렌드":"#c45c0a","이음보이스":"#1c4f8a",
  "이음뷰":"#8a6a00","이음로컬":"#1a6b3c",
};

const CHANNELS = [
  { slug:"magazine", name:"이음매거진", icon:"📰" },
  { slug:"people",   name:"이음피플",   icon:"👤" },
  { slug:"local",    name:"이음로컬",   icon:"📍" },
  { slug:"edu",      name:"이음에듀",   icon:"📚" },
  { slug:"view",     name:"이음뷰",     icon:"👁️" },
  { slug:"trend",    name:"이음트렌드", icon:"📈" },
  { slug:"voice",    name:"이음보이스", icon:"🎙️" },
];

// STOCKS MOCK 제거됨 — /api/stocks (Vercel serverless)에서 공공데이터포털 실시간 종가 fetch

// ━━━━━━━━━━━ 모바일 신문형 (lg 미만) 상수 ━━━━━━━━━━━
// Tailwind JIT 호환 — 클래스 문자열 그대로 박아둠
const CHANNEL_COLORS = {
  rose:    'bg-rose-100 text-rose-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  sky:     'bg-sky-100 text-sky-800',
  amber:   'bg-amber-100 text-amber-800',
  violet:  'bg-violet-100 text-violet-800',
  orange:  'bg-orange-100 text-orange-800',
  slate:   'bg-slate-100 text-slate-800',
};

// 7채널 가로 스크롤 칩 — 데스크탑 CHANNELS와 별개 (충돌 회피)
const NAV_CHANNELS = [
  { slug: 'magazine', name: '이음매거진', color: 'rose' },
  { slug: 'local',    name: '이음로컬',   color: 'emerald' },
  { slug: 'edu',      name: '이음에듀',   color: 'sky' },
  { slug: 'people',   name: '이음피플',   color: 'amber' },
  { slug: 'trend',    name: '이음트렌드', color: 'violet' },
  { slug: 'voice',    name: '이음보이스', color: 'orange' },
  { slug: 'view',     name: '이음뷰',     color: 'slate' },
];

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

// 빈 블록용 안내 — 컴포넌트 바깥에 정의 (react-hooks/static-components 규칙)
function PrepMsg({ label }) {
  return (
    <div style={{ padding:"18px 8px", textAlign:"center", color:"#9a9a9a", fontSize:"12px", background:"#fafbfc", borderRadius:6 }}>
      📡 {label} 데이터 준비 중 (API 활성화 대기)
    </div>
  );
}

// 증시 위젯 — 지수·종목·ETF 3블록 통합 (공공데이터 API 3종)
// 각 블록은 데이터 0건이면 "데이터 준비 중" 안내 (키 활성화 대기 등)
function StockWidget() {
  const [data, setData] = useState({ indices: [], stocks: [], etfs: [], basDt: '' });
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/stocks');
        const j = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setErrMsg(j?.error || '시세를 불러올 수 없습니다');
          return;
        }
        setData({
          indices: Array.isArray(j.indices) ? j.indices : [],
          stocks: Array.isArray(j.stocks) ? j.stocks : [],
          etfs: Array.isArray(j.etfs) ? j.etfs : [],
          basDt: j.basDt || '',
        });
      } catch (e) {
        if (cancelled) return;
        console.error('[StockWidget] fetch error:', e);
        setErrMsg('시세를 불러올 수 없습니다');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const colorUp = '#e74c3c', colorDown = '#1c7ed6';
  const c = s => s.up ? colorUp : colorDown;
  const bg = s => s.up ? '#fff0f0' : '#f0f4ff';

  return (
    <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderTop:"3px solid #0d2d52", marginTop:"40px" }}>
      {/* 헤더 */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 12px", borderBottom:"1px solid #e0e0e0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"16px" }}>📈</span>
          <span style={{ fontSize:"14px", fontWeight:"700", color:"#0d2d52" }}>증시 현황</span>
          <span style={{ fontSize:"11px", color:"#9a9a9a", marginLeft:"4px" }}>
            {data.basDt ? `${data.basDt} 종가 기준` : (loading ? '불러오는 중...' : '')}
          </span>
        </div>
        <a href="https://finance.naver.com" target="_blank" rel="noopener noreferrer"
          style={{ fontSize:"11px", color:"#1c4f8a", textDecoration:"none" }}>
          더보기 →
        </a>
      </div>

      <div style={{ padding:"16px 20px" }}>
        {loading ? (
          <div style={{ padding:"32px 8px", textAlign:"center", color:"#9a9a9a", fontSize:"12px" }}>
            불러오는 중...
          </div>
        ) : errMsg ? (
          <div style={{ padding:"32px 8px", textAlign:"center", color:"#c0392b", fontSize:"12px" }}>
            {errMsg}
          </div>
        ) : (
          <>
            {/* ① 지수 (큰 글씨 강조) */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0d2d52", letterSpacing:1, marginBottom:8 }}>📈 지수</div>
              {data.indices.length === 0 ? <PrepMsg label="지수" /> : (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  {data.indices.map(i => (
                    <div key={i.name} style={{ border:"1px solid #eee", padding:"12px 14px", borderRadius:6, background:"#fafbfc" }}>
                      <div style={{ fontSize:11, fontWeight:700, color:"#666", marginBottom:4 }}>{i.name}</div>
                      <div style={{ fontSize:20, fontWeight:800, color:"#1a1a1a", lineHeight:1.1, marginBottom:4 }}>{i.value}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:11 }}>
                        <span style={{ color: c(i), fontWeight:600 }}>{i.change}</span>
                        <span style={{ color: c(i), background: bg(i), padding:"1px 7px", borderRadius:3, fontWeight:700 }}>{i.pct}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ② 주요 종목 */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize:11, fontWeight:700, color:"#0d2d52", letterSpacing:1, marginBottom:8 }}>📊 주요 종목</div>
              {data.stocks.length === 0 ? <PrepMsg label="종목" /> : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                  <tbody>
                    {data.stocks.map(s => (
                      <tr key={s.code} style={{ borderBottom:"1px solid #f7f7f7" }}>
                        <td style={{ padding:"8px 8px" }}>
                          <div style={{ fontWeight:"600", color:"#1a1a1a" }}>{s.name}</div>
                          <div style={{ fontSize:"10px", color:"#bbb", marginTop:"1px" }}>{s.code}</div>
                        </td>
                        <td style={{ padding:"8px 8px", textAlign:"right", fontWeight:"600" }}>{s.price}</td>
                        <td style={{ padding:"8px 8px", textAlign:"right", color: c(s), fontWeight:"500" }}>{s.change}</td>
                        <td style={{ padding:"8px 8px", textAlign:"right" }}>
                          <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:3, fontSize:11, fontWeight:700,
                            background: bg(s), color: c(s) }}>{s.pct}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* ③ ETF */}
            <div>
              <div style={{ fontSize:11, fontWeight:700, color:"#0d2d52", letterSpacing:1, marginBottom:8 }}>💹 ETF</div>
              {data.etfs.length === 0 ? <PrepMsg label="ETF" /> : (
                <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
                  <tbody>
                    {data.etfs.map(e => (
                      <tr key={e.name} style={{ borderBottom:"1px solid #f7f7f7" }}>
                        <td style={{ padding:"8px 8px", fontWeight:"600", color:"#1a1a1a" }}>{e.name}</td>
                        <td style={{ padding:"8px 8px", textAlign:"right", fontWeight:"600" }}>{e.price}</td>
                        <td style={{ padding:"8px 8px", textAlign:"right", color: c(e), fontWeight:"500" }}>{e.change}</td>
                        <td style={{ padding:"8px 8px", textAlign:"right" }}>
                          <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:3, fontSize:11, fontWeight:700,
                            background: bg(e), color: c(e) }}>{e.pct}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}

        <div style={{ fontSize:"10px", color:"#bbb", textAlign:"right", marginTop:"12px", lineHeight:1.6 }}>
          ※ 한국거래소 발표 종가입니다. 실시간 시세가 아니며, 영업일 기준 1일 후 갱신됩니다.
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [heroArticle, setHeroArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  // 🎠 1면 대표 캐러셀 — 편집국장이 /admin에서 지정 (is_main_featured)
  // 0건이면 heroArticle(최신 1건) 폴백, 1~3건이면 캐러셀로 회전
  const [featuredArticles, setFeaturedArticles] = useState([]);
  const [activeFeaturedIndex, setActiveFeaturedIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const carouselTouchStartRef = useRef(0);
  // 📦 사이드 광고 — admin이 /admin에서 토글 ON 한 기사들 (show_in_side_ad)
  const [sideAdArticles, setSideAdArticles] = useState([]);
  const [popular, setPopular] = useState([]);
  const [videosList, setVideosList] = useState([]);
  const [error, setError] = useState(null);

  // 모바일 더보기 상태 (lg:hidden 분기 전용 — 데스크탑 무영향)
  const [showAllLatest, setShowAllLatest] = useState(false);
  const [showAllPopular, setShowAllPopular] = useState(false);
  const LATEST_INITIAL = 2;
  const POPULAR_INITIAL = 5;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // (1) 1면 대표 캐러셀 — featured 최대 6건 (편집국장 지정 순)
      const { data: featured, error: fErr } = await supabase
        .from('articles')
        .select('slug, title, summary, thumbnail_url, published_at, author_name, channels(name)')
        .eq('status', 'published')
        .eq('is_main_featured', true)
        .order('main_featured_order', { ascending: true })
        .limit(6);
      if (cancelled) return;
      if (fErr) {
        console.error('[FEATURED] supabase error:', fErr);
        setError('대표 기사를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }
      const featuredList = featured ?? [];

      // (2) 그리드용 latest — featured slug 제외하고 fetch (중복 노출 방지)
      //     featured 0건이면 limit 7 (폴백: 첫번째가 hero), 있으면 limit 6
      let latestQuery = supabase
        .from('articles')
        .select('slug, title, summary, thumbnail_url, published_at, author_name, channels(name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false });
      if (featuredList.length > 0) {
        const slugList = featuredList.map(a => `"${a.slug}"`).join(',');
        latestQuery = latestQuery.not('slug', 'in', `(${slugList})`).limit(6);
      } else {
        latestQuery = latestQuery.limit(7);
      }
      const { data: latest, error: lErr } = await latestQuery;
      if (cancelled) return;
      if (lErr) {
        console.error('[HERO+ARTICLES] supabase error:', lErr);
        setError('최신 기사를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }

      // (3) 폴백 분기
      if (featuredList.length === 0) {
        // 폴백: 기존 로직 그대로 — 최신 1건 hero + 나머지 6건 그리드
        setFeaturedArticles([]);
        setHeroArticle(latest?.[0] ?? null);
        setArticles(latest?.slice(1) ?? []);
      } else {
        // 캐러셀 활성: featured는 캐러셀, latest는 그리드
        setFeaturedArticles(featuredList);
        setHeroArticle(null);
        setArticles(latest ?? []);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // 📦 사이드 광고 fetch — show_in_side_ad=true 기사를 side_ad_order ASC
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('articles')
        .select('slug, title, summary, thumbnail_url, side_ad_badge')
        .eq('status', 'published')
        .eq('show_in_side_ad', true)
        .order('side_ad_order', { ascending: true, nullsFirst: false })
        .limit(5);
      if (cancelled) return;
      if (err) { console.error('[SIDE_AD] supabase error:', err); return; }
      setSideAdArticles(data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  // 🎠 캐러셀 자동 회전 (5초) + 호버 일시정지
  useEffect(() => {
    if (featuredArticles.length <= 1 || carouselPaused) return;
    const id = setInterval(() => {
      setActiveFeaturedIndex(i => (i + 1) % featuredArticles.length);
    }, 5000);
    return () => clearInterval(id);
  }, [featuredArticles.length, carouselPaused]);

  // 캐러셀 핸들러 (공용)
  const carouselNext = () => setActiveFeaturedIndex(i => (i + 1) % featuredArticles.length);
  const carouselPrev = () => setActiveFeaturedIndex(i => (i - 1 + featuredArticles.length) % featuredArticles.length);
  const carouselJump = (i) => setActiveFeaturedIndex(i);
  const carouselOnTouchStart = (e) => { carouselTouchStartRef.current = e.changedTouches[0].screenX; };
  const carouselOnTouchEnd = (e) => {
    const delta = carouselTouchStartRef.current - e.changedTouches[0].screenX;
    if (Math.abs(delta) > 50 && featuredArticles.length > 1) {
      if (delta > 0) carouselNext(); else carouselPrev();
    }
  };

  // 🔥 이번주 인기 기사 — view_count 우선, 동률 시 published_at 보조
  // (view_count 카운팅 시작 전까지는 사실상 최신순으로 동작)
  // limit 10: 모바일은 5건 노출 + 더보기로 10건. 데스크탑 사이드바는 .slice(0,5)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await supabase
        .from('articles')
        .select('slug, title, summary, thumbnail_url, author_name, published_at, channels(name)')
        .eq('status', 'published')
        .order('view_count', { ascending: false })
        .order('published_at', { ascending: false })
        .limit(10);
      if (cancelled) return;
      if (queryError) {
        console.error('[POPULAR] supabase error:', queryError);
        setError(prev => prev || '인기 기사를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }
      setPopular(data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  // 📺 영상 갤러리 fetch — video_url 있는 published 기사, 최신순 최대 6건
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await supabase
        .from('articles')
        .select('slug, title, video_url, thumbnail_url, channels(name)')
        .eq('status', 'published')
        .not('video_url', 'is', null)
        .neq('video_url', '')
        .order('published_at', { ascending: false })
        .limit(6);
      if (cancelled) return;
      if (queryError) {
        console.error('[VIDEOS] supabase error:', queryError);
        return;
      }
      setVideosList(data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <div style={{ fontFamily:"'Noto Sans KR',sans-serif", background:"#f7f8fa", color:"#1a1a1a", minHeight:"100vh" }}>

      {error && (
        <div role="alert" style={{
          maxWidth:"1200px", margin:"24px auto 0", padding:"14px 20px",
          background:"#fff5f5", color:"#c0392b",
          borderLeft:"4px solid #c0392b", fontSize:"14px", lineHeight:"1.6"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ━━━━━━━━━━━ 모바일·태블릿 신문형 (lg 미만) ━━━━━━━━━━━ */}
      {/* 순서: HERO → 최신 → 카드뉴스 → 인기 → 광고 → 7채널 → 주식 */}
      <div className="lg:hidden">

        {/* ① HERO 톱 — 1면 대표 캐러셀 (1~3개) 또는 폴백(최신 1건) */}
        {featuredArticles.length > 0 ? (
          <div className="px-4 pt-5 pb-5 mb-5 border-b border-neutral-200"
               onTouchStart={carouselOnTouchStart} onTouchEnd={carouselOnTouchEnd}>
            {/* 슬라이드 영역 — 3개 다 DOM 렌더, opacity로만 토글 (크롤러·SEO 정합) */}
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 rounded-sm mb-3">
              {featuredArticles.map((a, i) => {
                const active = i === activeFeaturedIndex;
                return (
                  <Link key={a.slug} to={"/article/" + a.slug}
                    aria-hidden={!active} tabIndex={active ? 0 : -1}
                    style={{
                      position: i === 0 ? 'relative' : 'absolute',
                      inset: 0,
                      opacity: active ? 1 : 0,
                      pointerEvents: active ? 'auto' : 'none',
                      transition: 'opacity 0.5s ease',
                      display: 'block',
                    }}>
                    <img src={a.thumbnail_url} alt={a.title}
                      className="w-full h-full object-cover" />
                    {a.channels?.name && (
                      <span className="absolute top-2 right-2 bg-white/95 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded">
                        {a.channels.name}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
            {/* 슬라이드 텍스트 영역 — 3개 다 DOM 렌더 */}
            <div className="relative">
              {featuredArticles.map((a, i) => {
                const active = i === activeFeaturedIndex;
                return (
                  <Link key={a.slug + '-text'} to={"/article/" + a.slug}
                    aria-hidden={!active} tabIndex={active ? 0 : -1}
                    style={{
                      position: i === 0 ? 'relative' : 'absolute',
                      inset: i === 0 ? 'auto' : 0,
                      opacity: active ? 1 : 0,
                      pointerEvents: active ? 'auto' : 'none',
                      transition: 'opacity 0.5s ease',
                      display: 'block', textDecoration: 'none', color: 'inherit',
                    }}>
                    <h2 className="font-serif text-[22px] font-bold leading-[1.3] text-neutral-900 mb-2 line-clamp-3">
                      {a.title}
                    </h2>
                    <p className="text-[14px] text-neutral-600 line-clamp-1 mb-1">
                      {a.summary}
                    </p>
                    <div className="text-[11px] text-neutral-500">
                      {a.author_name ? `${a.author_name} · ` : ''}{formatDate(a.published_at)}
                    </div>
                  </Link>
                );
              })}
            </div>
            {/* 점 인디케이터 (모바일·데스크탑 공통) */}
            {featuredArticles.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {featuredArticles.map((_, i) => (
                  <button key={i} type="button"
                    onClick={() => carouselJump(i)}
                    aria-label={`슬라이드 ${i + 1} 보기`}
                    aria-current={i === activeFeaturedIndex}
                    className="block"
                    style={{
                      width: 10, height: 10, padding: 0,
                      borderRadius: '50%', border: 'none',
                      background: i === activeFeaturedIndex ? '#0d2d52' : '#cfd3da',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }} />
                ))}
              </div>
            )}
          </div>
        ) : heroArticle && (
          /* 폴백 — featured 0건일 때 최신 1건 hero (기존 로직) */
          <Link to={"/article/" + heroArticle.slug}
            className="block px-4 pt-5 pb-5 mb-5 border-b border-neutral-200">
            <div className="relative aspect-[4/3] overflow-hidden bg-neutral-100 rounded-sm mb-3">
              <img src={heroArticle.thumbnail_url} alt={heroArticle.title}
                className="w-full h-full object-cover" />
              {heroArticle.channels?.name && (
                <span className="absolute top-2 right-2 bg-white/95 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded">
                  {heroArticle.channels.name}
                </span>
              )}
            </div>
            <h2 className="font-serif text-[22px] font-bold leading-[1.3] text-neutral-900 mb-2 line-clamp-3">
              {heroArticle.title}
            </h2>
            <p className="text-[14px] text-neutral-600 line-clamp-1 mb-1">
              {heroArticle.summary}
            </p>
            <div className="text-[11px] text-neutral-500">
              {heroArticle.author_name ? `${heroArticle.author_name} · ` : ''}{formatDate(heroArticle.published_at)}
            </div>
          </Link>
        )}

        {/* ② 📰 최신 기사 (박스형 2열, 모바일) — 더보기로 2↔6 펼침 */}
        {articles.length >= 2 && (() => {
          const visible = showAllLatest ? articles : articles.slice(0, LATEST_INITIAL);
          const remaining = articles.length - LATEST_INITIAL;
          const showMoreBtn = !showAllLatest && remaining > 0;
          return (
            <div className="px-4 mb-7">
              <div className="flex items-end justify-between border-b-2 border-neutral-900 pb-2 mb-3">
                <h2 className="font-serif font-bold text-[18px]">📰 최신 기사</h2>
                {showMoreBtn && (
                  <button type="button" onClick={() => setShowAllLatest(true)}
                    className="text-[12px] font-bold text-[#0d2d52] pb-0.5"
                    style={{ fontFamily: "'Noto Sans KR',sans-serif" }}>
                    더보기 ({remaining}) →
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {visible.map(a => (
                  <Link key={a.slug} to={"/article/" + a.slug} className="block">
                    <div className="relative aspect-square overflow-hidden bg-neutral-100 rounded-sm mb-2">
                      <img src={a.thumbnail_url} alt={a.title}
                        className="w-full h-full object-cover" loading="lazy" />
                      {a.channels?.name && (
                        <span className="absolute top-2 left-2 bg-white/95 text-neutral-900 text-[10px] font-bold px-2 py-0.5 rounded">
                          {a.channels.name}
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif font-bold text-[14px] leading-snug line-clamp-2 text-neutral-900">
                      {a.title}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          );
        })()}

        {/* ③ 📺 영상 갤러리 — video_url 있는 기사 (0건이면 섹션 숨김) */}
        {videosList.length > 0 && (
          <div className="px-4 mb-7">
            <div className="flex items-end justify-between border-b-2 border-neutral-900 pb-2 mb-3">
              <h2 className="font-serif font-bold text-[18px]">📺 영상 갤러리</h2>
            </div>
            <VideoGallery videos={videosList} />
          </div>
        )}

        {/* ⑤ 🔥 이번주 인기 기사 (88×88 리스트형, 모바일) — 더보기로 5↔10 펼침 */}
        {popular.length > 0 && (() => {
          const visible = showAllPopular ? popular : popular.slice(0, POPULAR_INITIAL);
          const remaining = popular.length - POPULAR_INITIAL;
          const showMoreBtn = !showAllPopular && remaining > 0;
          return (
            <div className="px-4 mb-7">
              <div className="flex items-end justify-between border-b-2 border-neutral-900 pb-2 mb-3">
                <h2 className="font-serif font-bold text-[18px]">🔥 이번주 인기 기사</h2>
                {showMoreBtn && (
                  <button type="button" onClick={() => setShowAllPopular(true)}
                    className="text-[12px] font-bold text-[#0d2d52] pb-0.5"
                    style={{ fontFamily: "'Noto Sans KR',sans-serif" }}>
                    더보기 ({remaining}) →
                  </button>
                )}
              </div>
              <ul className="divide-y divide-neutral-200">
                {visible.map((p, i) => (
                  <li key={p.slug}>
                    <Link to={"/article/" + p.slug} className="flex gap-3 py-3.5 active:bg-neutral-50">
                      <span className="flex-shrink-0 w-7 text-center font-serif font-bold text-[18px] text-[#c9a84c] pt-1">
                        {i + 1}
                      </span>
                      <div className="flex-shrink-0 w-[88px] h-[88px] overflow-hidden bg-neutral-100 rounded-sm">
                        <img src={p.thumbnail_url} alt={p.title}
                          className="w-full h-full object-cover" loading="lazy" />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                        <div>
                          <h3 className="font-serif font-bold text-[15px] leading-snug line-clamp-2 mb-1 text-neutral-900">
                            {p.title}
                          </h3>
                          {p.summary && (
                            <p className="text-[12px] text-neutral-600 line-clamp-1">
                              {p.summary}
                            </p>
                          )}
                        </div>
                        <div className="text-[10px] text-neutral-500 mt-1">
                          {p.author_name ? `${p.author_name} · ` : ''}{formatDate(p.published_at)}
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })()}

        {/* ⑤ 광고 — 피움 고정 배너 → 양주상회 → 플레이앤팝 → 닥터리부트 */}
        {/* ⑤-pium 피움앱 고정 배너 — 항상 맨 위 */}
        <div className="px-4 mb-7">
          <div style={{ background:"#f0fdf4", border:"2px solid #166534", borderRadius:"4px", overflow:"hidden" }}>
            <Link to="/pium" style={{ display:"block", textDecoration:"none" }}>
              <img src="/pium-banner.png" alt="피움앱 — 경험이 기술을 입다"
                   style={{ display:"block", width:"100%", maxHeight:"50px", objectFit:"contain", objectPosition:"center" }} />
            </Link>
            <div style={{ padding:"7px 10px", display:"flex", gap:"6px" }}>
              <Link to="/pium"
                    style={{ flex:1, display:"block", textAlign:"center", background:"#166534", color:"white", padding:"7px 0", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"'Noto Sans KR', sans-serif", borderRadius:"2px" }}>
                웹앱스토어 →
              </Link>
              <Link to="/pium-request"
                    style={{ flex:1, display:"block", textAlign:"center", background:"transparent", color:"#166534", padding:"7px 0", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"'Noto Sans KR', sans-serif", borderRadius:"2px", border:"1.5px solid #166534" }}>
                제작 문의 →
              </Link>
            </div>
          </div>
        </div>

        {/* ⑤-a 양주상회 — 사진 배너 + 내부 라우트 (기사) */}
        <div className="px-4 mb-7">
          <div className="text-[10px] text-neutral-500 tracking-widest mb-2">광고</div>
          <Link to="/article/article-q787vlqn"
                className="block bg-white border border-neutral-200 rounded-sm overflow-hidden no-underline">
            <img src="/ads/yangju-sanghoe.jpg" alt="양주상회 종암동 고깃집"
                 loading="lazy"
                 className="block w-full h-[120px] object-cover" />
            <div className="p-4">
              <div className="text-[15px] font-bold text-[#0d2d52] mb-1 leading-snug">
                14년 부부의 손맛, 종암동 고깃집
              </div>
              <div className="text-[12px] text-neutral-600 leading-relaxed mb-3">
                직접 농사 · 김장 1000포기
              </div>
              <div className="w-full bg-[#0d2d52] text-white text-center py-3 text-[14px] font-bold rounded-sm">
                기사 보기 →
              </div>
            </div>
          </Link>
        </div>

        {/* ⑤-ab 사이드 광고 (DB 토글) — 양주상회 카드 아래, 모바일 */}
        {sideAdArticles.map(ad => (
          <div key={ad.slug} className="px-4 mb-7">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] text-neutral-500 tracking-widest">광고</div>
              {ad.side_ad_badge && (
                <span className="text-[10px] font-bold text-[#1c4f8a] bg-[#e8f0fa] px-2 py-0.5 rounded tracking-wider">
                  {ad.side_ad_badge}
                </span>
              )}
            </div>
            <Link to={"/article/" + ad.slug}
                  className="block bg-white border border-neutral-200 rounded-sm overflow-hidden no-underline">
              {ad.thumbnail_url && (
                <img src={ad.thumbnail_url} alt={ad.title}
                     loading="lazy"
                     className="block w-full h-[120px] object-cover" />
              )}
              <div className="p-4">
                <div className="text-[15px] font-bold text-[#0d2d52] mb-1 leading-snug line-clamp-2">
                  {ad.title}
                </div>
                {ad.summary && (
                  <div className="text-[12px] text-neutral-600 leading-relaxed mb-3 line-clamp-2">
                    {ad.summary}
                  </div>
                )}
                <div className="w-full bg-[#0d2d52] text-white text-center py-3 text-[14px] font-bold rounded-sm">
                  기사 보기 →
                </div>
              </div>
            </Link>
          </div>
        ))}

        {/* ⑤-b 플레이앤팝 — 사진 배너 + 내부 라우트 (기사) */}
        <div className="px-4 mb-7">
          <div className="text-[10px] text-neutral-500 tracking-widest mb-2">광고</div>
          <Link to="/article/article-idb8v7ux"
                className="block bg-white border border-neutral-200 rounded-sm overflow-hidden no-underline">
            <img src="/ads/play-and-pop.jpg" alt="오창 플레이앤팝 인형뽑기"
                 loading="lazy"
                 className="block w-full h-[120px] object-cover" />
            <div className="p-4">
              <div className="text-[15px] font-bold text-[#0d2d52] mb-1 leading-snug">
                인건비 없이 24시간, 무인 인형뽑기 창업
              </div>
              <div className="text-[12px] text-neutral-600 leading-relaxed mb-3">
                오창 플레이앤팝 창업 이야기
              </div>
              <div className="w-full bg-[#0d2d52] text-white text-center py-3 text-[14px] font-bold rounded-sm">
                기사 보기 →
              </div>
            </div>
          </Link>
        </div>

        {/* ⑤-c 닥터리부트 — 사진 배너 + 외부 링크 (네이버 지도) — SNS 4개 유지 */}
        <div className="px-4 mb-7">
          <div className="text-[10px] text-neutral-500 tracking-widest mb-2">광고</div>
          <a href="https://naver.me/GWeDuL23" target="_blank" rel="noopener noreferrer"
             className="block bg-white border border-neutral-200 rounded-sm overflow-hidden no-underline">
            <img src="/ads/dr-reboot.jpg" alt="닥터리부트 두피관리센터"
                 loading="lazy"
                 className="block w-full h-[120px] object-cover" />
            <div className="p-4">
              <div className="text-[15px] font-bold text-[#0d2d52] mb-1 leading-snug">
                고객의 마지막 희망이 되고픈
              </div>
              <div className="text-[12px] text-neutral-600 leading-relaxed mb-3">
                정세연 원장 · 두피전문가 27년<br />
                일산 · 브레인트레이너 · SMP디자인전문가
              </div>
              <div className="w-full bg-[#0d2d52] text-white text-center py-3 text-[14px] font-bold rounded-sm">
                예약 · 문의 →
              </div>
            </div>
          </a>
        </div>

        {/* ⑥ 7채널 가로 스크롤 칩 — 채널 진입 */}
        <div className="px-4 mb-7">
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
            {NAV_CHANNELS.map(ch => (
              <Link
                key={ch.slug}
                to={`/channel/${ch.slug}`}
                className={`flex-shrink-0 px-4 py-2 rounded-full ${CHANNEL_COLORS[ch.color]} text-[12px] font-bold`}
              >
                {ch.name}
              </Link>
            ))}
          </div>
        </div>

        {/* ⑦ 📊 주식 위젯 — PC 위젯 재사용 */}
        <div className="px-4 mb-7">
          <StockWidget />
        </div>
      </div>

      {/* ━━━━━━━━━━━ 데스크탑 본문 (lg 이상) — 기존 그대로 ━━━━━━━━━━━ */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_300px]" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 32px 56px", gap:"40px", alignItems:"start" }}>

        <main>
          {/* 히어로 — 1면 대표 캐러셀 (1~3개) 또는 폴백(최신 1건) */}
          {featuredArticles.length > 0 ? (
            <div style={{ position:"relative", marginBottom:"24px" }}
                 onMouseEnter={() => setCarouselPaused(true)}
                 onMouseLeave={() => setCarouselPaused(false)}>
              {/* 슬라이드 컨테이너 — 3개 다 DOM 렌더, opacity로만 토글 */}
              <div style={{ position:"relative", width:"100%", height:"380px", overflow:"hidden" }}>
                {featuredArticles.map((a, i) => {
                  const active = i === activeFeaturedIndex;
                  return (
                    <Link key={a.slug} to={"/article/" + a.slug}
                      aria-hidden={!active} tabIndex={active ? 0 : -1}
                      style={{
                        position:"absolute", inset:0,
                        display:"block", textDecoration:"none",
                        opacity: active ? 1 : 0,
                        pointerEvents: active ? 'auto' : 'none',
                        transition: 'opacity 0.5s ease',
                      }}>
                      <img src={a.thumbnail_url} alt={a.title}
                        style={{ width:"100%", height:"380px", objectFit:"cover", display:"block" }} />
                      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)" }} />
                      <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"28px" }}>
                        <span style={{ fontSize:"10px", color:"#c9a84c", fontWeight:"700", letterSpacing:"2px" }}>{a.channels?.name}</span>
                        <h2 style={{ fontFamily:"serif", fontSize:"26px", fontWeight:"700", color:"white", lineHeight:"1.4", margin:"8px 0", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a.title}</h2>
                        <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.8)", margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a.summary}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
              {/* 좌우 화살표 — 데스크탑 전용 (2개 이상일 때만) */}
              {featuredArticles.length > 1 && (
                <>
                  <button type="button" onClick={carouselPrev}
                    aria-label="이전 슬라이드"
                    style={{
                      position:"absolute", left:12, top:"50%", transform:"translateY(-50%)",
                      width:40, height:40, borderRadius:"50%",
                      background:"rgba(0,0,0,0.45)", color:"#fff",
                      border:"none", cursor:"pointer", fontSize:18, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}>
                    ‹
                  </button>
                  <button type="button" onClick={carouselNext}
                    aria-label="다음 슬라이드"
                    style={{
                      position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                      width:40, height:40, borderRadius:"50%",
                      background:"rgba(0,0,0,0.45)", color:"#fff",
                      border:"none", cursor:"pointer", fontSize:18, fontWeight:700,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"background 0.15s",
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,0,0,0.7)"}
                    onMouseLeave={e => e.currentTarget.style.background = "rgba(0,0,0,0.45)"}>
                    ›
                  </button>
                </>
              )}
              {/* 점 인디케이터 (이미지 위 오버레이) */}
              {featuredArticles.length > 1 && (
                <div style={{
                  position:"absolute", bottom:12, left:0, right:0,
                  display:"flex", justifyContent:"center", gap:8,
                }}>
                  {featuredArticles.map((_, i) => (
                    <button key={i} type="button"
                      onClick={() => carouselJump(i)}
                      aria-label={`슬라이드 ${i + 1} 보기`}
                      aria-current={i === activeFeaturedIndex}
                      style={{
                        width:10, height:10, padding:0,
                        borderRadius:"50%", border:"1px solid rgba(255,255,255,0.7)",
                        background: i === activeFeaturedIndex ? '#fff' : 'rgba(255,255,255,0.3)',
                        cursor:"pointer", transition:"background 0.15s",
                      }} />
                  ))}
                </div>
              )}
            </div>
          ) : heroArticle ? (
            /* 폴백 — featured 0건일 때 최신 1건 hero (기존 로직) */
            <Link to={"/article/" + heroArticle.slug} style={{ display:"block", textDecoration:"none", marginBottom:"24px", position:"relative", overflow:"hidden" }}>
              <img src={heroArticle.thumbnail_url} alt={heroArticle.title} style={{ width:"100%", height:"380px", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.1) 60%)" }} />
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"28px" }}>
                <span style={{ fontSize:"10px", color:"#c9a84c", fontWeight:"700", letterSpacing:"2px" }}>{heroArticle.channels?.name}</span>
                <h2 style={{ fontFamily:"serif", fontSize:"26px", fontWeight:"700", color:"white", lineHeight:"1.4", margin:"8px 0", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{heroArticle.title}</h2>
                <p style={{ fontSize:"13px", color:"rgba(255,255,255,0.8)", margin:0, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{heroArticle.summary}</p>
              </div>
            </Link>
          ) : (
            <div style={{
              width:"100%", height:"380px", background:"#e8e8e8", marginBottom:"24px",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#999", fontSize:"14px"
            }} aria-busy="true">
              기사를 불러오는 중...
            </div>
          )}

          {/* 채널 아이콘 바 */}
          <div className="grid grid-cols-4 lg:grid-cols-7" style={{ gap:"8px", marginBottom:"24px" }}>
            {CHANNELS.map(ch => (
              <Link key={ch.slug} to={"/channel/" + ch.slug}
                style={{ textDecoration:"none", textAlign:"center", padding:"12px 4px", background:"#fff", border:"1px solid #e8e8e8" }}>
                <div style={{ fontSize:"20px", marginBottom:"4px" }}>{ch.icon}</div>
                <div style={{ fontSize:"10px", fontWeight:"600", color:"#0d2d52" }}>{ch.name}</div>
              </Link>
            ))}
          </div>

          {/* 📰 최신 기사 (박스형 2열) */}
          <div style={{
            display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
            borderBottom: '2px solid #1a1a1a', paddingBottom: 8, marginBottom: 16,
          }}>
            <h2 style={{
              fontFamily: 'serif', fontSize: 22, fontWeight: 700,
              color: '#0d2d52', margin: 0,
            }}>
              📰 최신 기사
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap:"20px" }}>
            {articles.length > 0
              ? articles.map(a => (
                  <Link key={a.slug} to={"/article/" + a.slug}
                    style={{ textDecoration:"none", background:"#fff", border:"1px solid #e8e8e8", display:"block" }}>
                    <img src={a.thumbnail_url} alt={a.title} style={{ width:"100%", height:"170px", objectFit:"cover", display:"block" }} />
                    <div style={{ padding:"14px" }}>
                      <div style={{ fontSize:"10px", color: CC[a.channels?.name] || "#0d2d52", fontWeight:"700", marginBottom:"6px" }}>{a.channels?.name}</div>
                      <div style={{ fontSize:"14px", fontWeight:"600", color:"#1a1a1a", lineHeight:"1.5", marginBottom:"8px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{a.title}</div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:"10px", color:"#9a9a9a" }}>
                        <span>{formatDate(a.published_at)}</span>
                      </div>
                    </div>
                  </Link>
                ))
              : Array.from({length: 6}).map((_, i) => (
                  <div key={"sk-"+i} style={{ background:"#fff", border:"1px solid #e8e8e8" }} aria-busy="true">
                    <div style={{ width:"100%", height:"170px", background:"#e8e8e8" }} />
                    <div style={{ padding:"14px" }}>
                      <div style={{ width:"40%", height:"10px", background:"#e8e8e8", marginBottom:"6px" }} />
                      <div style={{ width:"95%", height:"14px", background:"#e8e8e8", marginBottom:"4px" }} />
                      <div style={{ width:"70%", height:"14px", background:"#e8e8e8", marginBottom:"8px" }} />
                      <div style={{ width:"30%", height:"10px", background:"#e8e8e8" }} />
                    </div>
                  </div>
                ))
            }
          </div>

          {/* 📺 영상 갤러리 — 데스크탑 (주식 위젯 앞) */}
          {videosList.length > 0 && (
            <div style={{ marginTop: 40 }}>
              <div style={{
                display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
                borderBottom: '2px solid #1a1a1a', paddingBottom: 8, marginBottom: 16,
              }}>
                <h2 style={{
                  fontFamily: 'serif', fontSize: 22, fontWeight: 700,
                  color: '#0d2d52', margin: 0,
                }}>
                  📺 영상 갤러리
                </h2>
              </div>
              <VideoGallery videos={videosList} />
            </div>
          )}

          {/* 주식 현황 위젯 */}
          <StockWidget />
        </main>

        {/* 사이드바 — 협찬 3개 (양주상회 → 플레이앤팝 → 닥터리부트) */}
        <aside className="lg:sticky lg:top-5" style={{ display:"flex", flexDirection:"column", gap:"24px" }}>

          {/* 🌱 피움앱 고정 배너 — 항상 첫 번째 */}
          <div style={{ background:"#f0fdf4", border:"2px solid #166534", borderRadius:"4px", overflow:"hidden" }}>
            <Link to="/pium" style={{ display:"block", textDecoration:"none" }}>
              <img src="/pium-banner.png" alt="피움앱 — 경험이 기술을 입다"
                   style={{ display:"block", width:"100%", maxHeight:"120px", objectFit:"contain", objectPosition:"center" }} />
            </Link>
            <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:"7px" }}>
              <Link to="/pium"
                    style={{ display:"block", textAlign:"center", background:"#166534", color:"white", padding:"8px", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"'Noto Sans KR', sans-serif", borderRadius:"2px" }}>
                웹앱스토어 구경하기 →
              </Link>
              <Link to="/pium-request"
                    style={{ display:"block", textAlign:"center", background:"transparent", color:"#166534", padding:"7px", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"'Noto Sans KR', sans-serif", borderRadius:"2px", border:"1.5px solid #166534" }}>
                이런 앱이 필요하세요? →
              </Link>
            </div>
          </div>

          {/* 광고(양주상회) — 사진 배너 + 내부 라우트 */}
          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px" }}>
            <div style={{ fontSize:"9px", color:"#9a9a9a", letterSpacing:"1px", marginBottom:"10px" }}>광고</div>
            <img src="/ads/yangju-sanghoe.jpg" alt="양주상회 종암동 고깃집"
                 loading="lazy"
                 style={{ display:"block", width:"100%", height:"120px", objectFit:"cover", marginBottom:"12px", borderRadius:"2px" }} />
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#0d2d52", marginBottom:"3px", lineHeight:"1.4" }}>14년 부부의 손맛, 종암동 고깃집</div>
            <div style={{ fontSize:"11px", color:"#6b6b6b", lineHeight:"1.6", marginBottom:"12px" }}>
              직접 농사 · 김장 1000포기
            </div>
            <Link to="/article/article-q787vlqn"
                  style={{ display:"block", textAlign:"center", background:"#0d2d52", color:"white", padding:"9px", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
              기사 보기 →
            </Link>
          </div>

          {/* 📦 사이드 광고 (DB 토글) — 양주상회 카드 바로 아래, side_ad_order ASC */}
          {sideAdArticles.map(ad => (
            <div key={ad.slug} style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <div style={{ fontSize:"9px", color:"#9a9a9a", letterSpacing:"1px" }}>광고</div>
                {ad.side_ad_badge && (
                  <span style={{ fontSize:"10px", fontWeight:"700", color:"#1c4f8a", background:"#e8f0fa", padding:"2px 8px", borderRadius:"3px", letterSpacing:"0.5px" }}>
                    {ad.side_ad_badge}
                  </span>
                )}
              </div>
              {ad.thumbnail_url && (
                <img src={ad.thumbnail_url} alt={ad.title}
                     loading="lazy"
                     style={{ display:"block", width:"100%", height:"120px", objectFit:"cover", marginBottom:"12px", borderRadius:"2px" }} />
              )}
              <div style={{ fontSize:"12px", fontWeight:"700", color:"#0d2d52", marginBottom:"3px", lineHeight:"1.4", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{ad.title}</div>
              {ad.summary && (
                <div style={{ fontSize:"11px", color:"#6b6b6b", lineHeight:"1.6", marginBottom:"12px", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>
                  {ad.summary}
                </div>
              )}
              <Link to={"/article/" + ad.slug}
                    style={{ display:"block", textAlign:"center", background:"#0d2d52", color:"white", padding:"9px", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
                기사 보기 →
              </Link>
            </div>
          ))}

          {/* 광고(플레이앤팝) — 사진 배너 + 내부 라우트 */}
          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px" }}>
            <div style={{ fontSize:"9px", color:"#9a9a9a", letterSpacing:"1px", marginBottom:"10px" }}>광고</div>
            <img src="/ads/play-and-pop.jpg" alt="오창 플레이앤팝 인형뽑기"
                 loading="lazy"
                 style={{ display:"block", width:"100%", height:"120px", objectFit:"cover", marginBottom:"12px", borderRadius:"2px" }} />
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#0d2d52", marginBottom:"3px", lineHeight:"1.4" }}>인건비 없이 24시간, 무인 인형뽑기 창업</div>
            <div style={{ fontSize:"11px", color:"#6b6b6b", lineHeight:"1.6", marginBottom:"12px" }}>
              오창 플레이앤팝 창업 이야기
            </div>
            <Link to="/article/article-idb8v7ux"
                  style={{ display:"block", textAlign:"center", background:"#0d2d52", color:"white", padding:"9px", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
              기사 보기 →
            </Link>
          </div>

          {/* 광고(닥터리부트) — 사진 배너 + 외부 링크 + SNS 4개 유지 */}
          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px" }}>
            <div style={{ fontSize:"9px", color:"#9a9a9a", letterSpacing:"1px", marginBottom:"10px" }}>광고</div>
            <img src="/ads/dr-reboot.jpg" alt="닥터리부트 두피관리센터"
                 loading="lazy"
                 style={{ display:"block", width:"100%", height:"120px", objectFit:"cover", marginBottom:"12px", borderRadius:"2px" }} />
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#0d2d52", marginBottom:"3px", lineHeight:"1.4" }}>고객의 마지막 희망이 되고픈</div>
            <div style={{ fontSize:"11px", color:"#6b6b6b", lineHeight:"1.6", marginBottom:"12px" }}>
              정세연 원장 · 두피전문가 27년<br />
              일산 · 브레인트레이너 · SMP디자인전문가
            </div>
            <a href="https://naver.me/GWeDuL23" target="_blank" rel="noopener noreferrer"
               style={{ display:"block", textAlign:"center", background:"#0d2d52", color:"white", padding:"9px", fontSize:"11px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit", marginBottom:"10px" }}>
              예약 · 문의 →
            </a>
            <div style={{ display:"flex", justifyContent:"space-around", paddingTop:"10px", borderTop:"1px solid #e8e8e8" }}>
              <a href="http://dr-reboot.co.kr/" target="_blank" rel="noopener noreferrer" title="홈페이지" style={{ fontSize:"16px", textDecoration:"none", lineHeight:1 }}>🏠</a>
              <a href="https://naver.me/GWeDuL23" target="_blank" rel="noopener noreferrer" title="네이버 지도" style={{ fontSize:"16px", textDecoration:"none", lineHeight:1 }}>📍</a>
              <a href="https://www.youtube.com/channel/UCVdGlBOwnxzPs5rnNGhAZuQ" target="_blank" rel="noopener noreferrer" title="유튜브" style={{ fontSize:"16px", textDecoration:"none", lineHeight:1 }}>🎥</a>
              <a href="https://blog.naver.com/mzk6682" target="_blank" rel="noopener noreferrer" title="네이버 블로그" style={{ fontSize:"16px", textDecoration:"none", lineHeight:1 }}>✍️</a>
            </div>
          </div>

          <div style={{ background:"#fff", border:"1px solid #e0e0e0", padding:"16px" }}>
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#555", borderBottom:"2px solid #0d2d52", paddingBottom:"8px", marginBottom:"12px" }}>🔥 이번주 인기 기사</div>
            {popular.length > 0
              ? popular.slice(0, 5).map((p,i) => (
                  <Link key={p.slug} to={"/article/" + p.slug} style={{ display:"flex", gap:"10px", padding:"8px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none", alignItems:"center" }}>
                    <span style={{ fontSize:"13px", fontWeight:"700", color:"#c9a84c", width:"16px", flexShrink:0 }}>{i+1}</span>
                    <img src={p.thumbnail_url} alt={p.title} style={{ width:"52px", height:"40px", objectFit:"cover", borderRadius:"2px", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:"10px", color: CC[p.channels?.name] || "#0d2d52", fontWeight:"700", marginBottom:"2px" }}>{p.channels?.name}</div>
                      <div style={{ fontSize:"11px", color:"#1a1a1a", lineHeight:"1.4", fontWeight:"500", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{p.title}</div>
                    </div>
                  </Link>
                ))
              : Array.from({length: 5}).map((_, i) => (
                  <div key={"pk-"+i} style={{ display:"flex", gap:"10px", padding:"8px 0", borderBottom:"1px solid #f0f0f0", alignItems:"center" }} aria-busy="true">
                    <span style={{ fontSize:"13px", fontWeight:"700", color:"#e0e0e0", width:"16px", flexShrink:0 }}>{i+1}</span>
                    <div style={{ width:"52px", height:"40px", background:"#e8e8e8", flexShrink:0, borderRadius:"2px" }} />
                    <div style={{ flex:1 }}>
                      <div style={{ width:"40%", height:"10px", background:"#e8e8e8", marginBottom:"4px" }} />
                      <div style={{ width:"90%", height:"11px", background:"#e8e8e8" }} />
                    </div>
                  </div>
                ))
            }
          </div>

          <div style={{ background:"#0d2d52", padding:"24px", textAlign:"center" }}>
            <img src="/logo.png" alt="이음미디어" style={{ height:"44px", display:"block", margin:"0 auto 12px" }} />
            <div style={{ fontFamily:"serif", fontSize:"16px", fontWeight:"700", color:"white", marginBottom:"6px" }}>
              이<span style={{ color:"#f0a882" }}>음</span>미디어 구독
            </div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"12px", lineHeight:"1.7", marginBottom:"16px" }}>새 기사 발행 시<br />카카오톡으로 바로 알림!</div>
            <a href="http://pf.kakao.com/_DxnesX/friend" target="_blank" rel="noopener noreferrer"
               style={{ display:"block", textAlign:"center", width:"100%", boxSizing:"border-box", background:"#FEE500", color:"#3C1E1E", padding:"12px", fontSize:"13px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
              💬 카카오 채널 구독 (무료)
            </a>
          </div>
        </aside>
      </div>

    </div>
  );
}
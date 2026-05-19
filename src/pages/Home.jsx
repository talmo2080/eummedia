import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

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

const STOCKS = {
  전체: [
    { name:"삼성전자",  code:"005930", price:"73,400", change:"+1,200", pct:"+1.66%", up:true },
    { name:"SK하이닉스", code:"000660", price:"192,500", change:"+3,500", pct:"+1.85%", up:true },
    { name:"NAVER",     code:"035420", price:"198,000", change:"-2,000", pct:"-1.00%", up:false },
    { name:"카카오",     code:"035720", price:"41,200",  change:"+400",   pct:"+0.98%", up:true },
    { name:"현대차",     code:"005380", price:"224,000", change:"-1,500", pct:"-0.67%", up:false },
    { name:"LG에너지솔루션", code:"373220", price:"312,000", change:"+5,000", pct:"+1.63%", up:true },
  ],
  코스피: [
    { name:"삼성전자",  code:"005930", price:"73,400", change:"+1,200", pct:"+1.66%", up:true },
    { name:"SK하이닉스", code:"000660", price:"192,500", change:"+3,500", pct:"+1.85%", up:true },
    { name:"현대차",     code:"005380", price:"224,000", change:"-1,500", pct:"-0.67%", up:false },
    { name:"LG에너지솔루션", code:"373220", price:"312,000", change:"+5,000", pct:"+1.63%", up:true },
    { name:"POSCO홀딩스", code:"005490", price:"334,000", change:"+2,000", pct:"+0.60%", up:true },
    { name:"셀트리온",   code:"068270", price:"158,000", change:"-1,200", pct:"-0.75%", up:false },
  ],
  코스닥: [
    { name:"에코프로비엠", code:"247540", price:"198,500", change:"+4,500", pct:"+2.32%", up:true },
    { name:"셀트리온헬스케어", code:"091990", price:"68,200", change:"-800", pct:"-1.16%", up:false },
    { name:"카카오게임즈", code:"293490", price:"18,350", change:"+250", pct:"+1.38%", up:true },
    { name:"HLB",        code:"028300", price:"87,400",  change:"+1,200", pct:"+1.39%", up:true },
    { name:"펄어비스",   code:"263750", price:"32,150",  change:"-350",   pct:"-1.08%", up:false },
    { name:"크래프톤",   code:"259960", price:"312,000", change:"+3,500", pct:"+1.13%", up:true },
  ],
  ETF: [
    { name:"KODEX 200",       code:"069500", price:"37,125", change:"+325", pct:"+0.88%", up:true },
    { name:"KODEX 코스닥150", code:"229200", price:"12,845", change:"+185", pct:"+1.46%", up:true },
    { name:"KODEX 인버스",    code:"114800", price:"4,320",  change:"-45",  pct:"-1.03%", up:false },
    { name:"TIGER 미국S&P500", code:"360750", price:"18,250", change:"+220", pct:"+1.22%", up:true },
    { name:"KODEX 반도체",    code:"091160", price:"42,350", change:"+850", pct:"+2.05%", up:true },
    { name:"TIGER 차이나전기차", code:"371460", price:"9,870", change:"-120", pct:"-1.20%", up:false },
  ],
};

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

// Mock 카드뉴스 4건 (편집 3 + 광고 1) — Supabase 토큰 갱신 후 실데이터로 교체 예정
// 이미지는 unsplash 임시 placeholder, 추후 /img/cardnews-N.jpg 로 교체
const MOCK_CARDNEWS = [
  { id: 'c1', title: '600번의 월요일, 웃음으로 지은 기적',
    thumb: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80',
    channel: '이음매거진', channel_color: 'rose', is_sponsored: false },
  { id: 'c2', title: '닥터리부트 정세연 원장의 두피 인사이트',
    thumb: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80',
    channel: '이음로컬', channel_color: 'emerald', is_sponsored: true },
  { id: 'c3', title: '태리TV 윤진희, 13만 유튜버 인터뷰',
    thumb: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80',
    channel: '이음피플', channel_color: 'amber', is_sponsored: false },
  { id: 'c4', title: '고양시 청소년 진로교육 현장 스케치',
    thumb: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&q=80',
    channel: '이음에듀', channel_color: 'sky', is_sponsored: false },
];

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function StockWidget() {
  const tabs = ["전체","코스피","코스닥","ETF"];
  const [activeTab, setActiveTab] = useState("전체");
  const stocks = STOCKS[activeTab];
  return (
    <div style={{ background:"#fff", border:"1px solid #e0e0e0", borderTop:"3px solid #0d2d52", marginTop:"40px" }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 20px 0" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <span style={{ fontSize:"16px" }}>📈</span>
          <span style={{ fontSize:"14px", fontWeight:"700", color:"#0d2d52" }}>주식 현황</span>
          <span style={{ fontSize:"11px", color:"#9a9a9a", marginLeft:"4px" }}>실시간 시세</span>
        </div>
        <a href="#" style={{ fontSize:"11px", color:"#1c4f8a", textDecoration:"none" }}>더보기 →</a>
      </div>
      <div style={{ display:"flex", borderBottom:"1px solid #e0e0e0", padding:"0 20px", marginTop:"12px" }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ padding:"8px 16px", fontSize:"12px", fontWeight: tab === activeTab ? "700" : "400",
              color: tab === activeTab ? "#0d2d52" : "#9a9a9a", background:"none", border:"none",
              borderBottom: tab === activeTab ? "2px solid #0d2d52" : "2px solid transparent",
              cursor:"pointer", fontFamily:"inherit", marginBottom:"-1px" }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ padding:"0 20px 16px" }}>
        <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"12px" }}>
          <thead>
            <tr style={{ borderBottom:"1px solid #f0f0f0" }}>
              <th style={{ padding:"10px 8px 8px", textAlign:"left", color:"#9a9a9a", fontWeight:"500" }}>종목명</th>
              <th style={{ padding:"10px 8px 8px", textAlign:"right", color:"#9a9a9a", fontWeight:"500" }}>현재가</th>
              <th style={{ padding:"10px 8px 8px", textAlign:"right", color:"#9a9a9a", fontWeight:"500" }}>전일대비</th>
              <th style={{ padding:"10px 8px 8px", textAlign:"right", color:"#9a9a9a", fontWeight:"500" }}>등락률</th>
            </tr>
          </thead>
          <tbody>
            {stocks.map(s => (
              <tr key={s.code} style={{ borderBottom:"1px solid #f7f7f7" }}
                onMouseEnter={e => e.currentTarget.style.background="#f7f9fc"}
                onMouseLeave={e => e.currentTarget.style.background="transparent"}>
                <td style={{ padding:"10px 8px" }}>
                  <div style={{ fontWeight:"600", color:"#1a1a1a" }}>{s.name}</div>
                  <div style={{ fontSize:"10px", color:"#bbb", marginTop:"1px" }}>{s.code}</div>
                </td>
                <td style={{ padding:"10px 8px", textAlign:"right", fontWeight:"600" }}>{s.price}</td>
                <td style={{ padding:"10px 8px", textAlign:"right", color: s.up ? "#e74c3c" : "#1c7ed6", fontWeight:"500" }}>{s.change}</td>
                <td style={{ padding:"10px 8px", textAlign:"right" }}>
                  <span style={{ display:"inline-block", padding:"2px 8px", borderRadius:"3px", fontSize:"11px", fontWeight:"700",
                    background: s.up ? "#fff0f0" : "#f0f4ff", color: s.up ? "#e74c3c" : "#1c7ed6" }}>
                    {s.pct}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={{ fontSize:"10px", color:"#bbb", textAlign:"right", marginTop:"8px" }}>
          ※ 데이터는 샘플입니다. 실제 연동 후 업데이트 예정
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [heroArticle, setHeroArticle] = useState(null);
  const [articles, setArticles] = useState([]);
  const [popular, setPopular] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await supabase
        .from('articles')
        .select('slug, title, summary, thumbnail_url, published_at, author_name, channels(name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(7);
      if (cancelled) return;
      if (queryError) {
        console.error('[HERO+ARTICLES] supabase error:', queryError);
        setError('최신 기사를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }
      setHeroArticle(data?.[0] ?? null);
      setArticles(data?.slice(1) ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: queryError } = await supabase
        .from('articles')
        .select('slug, title, thumbnail_url, channels(name)')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .range(7, 11);
      if (cancelled) return;
      if (queryError) {
        console.error('[POPULAR] supabase error:', queryError);
        setError(prev => prev || '추천 기사를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }
      setPopular(data ?? []);
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
      <div className="lg:hidden">

        {/* ① HERO 톱 1개 */}
        {heroArticle && (
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

        {/* ② 서브 톱 2개 */}
        {articles.length >= 2 && (
          <div className="grid grid-cols-2 gap-3 px-4 pb-5 mb-6 border-b border-neutral-200">
            {articles.slice(0, 2).map(a => (
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
        )}

        {/* ③ 카드뉴스 모음 (편집 3 + 광고 1) */}
        <div className="px-4 mb-7">
          <div className="flex items-end justify-between border-b-2 border-neutral-900 pb-2 mb-3">
            <h2 className="font-serif font-bold text-[18px]">📱 카드뉴스 모음</h2>
            <Link to="/" className="text-[11px] text-neutral-500">더보기 →</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_CARDNEWS.map(item => (
              <article key={item.id}>
                <div className="relative aspect-square overflow-hidden bg-neutral-100 rounded-sm mb-2">
                  <img src={item.thumb} alt={item.title}
                    className="w-full h-full object-cover" loading="lazy" />
                  {item.is_sponsored ? (
                    <span className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded tracking-wider">
                      SPONSORED
                    </span>
                  ) : (
                    <span className={`absolute top-2 left-2 ${CHANNEL_COLORS[item.channel_color]} text-[10px] font-bold px-2 py-0.5 rounded`}>
                      {item.channel}
                    </span>
                  )}
                </div>
                <h3 className="font-serif font-bold text-[14px] leading-snug line-clamp-2 text-neutral-900">
                  {item.title}
                </h3>
              </article>
            ))}
          </div>
        </div>

        {/* ④ 최신 기사 (신문형 리스트 5건) */}
        <div className="px-4 mb-7">
          <div className="flex items-end justify-between border-b-2 border-neutral-900 pb-2 mb-3">
            <h2 className="font-serif font-bold text-[18px]">📰 최신 기사</h2>
            <Link to="/" className="text-[11px] text-neutral-500">더보기 →</Link>
          </div>
          <ul className="divide-y divide-neutral-200">
            {articles.slice(2, 7).map(a => (
              <li key={a.slug}>
                <Link to={"/article/" + a.slug} className="flex gap-3 py-3.5 active:bg-neutral-50">
                  <div className="flex-shrink-0 w-[88px] h-[88px] overflow-hidden bg-neutral-100 rounded-sm">
                    <img src={a.thumbnail_url} alt={a.title}
                      className="w-full h-full object-cover" loading="lazy" />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <div>
                      <h3 className="font-serif font-bold text-[15px] leading-snug line-clamp-2 mb-1 text-neutral-900">
                        {a.title}
                      </h3>
                      <p className="text-[12px] text-neutral-600 line-clamp-1">
                        {a.summary}
                      </p>
                    </div>
                    <div className="text-[10px] text-neutral-500 mt-1">
                      {a.author_name ? `${a.author_name} · ` : ''}{formatDate(a.published_at)}
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ⑤ 7채널 가로 스크롤 칩 */}
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

        {/* TODO: commit 44+ 에서 채널별 미니 섹션 추가 (세연님 Q4=c 차후) */}
      </div>

      {/* ━━━━━━━━━━━ 데스크탑 본문 (lg 이상) — 기존 그대로 ━━━━━━━━━━━ */}
      <div className="hidden lg:grid lg:grid-cols-[1fr_300px]" style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 32px 56px", gap:"40px", alignItems:"start" }}>

        <main>
          {/* 히어로 */}
          {heroArticle ? (
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

          {/* 기사 그리드 */}
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

          {/* 주식 현황 위젯 */}
          <StockWidget />
        </main>

        {/* 사이드바 */}
        <aside className="lg:sticky lg:top-5" style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px" }}>
            <div style={{ fontSize:"9px", color:"#9a9a9a", letterSpacing:"1px", marginBottom:"10px" }}>광고</div>
            <div style={{ width:"100%", height:"120px", background:"linear-gradient(135deg,#0d2d52,#1c4f8a)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"12px", borderRadius:"2px" }}>
              <div style={{ textAlign:"center", color:"white", padding:"0 12px" }}>
                <div style={{ fontSize:"22px", marginBottom:"6px" }}>💆</div>
                <div style={{ fontSize:"12px", fontWeight:"700" }}>닥터리부트 두피관리센터</div>
              </div>
            </div>
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
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#555", borderBottom:"2px solid #0d2d52", paddingBottom:"8px", marginBottom:"12px" }}>이번 주 추천 기사</div>
            {popular.length > 0
              ? popular.map((p,i) => (
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
            <a href="http://pf.kakao.com/_xmVHxen" target="_blank" rel="noopener noreferrer"
               style={{ display:"block", textAlign:"center", width:"100%", boxSizing:"border-box", background:"#FEE500", color:"#3C1E1E", padding:"12px", fontSize:"13px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
              💬 카카오 채널 구독 (무료)
            </a>
          </div>
        </aside>
      </div>

      </div>
  );
}
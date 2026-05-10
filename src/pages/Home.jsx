import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const CC = {
  "이음매거진":"#0d2d52","이음뉴스":"#c0392b","이음에듀":"#1a6b3c",
  "이음피플":"#5c2d8a","이음트렌드":"#c45c0a","이음보이스":"#1c4f8a",
  "이음뷰":"#8a6a00","이음로컬":"#1a6b3c",
};

const CHANNELS = [
  { slug:"이음매거진", icon:"📰" },
  { slug:"이음로컬",   icon:"📍" },
  { slug:"이음에듀",   icon:"📚" },
  { slug:"이음피플",   icon:"👤" },
  { slug:"이음트렌드", icon:"📈" },
  { slug:"이음보이스", icon:"🎙️" },
  { slug:"이음뷰",     icon:"👁️" },
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
        .select('slug, title, summary, thumbnail_url, published_at, channels(name)')
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

      {/* 본문 */}
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"32px 32px 56px", display:"grid", gridTemplateColumns:"1fr 300px", gap:"40px", alignItems:"start" }}>

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
          <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:"8px", marginBottom:"24px" }}>
            {CHANNELS.map(ch => (
              <Link key={ch.slug} to={"/channel/" + ch.slug}
                style={{ textDecoration:"none", textAlign:"center", padding:"12px 4px", background:"#fff", border:"1px solid #e8e8e8" }}>
                <div style={{ fontSize:"20px", marginBottom:"4px" }}>{ch.icon}</div>
                <div style={{ fontSize:"10px", fontWeight:"600", color:"#0d2d52" }}>{ch.slug}</div>
              </Link>
            ))}
          </div>

          {/* 기사 그리드 */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
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
        <aside style={{ display:"flex", flexDirection:"column", gap:"24px", position:"sticky", top:"20px" }}>
          <div style={{ background:"#0d2d52", padding:"24px", textAlign:"center" }}>
            <img src="/logo.png" alt="이음미디어" style={{ height:"44px", display:"block", margin:"0 auto 12px" }} />
            <div style={{ fontFamily:"serif", fontSize:"16px", fontWeight:"700", color:"white", marginBottom:"6px" }}>
              이<span style={{ color:"#f0a882" }}>음</span>미디어 구독
            </div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"12px", lineHeight:"1.7", marginBottom:"16px" }}>새 기사 발행 시<br />카카오톡으로 바로 알림!</div>
            <button style={{ width:"100%", background:"#FEE500", color:"#3C1E1E", border:"none", padding:"12px", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>
              💬 카카오 채널 구독 (무료)
            </button>
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

          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px" }}>
            <div style={{ fontSize:"9px", color:"#9a9a9a", letterSpacing:"1px", marginBottom:"10px" }}>AD</div>
            <div style={{ width:"100%", height:"120px", background:"linear-gradient(135deg,#0d2d52,#1c4f8a)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"12px" }}>
              <div style={{ textAlign:"center", color:"white" }}>
                <div style={{ fontSize:"22px", marginBottom:"6px" }}>💆</div>
                <div style={{ fontSize:"13px", fontWeight:"700" }}>닥터리부트</div>
                <div style={{ fontSize:"10px", opacity:0.75, marginTop:"3px" }}>두피케어 전문 27년</div>
              </div>
            </div>
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#0d2d52", marginBottom:"4px" }}>두피케어 전문 27년</div>
            <div style={{ fontSize:"11px", color:"#6b6b6b", lineHeight:"1.7", marginBottom:"12px" }}>고양시 일산 · 탈모 예방 전문</div>
            <button style={{ width:"100%", background:"#0d2d52", color:"white", border:"none", padding:"9px", fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>예약 · 문의 →</button>
          </div>
        </aside>
      </div>

      </div>
  );
}
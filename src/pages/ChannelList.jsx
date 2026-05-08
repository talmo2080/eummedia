import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

const CHANNELS = ["전체", "이음매거진", "이음로컬", "이음에듀", "이음피플", "이음트렌드", "이음보이스", "이음뷰"];

const CHANNEL_META = {
  전체:      { icon: "📋", desc: "이음미디어의 모든 채널 콘텐츠",      color: "#0d2d52", accent: "#c9a84c" },
  이음매거진: { icon: "📖", desc: "두피·미용·라이프스타일 전문 콘텐츠", color: "#0d2d52", accent: "#4a9eff" },
  이음로컬:   { icon: "📍", desc: "지역 소식과 우리 동네 이야기",       color: "#1a4d2e", accent: "#4caf78" },
  이음에듀:   { icon: "🎓", desc: "교육·자격·평생학습 정보",            color: "#3d1f6b", accent: "#a78bfa" },
  이음피플:   { icon: "👤", desc: "사람과 이야기 — 인터뷰 & 칼럼",     color: "#6b1f1f", accent: "#f87171" },
  이음트렌드: { icon: "📈", desc: "사회·문화 최신 트렌드 분석",         color: "#7c4a00", accent: "#fb923c" },
  이음보이스: { icon: "🎙️", desc: "독자 칼럼·시민 목소리",             color: "#064e3b", accent: "#34d399" },
  이음뷰:    { icon: "🎬", desc: "영상·포토·멀티미디어 콘텐츠",        color: "#1e1b4b", accent: "#818cf8" },
};

const PAGE_SIZE = 9;

const DUMMY = [
  { id:"1", slug:"hair-care-secrets-2026", title:"두피 건강의 비밀, 27년 전문가가 전하는 모발 관리의 모든 것", summary:"두피 건강은 단순히 미적 문제가 아닙니다. 전신 건강과 직결된 신호를 올바르게 읽는 법을 알아봅니다.", thumbnail:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", author:"정세연", channel:"이음매거진", tags:["두피","모발관리","건강"], views:1240, published_at:"2026-05-01T09:00:00Z", is_sponsored:false, is_featured:true },
  { id:"2", slug:"scalp-spring-care", title:"봄철 두피 트러블, 원인과 해결책 완벽 정리", summary:"환절기마다 반복되는 두피 트러블. 전문가가 알려주는 시즌별 맞춤 케어 방법을 소개합니다.", thumbnail:"https://images.unsplash.com/photo-1559599101-f09722fb4948?w=800&q=80", author:"정세연", channel:"이음매거진", tags:["두피","봄케어"], views:876, published_at:"2026-04-28T10:30:00Z", is_sponsored:false, is_featured:false },
  { id:"3", slug:"ilsan-local-news", title:"일산 호수공원 봄 축제, 10만 인파 몰려", summary:"경기도 고양시 일산 호수공원에서 열린 봄 축제에 10만 명이 방문했습니다.", thumbnail:"https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80", author:"이음로컬팀", channel:"이음로컬", tags:["일산","고양","축제"], views:2103, published_at:"2026-04-25T08:00:00Z", is_sponsored:false, is_featured:true },
  { id:"4", slug:"lifelong-edu-trend", title:"평생교육원 설립 열풍, 언론기관 부설의 장점과 절차는?", summary:"언론사 부설 평생교육원 설립이 주목받는 이유와 실제 절차, 비용, 필요 인력을 상세히 정리했습니다.", thumbnail:"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&q=80", author:"이음에듀팀", channel:"이음에듀", tags:["평생교육","교육원"], views:654, published_at:"2026-04-20T14:00:00Z", is_sponsored:false, is_featured:false },
  { id:"5", slug:"interview-scalp-expert", title:"두피 전문가 27년, 닥터리부트 정세연 원장 단독 인터뷰", summary:"일산 두피관리센터를 운영하며 매거진 편집국장까지, 두 가지 꿈을 동시에 실현하는 삶의 이야기.", thumbnail:"https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80", author:"이음피플팀", channel:"이음피플", tags:["인터뷰","두피전문가"], views:3410, published_at:"2026-04-15T11:00:00Z", is_sponsored:false, is_featured:true },
  { id:"6", slug:"web-dev-beginner-journey", title:"50대의 웹개발 도전기, Claude AI와 함께하는 코딩 여정", summary:"전문가도 초보자도 아닌 새로운 도전자로서 React와 Supabase를 배워가는 현실적인 이야기.", thumbnail:"https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80", author:"정세연", channel:"이음피플", tags:["웹개발","AI","도전"], views:1892, published_at:"2026-04-10T09:00:00Z", is_sponsored:true, is_featured:false },
  { id:"7", slug:"kpop-trend-2026", title:"2026 K-콘텐츠 트렌드, 글로벌을 넘어 일상으로", summary:"K-드라마, K-뷰티, K-푸드까지. 한류가 일상이 된 시대의 새로운 트렌드를 분석합니다.", thumbnail:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&q=80", author:"이음트렌드팀", channel:"이음트렌드", tags:["트렌드","한류","K콘텐츠"], views:1560, published_at:"2026-04-08T09:00:00Z", is_sponsored:false, is_featured:false },
  { id:"8", slug:"citizen-voice-education", title:"우리 동네 교육 현실, 학부모 100인의 목소리", summary:"전국 학부모 100명이 말하는 교육 현장의 진짜 이야기. 변화가 필요한 것들을 솔직하게 담았습니다.", thumbnail:"https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&q=80", author:"시민기자 박민정", channel:"이음보이스", tags:["교육","시민","목소리"], views:789, published_at:"2026-04-01T09:00:00Z", is_sponsored:false, is_featured:false },
  { id:"9", slug:"spring-fashion-view", title:"봄 패션 화보, 이음뷰가 담은 2026 스프링 룩", summary:"이음미디어 포토팀이 직접 촬영한 2026 봄 패션 화보. 일상에서 완성하는 스프링 스타일링.", thumbnail:"https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=800&q=80", author:"이음뷰팀", channel:"이음뷰", tags:["패션","화보","뷰티"], views:2210, published_at:"2026-03-28T10:00:00Z", is_sponsored:false, is_featured:false },
];

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
  return `${Math.floor(diff/86400)}일 전`;
}

export default function ChannelList() {
  const { channelName } = useParams();
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState(channelName || "전체");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const switchChannel = useCallback((ch) => {
    setActiveChannel(ch); setPage(1); setSearchQuery(""); setSearchInput("");
    if (ch === "전체") navigate("/channel"); else navigate(`/channel/${ch}`);
  }, [navigate]);

  useEffect(() => { setPage(1); loadArticles(); }, [activeChannel, sortBy]);

  async function loadArticles() {
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));
    let result = [...DUMMY];
    if (activeChannel !== "전체") result = result.filter(a => a.channel === activeChannel);
    if (sortBy === "popular") result.sort((a,b) => b.views - a.views);
    else result.sort((a,b) => new Date(b.published_at) - new Date(a.published_at));
    setArticles(result); setLoading(false);
  }

  const filtered = articles.filter(a => !searchQuery || a.title.includes(searchQuery) || a.summary.includes(searchQuery) || a.tags.some(t => t.includes(searchQuery)));
  const featured = !searchQuery && activeChannel === "전체" ? filtered.find(a => a.is_featured) : null;
  const listItems = featured ? filtered.filter(a => a.id !== featured.id) : filtered;
  const paginated = listItems.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < listItems.length;
  const meta = CHANNEL_META[activeChannel] || CHANNEL_META["전체"];

  return (
    <div style={s.page}>
      <div style={{...s.banner,background:`linear-gradient(135deg,${meta.color} 0%,${meta.color}dd 100%)`}}>
        <div style={s.bannerInner}>
          <span style={s.bannerIcon}>{meta.icon}</span>
          <div><h1 style={s.bannerTitle}>{activeChannel}</h1><p style={s.bannerDesc}>{meta.desc}</p></div>
        </div>
        <div style={{...s.bannerLine,background:meta.accent}}/>
      </div>

      <main style={s.main}>
        <div style={s.filterBar}>
          <div style={s.tabRow}>
            {CHANNELS.map(ch=>(
              <button key={ch} onClick={()=>switchChannel(ch)}
                style={{...s.tab,...(activeChannel===ch?{...s.tabActive,borderBottomColor:meta.accent}:{})}}>
                {ch!=="전체"&&<span>{CHANNEL_META[ch].icon} </span>}{ch}
              </button>
            ))}
          </div>
          <div style={s.filterRight}>
            <div style={s.sortGroup}>
              {[["latest","최신순"],["popular","인기순"]].map(([v,l])=>(
                <button key={v} onClick={()=>{setSortBy(v);setPage(1);}}
                  style={{...s.sortBtn,...(sortBy===v?s.sortActive:{})}}>{l}</button>
              ))}
            </div>
            <form onSubmit={e=>{e.preventDefault();setSearchQuery(searchInput);setPage(1);}} style={s.searchForm}>
              <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} placeholder="기사 검색..." style={s.searchInput}/>
              <button type="submit" style={s.searchBtn}>🔍</button>
            </form>
          </div>
        </div>

        {searchQuery&&(
          <div style={s.searchResult}>
            <strong>"{searchQuery}"</strong> 검색결과 {filtered.length}건
            <button onClick={()=>{setSearchQuery("");setSearchInput("");}} style={s.clearBtn}>✕ 초기화</button>
          </div>
        )}

        {loading&&<div style={s.skeletonGrid}>{[0,1,2].map(i=><div key={i} style={s.skeleton}/>)}</div>}

        {!loading&&filtered.length===0&&(
          <div style={s.empty}><div style={{fontSize:"3rem"}}>📭</div><p style={{color:"#888",marginTop:12}}>{searchQuery?"검색 결과가 없습니다.":"아직 기사가 없습니다."}</p></div>
        )}

        {!loading&&featured&&(
          <Link to={`/article/${featured.slug}`} style={{textDecoration:"none"}}>
            <article style={s.featured}>
              <div style={s.featuredImgWrap}><img src={featured.thumbnail} alt={featured.title} style={s.featuredImg}/></div>
              <div style={s.featuredBody}>
                <div style={s.featuredMeta}>
                  <span style={{...s.badge,background:CHANNEL_META[featured.channel]?.color}}>{CHANNEL_META[featured.channel]?.icon} {featured.channel}</span>
                  <span style={s.featuredLabel}>✦ 추천기사</span>
                </div>
                <h2 style={s.featuredTitle}>{featured.title}</h2>
                <p style={s.featuredSummary}>{featured.summary}</p>
                <div style={s.featuredFooter}>
                  <span style={s.metaText}>✍ {featured.author}</span>
                  <span style={s.metaText}>👁 {featured.views.toLocaleString()}</span>
                  <span style={s.metaText}>{timeAgo(featured.published_at)}</span>
                </div>
              </div>
            </article>
          </Link>
        )}

        {!loading&&paginated.length>0&&(
          <>
            <div style={s.grid}>{paginated.map(a=><ArticleCard key={a.id} article={a}/>)}</div>
            {hasMore&&<button style={s.loadMore} onClick={()=>setPage(p=>p+1)}>기사 더 보기 ({listItems.length-paginated.length}개 남음) ↓</button>}
          </>
        )}
      </main>

      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}.ecard:hover{transform:translateY(-4px)!important;box-shadow:0 12px 32px rgba(0,0,0,0.13)!important}.ecard:hover img{transform:scale(1.05)!important}`}</style>
    </div>
  );
}

function ArticleCard({article}) {
  const meta = CHANNEL_META[article.channel]||CHANNEL_META["전체"];
  return (
    <Link to={`/article/${article.slug}`} style={{textDecoration:"none"}}>
      <article className="ecard" style={s.card}>
        <div style={s.cardImgWrap}>
          <img src={article.thumbnail} alt={article.title} style={s.cardImg}/>
          <span style={{...s.badge,position:"absolute",bottom:10,left:10,background:meta.color}}>{meta.icon} {article.channel}</span>
          {article.is_sponsored&&<span style={s.adBadge}>AD</span>}
        </div>
        <div style={s.cardBody}>
          <h3 style={s.cardTitle}>{article.title}</h3>
          <p style={s.cardSummary}>{article.summary}</p>
          <div style={s.tagRow}>{article.tags.slice(0,3).map(t=><span key={t} style={s.tag}>#{t}</span>)}</div>
          <div style={s.cardFooter}>
            <span style={s.metaText}>✍ {article.author}</span>
            <div style={{display:"flex",gap:8}}>
              <span style={s.metaText}>👁 {article.views.toLocaleString()}</span>
              <span style={s.metaText}>{timeAgo(article.published_at)}</span>
            </div>
          </div>
        </div>
      </article>
    </Link>
  );
}

const s = {
  page:{minHeight:"100vh",background:"#f5f7fa",fontFamily:"'Noto Sans KR',sans-serif"},
  banner:{padding:"28px 0",position:"relative",overflow:"hidden"},
  bannerInner:{maxWidth:1200,margin:"0 auto",padding:"0 24px",display:"flex",alignItems:"center",gap:16},
  bannerIcon:{fontSize:"2.2rem"},
  bannerTitle:{fontFamily:"'Noto Serif KR',serif",fontSize:"1.7rem",fontWeight:900,color:"#fff",margin:0},
  bannerDesc:{color:"rgba(255,255,255,0.7)",fontSize:"0.88rem",margin:"4px 0 0"},
  bannerLine:{position:"absolute",bottom:0,left:0,right:0,height:3},
  main:{maxWidth:1200,margin:"0 auto",padding:"28px 24px"},
  filterBar:{background:"#fff",borderRadius:12,padding:"0 16px",marginBottom:24,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8,boxShadow:"0 2px 8px rgba(0,0,0,0.06)"},
  tabRow:{display:"flex",overflowX:"auto"},
  tab:{background:"none",border:"none",borderBottom:"3px solid transparent",padding:"14px 10px 11px",cursor:"pointer",fontSize:"0.82rem",color:"#666",fontFamily:"'Noto Sans KR',sans-serif",transition:"all 0.2s",whiteSpace:"nowrap"},
  tabActive:{color:"#0d2d52",fontWeight:700},
  filterRight:{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"},
  sortGroup:{display:"flex",gap:6},
  sortBtn:{background:"#f5f7fa",border:"1.5px solid #e2e8f0",color:"#666",padding:"6px 12px",borderRadius:20,cursor:"pointer",fontSize:"0.8rem",fontFamily:"'Noto Sans KR',sans-serif"},
  sortActive:{background:"#0d2d52",color:"#c9a84c",borderColor:"#0d2d52",fontWeight:600},
  searchForm:{display:"flex"},
  searchInput:{border:"1.5px solid #e2e8f0",borderRight:"none",borderRadius:"20px 0 0 20px",padding:"6px 12px",fontSize:"0.82rem",outline:"none",fontFamily:"'Noto Sans KR',sans-serif",width:130},
  searchBtn:{background:"#0d2d52",color:"#fff",border:"none",borderRadius:"0 20px 20px 0",padding:"6px 12px",cursor:"pointer"},
  searchResult:{background:"#fffbeb",border:"1px solid #f0d060",borderRadius:8,padding:"10px 16px",marginBottom:20,fontSize:"0.88rem",color:"#555",display:"flex",alignItems:"center",gap:12},
  clearBtn:{background:"none",border:"1px solid #ccc",borderRadius:12,padding:"3px 10px",cursor:"pointer",fontSize:"0.78rem",color:"#888"},
  skeletonGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:24},
  skeleton:{height:300,borderRadius:14,background:"linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%)",backgroundSize:"800px 100%",animation:"shimmer 1.5s infinite"},
  empty:{textAlign:"center",padding:"80px 20px"},
  featured:{display:"grid",gridTemplateColumns:"1.1fr 0.9fr",background:"#fff",borderRadius:16,overflow:"hidden",marginBottom:28,boxShadow:"0 4px 20px rgba(0,0,0,0.08)",cursor:"pointer"},
  featuredImgWrap:{position:"relative",minHeight:280,overflow:"hidden"},
  featuredImg:{width:"100%",height:"100%",objectFit:"cover",display:"block"},
  featuredBody:{padding:"32px 28px",display:"flex",flexDirection:"column",justifyContent:"center",gap:12},
  featuredMeta:{display:"flex",gap:10,alignItems:"center"},
  featuredLabel:{fontSize:"0.78rem",color:"#c9a84c",fontWeight:600},
  featuredTitle:{fontFamily:"'Noto Serif KR',serif",fontSize:"1.4rem",fontWeight:700,color:"#0d2d52",lineHeight:1.5,margin:0},
  featuredSummary:{color:"#555",fontSize:"0.93rem",lineHeight:1.8,margin:0},
  featuredFooter:{display:"flex",gap:12,flexWrap:"wrap"},
  grid:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:24},
  card:{background:"#fff",borderRadius:14,overflow:"hidden",boxShadow:"0 2px 12px rgba(0,0,0,0.06)",cursor:"pointer",transition:"transform 0.2s,box-shadow 0.2s",display:"flex",flexDirection:"column"},
  cardImgWrap:{position:"relative",height:185,overflow:"hidden",background:"#e8ecf0"},
  cardImg:{width:"100%",height:"100%",objectFit:"cover",transition:"transform 0.3s",display:"block"},
  adBadge:{position:"absolute",top:10,right:10,background:"#f59e0b",color:"#fff",fontSize:"0.68rem",padding:"2px 8px",borderRadius:8,fontWeight:700},
  cardBody:{padding:"16px 18px",display:"flex",flexDirection:"column",gap:8,flex:1},
  cardTitle:{fontFamily:"'Noto Serif KR',serif",fontSize:"1rem",fontWeight:700,color:"#1a2744",lineHeight:1.5,margin:0,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"},
  cardSummary:{fontSize:"0.83rem",color:"#666",lineHeight:1.7,margin:0,display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical",overflow:"hidden"},
  tagRow:{display:"flex",gap:6,flexWrap:"wrap"},
  tag:{background:"#f0f4f8",color:"#4a6fa5",fontSize:"0.73rem",padding:"3px 8px",borderRadius:10},
  cardFooter:{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"auto",paddingTop:10,borderTop:"1px solid #f0f4f8"},
  badge:{display:"inline-block",color:"#fff",fontSize:"0.72rem",padding:"3px 9px",borderRadius:10,fontWeight:600},
  metaText:{fontSize:"0.78rem",color:"#aaa"},
  loadMore:{display:"block",margin:"32px auto 0",background:"#fff",border:"2px solid #0d2d52",color:"#0d2d52",padding:"11px 36px",borderRadius:28,cursor:"pointer",fontSize:"0.9rem",fontWeight:600,fontFamily:"'Noto Sans KR',sans-serif"},
};

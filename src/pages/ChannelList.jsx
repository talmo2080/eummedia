import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

const CHANNELS = ["전체", "이음매거진", "이음로컬", "이음에듀", "이음피플", "이음트렌드", "이음보이스", "이음뷰"];

const CHANNEL_META = {
  전체:      { icon: "📋", desc: "이음미디어의 모든 채널 콘텐츠",      color: "#0d2d52", accent: "#c9a84c" },
  이음매거진: { icon: "📖", desc: "이음미디어가 엄선한 이번 주의 시선, 그 이상의 깊이", color: "#0d2d52", accent: "#4a9eff" },
  이음로컬:   { icon: "📍", desc: "가장 가까운 곳의 숨소리에서 세상의 해답을 찾는 현장", color: "#1a4d2e", accent: "#4caf78" },
  이음에듀:   { icon: "🎓", desc: "기술의 속도에 인간의 가치를 더하는 인문학적 배움의 여정", color: "#3d1f6b", accent: "#a78bfa" },
  이음피플:   { icon: "👤", desc: "당신의 삶이 뉴스가 되고, 당신의 이름이 브랜드가 되는 공간", color: "#6b1f1f", accent: "#f87171" },
  이음트렌드: { icon: "📈", desc: "시대의 흐름을 읽고 K-컬처의 미래를 선점하는 감각", color: "#7c4a00", accent: "#fb923c" },
  이음보이스: { icon: "🎙️", desc: "당신의 이야기가 이음미디어를 통해 세상의 울림이 되는 광장", color: "#064e3b", accent: "#34d399" },
  이음뷰:    { icon: "🎬", desc: "복잡한 시대의 실타래를 푸는 이음미디어만의 독창적 시선", color: "#1e1b4b", accent: "#818cf8" },
};

const PAGE_SIZE = 9;

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return "방금 전";
  if (diff < 3600) return `${Math.floor(diff/60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff/3600)}시간 전`;
  return `${Math.floor(diff/86400)}일 전`;
}

export default function ChannelList() {
  const { englishSlug } = useParams();
  const navigate = useNavigate();
  const [activeChannel, setActiveChannel] = useState(englishSlug || "전체");
  const [channel, setChannel] = useState(null);
  const [featured, setFeatured] = useState(null);
  const [latest, setLatest] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("latest");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);

  const switchChannel = useCallback((ch) => {
    setActiveChannel(ch); setPage(1); setSearchQuery(""); setSearchInput("");
    if (ch === "전체") navigate("/channel"); else navigate(`/channel/${ch}`);
  }, [navigate]);

  useEffect(() => {
    if (!englishSlug) return;
    let cancelled = false;
    setPage(1);
    setChannel(null);
    setFeatured(null);
    setLatest([]);
    setError(null);

    (async () => {
      // [1/3] 채널 룩업
      const { data: chData, error: chErr } = await supabase
        .from('channels')
        .select('id, name, english_slug')
        .eq('english_slug', englishSlug)
        .maybeSingle();
      if (cancelled) return;
      if (chErr || !chData) {
        console.error('[CHANNEL] supabase error:', chErr);
        setError('채널 정보를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }
      setChannel(chData);

      // [2/3] 편집국장의 픽 (채널당 1건)
      const { data: fData, error: fErr } = await supabase
        .from('articles')
        .select('slug, title, summary, thumbnail_url, published_at, channels(name)')
        .eq('status', 'published')
        .eq('channel_id', chData.id)
        .eq('is_featured', true)
        .maybeSingle();
      if (cancelled) return;
      if (fErr) {
        console.error('[FEATURED] supabase error:', fErr);
        setError('편집국장의 픽을 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }
      setFeatured(fData);

      // [3/3] 최신 N건 (픽 제외, OFFSET 0)
      const { data: lData, error: lErr } = await supabase
        .from('articles')
        .select('slug, title, summary, thumbnail_url, published_at, channels(name)')
        .eq('status', 'published')
        .eq('channel_id', chData.id)
        .eq('is_featured', false)
        .order('published_at', { ascending: false })
        .range(0, PAGE_SIZE - 1);
      if (cancelled) return;
      if (lErr) {
        console.error('[LATEST] supabase error:', lErr);
        setError(prev => prev || '최신 기사를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
        return;
      }
      setLatest(lData ?? []);
    })();

    return () => { cancelled = true; };
  }, [englishSlug]);

  async function handleLoadMore() {
    if (!channel) return;
    const nextPage = page + 1;
    const from = page * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error: err } = await supabase
      .from('articles')
      .select('slug, title, summary, thumbnail_url, published_at, channels(name)')
      .eq('status', 'published')
      .eq('channel_id', channel.id)
      .eq('is_featured', false)
      .order('published_at', { ascending: false })
      .range(from, to);
    if (err) {
      console.error('[LOAD_MORE] supabase error:', err);
      setError('더 보기 기사를 불러오지 못했어요. 잠시 후 새로고침 해주세요.');
      return;
    }
    setLatest(prev => [...prev, ...(data ?? [])]);
    setPage(nextPage);
  }

  const hasMore = latest.length === PAGE_SIZE * page;
  const meta = CHANNEL_META[channel?.name] || CHANNEL_META[activeChannel] || CHANNEL_META["전체"];

  return (
    <div style={s.page}>
      <div style={{...s.banner,background:`linear-gradient(135deg,${meta.color} 0%,${meta.color}dd 100%)`}}>
        <div style={s.bannerInner}>
          <span style={s.bannerIcon}>{meta.icon}</span>
          <div><h1 style={s.bannerTitle}>{channel?.name ?? activeChannel}</h1><p style={s.bannerDesc}>{meta.desc}</p></div>
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

        {!channel && !error && (
          <div style={s.skeletonGrid}>{[0,1,2].map(i=><div key={i} style={s.skeleton}/>)}</div>
        )}

        {channel && !featured && latest.length === 0 && (
          <div style={s.empty}>
            <div style={{fontSize:"3rem"}}>📭</div>
            <p style={{color:"#888",marginTop:12}}>아직 기사가 없습니다.</p>
          </div>
        )}

        {featured && (
          <Link to={`/article/${featured.slug}`} style={{textDecoration:"none"}}>
            <article style={s.featured}>
              <div style={s.featuredImgWrap}><img src={featured.thumbnail_url} alt={featured.title} style={s.featuredImg}/></div>
              <div style={s.featuredBody}>
                <div style={s.featuredMeta}>
                  <span style={{...s.badge,background:meta.color}}>{meta.icon} {channel?.name}</span>
                  <span style={s.featuredLabel}>✦ 편집국장의 픽</span>
                </div>
                <h2 style={s.featuredTitle}>{featured.title}</h2>
                <p style={s.featuredSummary}>{featured.summary}</p>
              </div>
            </article>
          </Link>
        )}

        {latest.length > 0 && (
          <>
            <div style={s.grid}>{latest.map(a => <ArticleCard key={a.slug} article={a} channelMeta={meta} channelName={channel?.name}/>)}</div>
            {hasMore && (
              <button style={s.loadMore} onClick={handleLoadMore}>
                기사 더 보기 ↓
              </button>
            )}
          </>
        )}
      </main>

      <style>{`@keyframes shimmer{0%{background-position:-400px 0}100%{background-position:400px 0}}.ecard:hover{transform:translateY(-4px)!important;box-shadow:0 12px 32px rgba(0,0,0,0.13)!important}.ecard:hover img{transform:scale(1.05)!important}`}</style>
    </div>
  );
}

function ArticleCard({article, channelMeta, channelName}) {
  const meta = channelMeta || CHANNEL_META["전체"];
  return (
    <Link to={`/article/${article.slug}`} style={{textDecoration:"none"}}>
      <article className="ecard" style={s.card}>
        <div style={s.cardImgWrap}>
          <img src={article.thumbnail_url} alt={article.title} style={s.cardImg}/>
          <span style={{...s.badge,position:"absolute",bottom:10,left:10,background:meta.color}}>{meta.icon} {channelName}</span>
          {article.is_sponsored&&<span style={s.adBadge}>AD</span>}
        </div>
        <div style={s.cardBody}>
          <h3 style={s.cardTitle}>{article.title}</h3>
          <p style={s.cardSummary}>{article.summary}</p>
          <div style={s.tagRow}>{(article.tags ?? []).slice(0,3).map(t=><span key={t} style={s.tag}>#{t}</span>)}</div>
          <div style={s.cardFooter}>
            <span style={s.metaText}>✍ {article.author}</span>
            <div style={{display:"flex",gap:8}}>
              <span style={s.metaText}>👁 {article.views?.toLocaleString() ?? ''}</span>
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

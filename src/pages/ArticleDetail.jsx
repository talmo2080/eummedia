import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";

const CC = {
  "이음매거진":"#0d2d52","이음뉴스":"#c0392b","이음에듀":"#1a6b3c",
  "이음피플":"#5c2d8a","이음트렌드":"#c45c0a","이음보이스":"#1c4f8a",
  "이음뷰":"#8a6a00","이음로컬":"#1a6b3c",
};

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

function splitIntoParagraphs(content) {
  if (!content) return [];
  const PROTECT = '';
  let s = content;
  s = s.replace(/(\d)\.(\d)/g, '$1' + PROTECT + '$2');
  s = s.replace(/[“”][^“”]*[“”]|"[^"]*"/g, (m) => m.replace(/\./g, PROTECT));
  const parts = s.split('.').map(p => p.trim()).filter(Boolean);
  return parts.map(p => p.replace(new RegExp(PROTECT, 'g'), '.') + '.');
}

const socialIconStyle = { fontSize: "24px", textDecoration: "none", lineHeight: 1 };

const AUTHOR_ARTICLES = [
  { id:"a1", title:"닥터리부트, 두피케어의 새로운 기준을 세우다", date:"2026.04.20" },
  { id:"a2", title:"봉숭아학당 26기 수료식, 시민기자의 탄생", date:"2026.04.10" },
  { id:"a3", title:"고양시 일산, 미디어 리터러시 교육 현장", date:"2026.03.28" },
];

const VIDEOS = [
  { id:"v1", title:"이천도자기축제 현장 스케치", duration:"3:24", thumb:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80" },
  { id:"v2", title:"닥터리부트 두피 건강 비법", duration:"5:12", thumb:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80" },
  { id:"v3", title:"봉숭아학당 27기 수료식 현장", duration:"4:08", thumb:"https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&q=80" },
];

const CARDS = [
  { id:"c1", title:"두피 관리 5단계 완전 정복", thumb:"https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400&q=80" },
  { id:"c2", title:"이천도자기축제 하이라이트 10선", thumb:"https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=400&q=80" },
  { id:"c3", title:"시민기자 되는 법 A to Z", thumb:"https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&q=80" },
];

const INIT_COMMENTS = [
  { id:1, name:"김미선", date:"2026.04.28", content:"정말 생생한 취재네요! 😊", likes:8 },
  { id:2, name:"박철수", date:"2026.04.28", content:"장인 시연 영상도 있으면 좋겠어요!", likes:5 },
  { id:3, name:"이순희", date:"2026.04.29", content:"시민기자 이야기가 인상적이었어요.", likes:12 },
];

function ArrowBtn({ onClick, dir }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width:"32px", height:"32px", borderRadius:"50%", background: h ? "#0d2d52" : "#fff", border:"2px solid " + (h ? "#0d2d52" : "#ddd"), color: h ? "#fff" : "#0d2d52", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"18px", fontWeight:"900", transition:"all 0.2s", lineHeight:1 }}>
      {dir === "prev" ? "‹" : "›"}
    </button>
  );
}

function StickyBtn({ onClick, title, bg, fg, active, activeColor, children }) {
  const [h, setH] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        background: bg || (active ? "#fff5f5" : h ? "#f0f4f8" : "#fff"),
        border: "1px solid " + (active ? (activeColor || "#e74c3c") : h ? "#0d2d52" : "#e0e0e0"),
        boxShadow: h ? "0 4px 14px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "all 0.2s",
        gap: "2px",
        color: fg || (active ? activeColor : h ? "#0d2d52" : "#555"),
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}

function StickyReactionBar({ liked, likeCount, onLike, bookmarked, onBookmark, onCopy, copied, onKakao, onFb, commentCount }) {
  const buttons = [
    { icon: liked ? "❤️" : "🤍", label: likeCount, onClick: onLike, title: "좋아요", active: liked, activeColor: "#e74c3c" },
    { icon: "💬", label: commentCount, onClick: () => document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" }), title: "댓글" },
    { icon: bookmarked ? "🔖" : "📌", label: bookmarked ? "저장됨" : "저장", onClick: onBookmark, title: "저장", active: bookmarked, activeColor: "#c9a84c" },
    { type: "divider" },
    { icon: "K", label: "카톡", onClick: onKakao, title: "카카오 공유", bg: "#FEE500", fg: "#3C1E1E", iconStyle: { fontSize: "13px", fontWeight: "900" } },
    { icon: "f", label: "FB", onClick: onFb, title: "페이스북 공유", bg: "#1877F2", fg: "white", iconStyle: { fontSize: "13px", fontWeight: "900" } },
    { icon: copied ? "✅" : "🔗", label: copied ? "복사됨" : "링크", onClick: onCopy, title: "링크 복사" },
  ];

  return (
    <div style={{ position: "sticky", top: "120px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", width: "52px", alignSelf: "flex-start" }}>
      {buttons.map((btn, i) => {
        if (btn.type === "divider") return <div key={i} style={{ width: "1px", height: "14px", background: "#e0e0e0", margin: "2px 0" }} />;
        return (
          <StickyBtn key={i} onClick={btn.onClick} title={btn.title} bg={btn.bg} fg={btn.fg} active={btn.active} activeColor={btn.activeColor}>
            <span style={btn.iconStyle || { fontSize: "16px" }}>{btn.icon}</span>
            <span style={{ fontSize: "9px", color: btn.fg || (btn.active ? btn.activeColor : "#9a9a9a"), fontWeight: "700", lineHeight: 1 }}>{btn.label}</span>
          </StickyBtn>
        );
      })}
    </div>
  );
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [popular, setPopular] = useState([]);
  const [related, setRelated] = useState([]);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(47);
  const [bookmarked, setBookmarked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState(INIT_COMMENTS);
  const [cName, setCName] = useState("");
  const [cText, setCText] = useState("");
  const [videoIdx, setVideoIdx] = useState(0);
  const [cardIdx, setCardIdx] = useState(0);
  const [showAuthorMore, setShowAuthorMore] = useState(false);

  const onLike = () => { setLiked(p => !p); setLikeCount(p => liked ? p - 1 : p + 1); };
  const onBookmark = () => setBookmarked(p => !p);
  const onCopy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch(e) {}
  };
  const onKakao = () => alert("카카오 공유: SDK 연동 후 사용 가능합니다.");
  const onFb = () => window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href), "_blank");
  const onComment = () => {
    if (!cName.trim() || !cText.trim()) return;
    setComments(p => [...p, { id: Date.now(), name: cName, date: "2026.05.01", content: cText, likes: 0 }]);
    setCName(""); setCText("");
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('articles')
        .select('slug, title, summary, content, thumbnail_url, published_at, channel_id, channels(name, slug, english_slug)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (cancelled) return;
      if (err) { setError('기사를 불러오지 못했습니다.'); return; }
      setArticle(data);
    })();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('articles')
        .select('slug, title, thumbnail_url, channels(name)')
        .eq('status', 'published')
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .range(7, 12);
      if (cancelled) return;
      if (err) { console.error('[ArticleDetail POPULAR] supabase error:', err); return; }
      setPopular((data ?? []).slice(0, 5));
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const channelId = article?.channel_id;
  useEffect(() => {
    if (!channelId) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('articles')
        .select('slug, title, thumbnail_url, channels(name)')
        .eq('status', 'published')
        .eq('channel_id', channelId)
        .neq('slug', slug)
        .order('published_at', { ascending: false })
        .limit(3);
      if (cancelled) return;
      if (err) { console.error('[ArticleDetail RELATED] supabase error:', err); return; }
      setRelated(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [channelId, slug]);

  if (error) {
    return (
      <div role="alert" style={{ maxWidth:"800px", margin:"80px auto", padding:"24px", background:"#fff5f5", border:"1px solid #e74c3c", color:"#c0392b", fontSize:"15px", textAlign:"center", fontFamily:"'Noto Sans KR',sans-serif" }}>
        ⚠️ {error}<br />
        <Link to="/" style={{ display:"inline-block", marginTop:"12px", color:"#0d2d52", fontSize:"13px" }}>← 홈으로 돌아가기</Link>
      </div>
    );
  }
  if (!article) {
    return (
      <div aria-busy="true" style={{ maxWidth:"800px", margin:"80px auto", padding:"24px", color:"#9a9a9a", fontSize:"14px", textAlign:"center", fontFamily:"'Noto Sans KR',sans-serif" }}>
        기사를 불러오는 중입니다…
      </div>
    );
  }

  const a = {
    title: article.title,
    subtitle: article.summary,
    channel: article.channels?.name,
    thumbnail: article.thumbnail_url,
    published_at: formatDate(article.published_at),
    content: article.content,
    author_name: "정세연 편집국장",
    author_bio: "닥터리부트 두피관리센터(일산) 원장 · 두피전문가 27년 · 이음미디어 편집국장",
    author_intro: "두피 전문가 27년 경력의 정세연 원장이자 이음미디어 편집국장입니다. 세상을 잇고 사람을 잇는 이야기를 발굴합니다.",
    tags: ["이음매거진","문화","전시"],
    views: 1284,
    read_time: 5,
  };
  const color = CC[a.channel] || "#0d2d52";
  const externalUrl = `https://eummagazine.com/${article.channels?.slug?.split('-').pop()}/?idx=${article.slug}&bmode=view`;

  return (
    <div style={{ fontFamily:"'Noto Sans KR',sans-serif", background:"#fff", color:"#1a1a1a", minHeight:"100vh" }}>

      {/* 브레드크럼 */}
      <div style={{ background:"#f7f8fa", borderBottom:"1px solid #e8e8e8", padding:"10px 0", fontSize:"11px", color:"#9a9a9a" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 32px", display:"flex", gap:"6px", alignItems:"center" }}>
          <Link to="/" style={{ color:"#1c4f8a", textDecoration:"none" }}>홈</Link>
          <span>›</span>
          <Link to={"/" + a.channel} style={{ color:"#1c4f8a", textDecoration:"none" }}>{a.channel}</Link>
          <span>›</span>
          <span>{a.title}</span>
        </div>
      </div>

      {/* 본문 레이아웃: 플로팅바 | 기사 | 사이드바 */}
      <div style={{ maxWidth:"1280px", margin:"0 auto", padding:"48px 32px", display:"grid", gridTemplateColumns:"60px 1fr 300px", gap:"32px", alignItems:"start" }}>

        {/* ★ 왼쪽 sticky 반응 바 */}
        <StickyReactionBar
          liked={liked} likeCount={likeCount} onLike={onLike}
          bookmarked={bookmarked} onBookmark={onBookmark}
          onCopy={onCopy} copied={copied}
          onKakao={onKakao} onFb={onFb}
          commentCount={comments.length}
        />

        {/* 기사 본문 */}
        <main>
          <div style={{ fontSize:"10px", color:color, fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
            <span style={{ width:"24px", height:"1px", background:color, display:"inline-block" }} />{a.channel}
          </div>
          <h1 style={{ fontFamily:"serif", fontSize:"34px", fontWeight:"700", lineHeight:"1.4", color:"#0d2d52", marginBottom:"16px", letterSpacing:"-1px" }}>{a.title}</h1>
          <div style={{ fontFamily:"serif", fontSize:"17px", color:"#5a5a5a", lineHeight:"1.6", marginBottom:"24px", fontStyle:"italic", borderLeft:"3px solid #1c4f8a", paddingLeft:"16px" }}>{a.subtitle}</div>

          {/* 기자 메타 */}
          <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px 0", borderTop:"1px solid #e0e0e0", borderBottom:"1px solid #e0e0e0", marginBottom:"28px" }}>
            <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"18px", fontWeight:"700", flexShrink:0 }}>정</div>
            <div>
              <div style={{ fontSize:"13px", fontWeight:"700", marginBottom:"3px" }}>{a.author_name}</div>
              <div style={{ fontSize:"11px", color:"#9a9a9a" }}>{a.author_bio}</div>
            </div>
            <div style={{ marginLeft:"auto", textAlign:"right", fontSize:"11px", color:"#9a9a9a", lineHeight:"1.8" }}>
              <div>{a.published_at}</div>
              <div>⏱ {a.read_time}분 · 👁 <strong style={{ color:"#555" }}>{a.views.toLocaleString()}</strong></div>
            </div>
          </div>

          {/* 대표 이미지 */}
          <img src={a.thumbnail} alt={a.title} style={{ width:"100%", height:"380px", objectFit:"cover", borderRadius:"4px", marginBottom:"10px", display:"block" }} />
          <div style={{ fontSize:"11px", color:"#9a9a9a", textAlign:"center", marginBottom:"32px", fontStyle:"italic" }}>{a.channel} / 이음미디어</div>

          {/* 본문 — 평문 + 원문 보기 (스테이지 1) */}
          <div style={{ fontFamily:"'Noto Sans KR', sans-serif", fontSize:"17px", lineHeight:"2.0", color:"#222", marginBottom:"24px" }}>
            {splitIntoParagraphs(a.content).flatMap((para, i, arr) => {
              const midIdx = Math.floor((arr.length - 1) / 2);
              const items = [<p key={"p-"+i} style={{ margin:"0 0 1em 0" }}>{para}</p>];
              if (i === midIdx) {
                items.push(
                  <a key={"midad-"+i} href="https://naver.me/GWeDuL23" target="_blank" rel="noopener noreferrer"
                    style={{ display:"flex", alignItems:"center", gap:"16px", width:"100%", minHeight:"80px", padding:"16px 20px", margin:"32px 0", background:"#f7f8fa", border:"1px solid #e0e0e0", borderLeft:"4px solid #1c4f8a", textDecoration:"none", color:"inherit", fontFamily:"'Noto Sans KR', sans-serif" }}>
                    <div style={{ fontSize:"10px", color:"#9a9a9a", letterSpacing:"1px", fontWeight:"700", flexShrink:0, paddingRight:"16px", borderRight:"1px solid #e0e0e0" }}>SPONSORED</div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:"15px", fontWeight:"700", color:"#0d2d52", marginBottom:"4px" }}>닥터리부트 두피관리센터</div>
                      <div style={{ fontFamily:"serif", fontSize:"13px", color:"#5a5a5a", fontStyle:"italic", lineHeight:"1.5" }}>"고객의 마지막 희망이 되고픈 두피전문가"</div>
                    </div>
                    <div style={{ fontSize:"20px", color:"#0d2d52", flexShrink:0 }}>→</div>
                  </a>
                );
              }
              return items;
            })}
          </div>
          <a href={externalUrl} target="_blank" rel="noopener noreferrer"
             style={{ display:"inline-block", background:"#0d2d52", color:"white", padding:"14px 28px", fontSize:"15px", fontWeight:"700", textDecoration:"none", margin:"8px 0", fontFamily:"inherit" }}>
            원문 보기 →
          </a>
          <div style={{ fontSize:"12px", color:"#9a9a9a", marginBottom:"24px" }}>
            이음매거진은 인터넷신문 이음미디어로 통합되었습니다.<br />
            '세상과 당신을 잇는, 더 넓은 미디어의 시작입니다.'
          </div>

          {/* 광고 박스 — 정세연 본인 광고 (광고 샘플 역할) */}
          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", borderLeft:"4px solid #1c4f8a", padding:"24px 24px 16px", margin:"32px 0" }}>
            <div style={{ fontSize:"10px", color:"#9a9a9a", letterSpacing:"1px", marginBottom:"10px" }}>광고</div>
            <div style={{ fontFamily:"serif", fontSize:"17px", fontWeight:"700", color:"#0d2d52", lineHeight:"1.5", marginBottom:"8px", fontStyle:"italic" }}>
              "고객의 마지막 희망이 되고픈 두피전문가"
            </div>
            <div style={{ fontSize:"15px", fontWeight:"700", color:"#0d2d52", marginBottom:"4px" }}>닥터리부트 두피관리센터</div>
            <div style={{ fontSize:"12px", color:"#6b6b6b", marginBottom:"3px" }}>정세연 원장 · 두피전문가 27년</div>
            <div style={{ fontSize:"12px", color:"#6b6b6b", marginBottom:"18px" }}>일산 · 브레인트레이너 · SMP디자인전문가</div>
            <a href="https://naver.me/GWeDuL23" target="_blank" rel="noopener noreferrer"
               style={{ display:"inline-block", background:"#0d2d52", color:"white", padding:"11px 24px", fontSize:"12px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit", marginBottom:"16px" }}>
              예약 · 문의 →
            </a>
            <div style={{ display:"flex", gap:"18px", paddingTop:"16px", borderTop:"1px solid #e8e8e8" }}>
              <a href="http://dr-reboot.co.kr/" target="_blank" rel="noopener noreferrer" title="홈페이지" style={socialIconStyle}>🏠</a>
              <a href="https://naver.me/GWeDuL23" target="_blank" rel="noopener noreferrer" title="네이버 지도" style={socialIconStyle}>📍</a>
              <a href="https://www.youtube.com/channel/UCVdGlBOwnxzPs5rnNGhAZuQ" target="_blank" rel="noopener noreferrer" title="유튜브" style={socialIconStyle}>🎥</a>
              <a href="https://blog.naver.com/mzk6682" target="_blank" rel="noopener noreferrer" title="네이버 블로그" style={socialIconStyle}>✍️</a>
            </div>
            <div style={{ marginTop:"14px", paddingTop:"12px", borderTop:"1px dashed #e0e0e0", fontSize:"11px", color:"#9a9a9a", textAlign:"right" }}>
              광고 문의: <a href="mailto:press@eummedia.kr" style={{ color:"#1c4f8a", textDecoration:"none" }}>press@eummedia.kr</a>
            </div>
          </div>

          {/* 태그 */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", margin:"32px 0", paddingTop:"24px", borderTop:"1px solid #e0e0e0" }}>
            {a.tags.map(tag => (<a key={tag} href="#" style={{ fontSize:"11px", color:"#1c4f8a", border:"1px solid #1c4f8a", padding:"4px 12px", textDecoration:"none" }}>#{tag}</a>))}
          </div>

          {/* 기자란 */}
          <div style={{ border:"1px solid #e0e0e0", padding:"20px", margin:"32px 0", background:"#f7f8fa" }}>
            <div style={{ fontSize:"11px", color:"#9a9a9a", letterSpacing:"1px", fontWeight:"700", marginBottom:"14px" }}>이 기사를 쓴 기자</div>
            <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
              <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"20px", fontWeight:"700", flexShrink:0 }}>정</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                  <div style={{ fontSize:"15px", fontWeight:"700", color:"#0d2d52" }}>{a.author_name}</div>
                  <button onClick={() => setShowAuthorMore(p => !p)}
                    style={{ fontSize:"11px", color:"#1c4f8a", background:"none", border:"1px solid #1c4f8a", padding:"3px 10px", cursor:"pointer", borderRadius:"20px", fontFamily:"inherit" }}>
                    {showAuthorMore ? "접기 ▲" : "더보기 ▼"}
                  </button>
                </div>
                <div style={{ fontSize:"12px", color:"#9a9a9a", marginBottom: showAuthorMore ? "10px" : "0" }}>{a.author_bio}</div>
                {showAuthorMore && (
                  <div>
                    <div style={{ fontSize:"13px", color:"#3a3a3a", lineHeight:"1.7", marginBottom:"16px" }}>{a.author_intro}</div>
                    <div style={{ paddingTop:"14px", borderTop:"1px solid #e0e0e0" }}>
                      <div style={{ fontSize:"11px", color:"#9a9a9a", fontWeight:"700", letterSpacing:"1px", marginBottom:"10px" }}>이 기자의 다른 기사</div>
                      <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                        {AUTHOR_ARTICLES.map(art => (
                          <Link key={art.id} to={"/이음매거진/" + art.id} style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none" }}>
                            <div style={{ width:"56px", height:"42px", background:"#eef3fa", borderRadius:"3px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem" }}>📰</div>
                            <div>
                              <div style={{ fontSize:"12px", color:"#1a1a1a", fontWeight:"600", lineHeight:"1.4" }}>{art.title}</div>
                              <div style={{ fontSize:"10px", color:"#9a9a9a", marginTop:"2px" }}>{art.date}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 영상 + 카드뉴스 */}
          <div style={{ margin:"32px 0" }}>
            <div style={{ fontSize:"13px", fontWeight:"700", color:"#0d2d52", borderLeft:"3px solid #0d2d52", paddingLeft:"12px", marginBottom:"16px" }}>📹 영상 · 🃏 카드뉴스</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
              <div>
                <div style={{ position:"relative", height:"180px", borderRadius:"8px", overflow:"hidden", marginBottom:"12px" }}>
                  <img src={VIDEOS[videoIdx].thumb} alt={VIDEOS[videoIdx].title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.35)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:"rgba(255,255,255,0.9)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px" }}>▶</div>
                  </div>
                  <span style={{ position:"absolute", top:"8px", left:"8px", background:"#0d2d52", color:"white", fontSize:"9px", fontWeight:"700", padding:"3px 8px", borderRadius:"3px" }}>영상</span>
                  <span style={{ position:"absolute", bottom:"8px", right:"8px", background:"rgba(0,0,0,0.7)", color:"white", fontSize:"10px", padding:"2px 6px", borderRadius:"3px" }}>{VIDEOS[videoIdx].duration}</span>
                </div>
                <div style={{ fontSize:"12px", fontWeight:"600", color:"#1a1a1a", marginBottom:"10px", lineHeight:"1.4" }}>{VIDEOS[videoIdx].title}</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px" }}>
                  <ArrowBtn onClick={() => setVideoIdx(p => (p - 1 + VIDEOS.length) % VIDEOS.length)} dir="prev" />
                  <span style={{ fontSize:"11px", color:"#9a9a9a" }}>{videoIdx + 1} / {VIDEOS.length}</span>
                  <ArrowBtn onClick={() => setVideoIdx(p => (p + 1) % VIDEOS.length)} dir="next" />
                </div>
              </div>
              <div>
                <div style={{ position:"relative", height:"180px", borderRadius:"8px", overflow:"hidden", marginBottom:"12px", cursor:"pointer" }}>
                  <img src={CARDS[cardIdx].thumb} alt={CARDS[cardIdx].title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.3)" }} />
                  <span style={{ position:"absolute", top:"8px", left:"8px", background:"rgba(255,255,255,0.25)", color:"white", fontSize:"9px", fontWeight:"700", padding:"3px 8px", borderRadius:"3px" }}>카드뉴스</span>
                  <div style={{ position:"absolute", bottom:"10px", left:"10px", right:"10px", color:"white", fontSize:"12px", fontWeight:"700", lineHeight:"1.4", textShadow:"0 1px 4px rgba(0,0,0,0.5)" }}>{CARDS[cardIdx].title}</div>
                </div>
                <div style={{ fontSize:"12px", fontWeight:"600", color:"#1a1a1a", marginBottom:"10px", lineHeight:"1.4" }}>{CARDS[cardIdx].title}</div>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"16px" }}>
                  <ArrowBtn onClick={() => setCardIdx(p => (p - 1 + CARDS.length) % CARDS.length)} dir="prev" />
                  <span style={{ fontSize:"11px", color:"#9a9a9a" }}>{cardIdx + 1} / {CARDS.length}</span>
                  <ArrowBtn onClick={() => setCardIdx(p => (p + 1) % CARDS.length)} dir="next" />
                </div>
              </div>
            </div>
          </div>

          {/* 댓글 */}
          <div id="comment-section" style={{ margin:"32px 0" }}>
            <div style={{ fontSize:"15px", fontWeight:"700", color:"#0d2d52", borderBottom:"2px solid #0d2d52", paddingBottom:"10px", marginBottom:"20px" }}>댓글 {comments.length}개</div>
            <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px", marginBottom:"20px" }}>
              <input value={cName} onChange={e => setCName(e.target.value)} placeholder="이름" style={{ width:"100%", border:"1px solid #d0d0d0", padding:"8px 12px", fontSize:"12px", fontFamily:"inherit", marginBottom:"8px", outline:"none", boxSizing:"border-box" }} />
              <textarea value={cText} onChange={e => setCText(e.target.value)} placeholder="의견을 남겨주세요..." rows={3} style={{ width:"100%", border:"1px solid #d0d0d0", padding:"10px 12px", fontSize:"13px", fontFamily:"inherit", resize:"none", outline:"none", boxSizing:"border-box", marginBottom:"8px" }} />
              <div style={{ display:"flex", justifyContent:"flex-end" }}>
                <button onClick={onComment} style={{ background:"#0d2d52", color:"white", border:"none", padding:"8px 20px", fontSize:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>댓글 등록</button>
              </div>
            </div>
            {comments.map(c => (
              <div key={c.id} style={{ padding:"16px 0", borderBottom:"1px solid #f0f0f0" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                    <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#e0e0e0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"700", color:"#555" }}>{c.name.slice(0, 1)}</div>
                    <div>
                      <div style={{ fontSize:"12px", fontWeight:"700" }}>{c.name}</div>
                      <div style={{ fontSize:"10px", color:"#9a9a9a" }}>{c.date}</div>
                    </div>
                  </div>
                  <button style={{ fontSize:"11px", color:"#9a9a9a", background:"none", border:"none", cursor:"pointer" }}>👍 {c.likes}</button>
                </div>
                <div style={{ fontSize:"13px", color:"#3a3a3a", lineHeight:"1.7", paddingLeft:"42px" }}>{c.content}</div>
              </div>
            ))}
          </div>

          {/* 관련 기사 — 같은 채널 다른 기사 (STEP 5-C, 5/15 사고 해소로 살아남) */}
          <div style={{ margin:"32px 0" }}>
            <div style={{ fontSize:"13px", fontWeight:"700", color:"#0d2d52", borderLeft:"3px solid #0d2d52", paddingLeft:"12px", marginBottom:"16px" }}>관련 기사</div>
            {related.length > 0
              ? related.map(r => (
                  <Link key={r.slug} to={"/article/" + r.slug} style={{ display:"flex", gap:"14px", padding:"14px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none" }}>
                    <img src={r.thumbnail_url} alt={r.title} style={{ width:"90px", height:"68px", objectFit:"cover", borderRadius:"3px", flexShrink:0 }} />
                    <div>
                      <div style={{ fontSize:"11px", color: CC[r.channels?.name] || "#0d2d52", fontWeight:"700", marginBottom:"5px" }}>{r.channels?.name}</div>
                      <div style={{ fontSize:"13px", color:"#1a1a1a", fontWeight:"600", lineHeight:"1.5", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{r.title}</div>
                    </div>
                  </Link>
                ))
              : Array.from({length: 3}).map((_, i) => (
                  <div key={"rk-"+i} style={{ display:"flex", gap:"14px", padding:"14px 0", borderBottom:"1px solid #f0f0f0" }} aria-busy="true">
                    <div style={{ width:"90px", height:"68px", background:"#e8e8e8", borderRadius:"3px", flexShrink:0 }} />
                    <div style={{ flex:1 }}>
                      <div style={{ width:"30%", height:"11px", background:"#e8e8e8", marginBottom:"5px" }} />
                      <div style={{ width:"90%", height:"13px", background:"#e8e8e8", marginBottom:"4px" }} />
                      <div style={{ width:"70%", height:"13px", background:"#e8e8e8" }} />
                    </div>
                  </div>
                ))
            }
          </div>
        </main>

        {/* 사이드바 */}
        <aside style={{ display:"flex", flexDirection:"column", gap:"24px", position:"sticky", top:"20px" }}>
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
              <a href="http://dr-reboot.co.kr/" target="_blank" rel="noopener noreferrer" title="홈페이지" style={{ ...socialIconStyle, fontSize:"16px" }}>🏠</a>
              <a href="https://naver.me/GWeDuL23" target="_blank" rel="noopener noreferrer" title="네이버 지도" style={{ ...socialIconStyle, fontSize:"16px" }}>📍</a>
              <a href="https://www.youtube.com/channel/UCVdGlBOwnxzPs5rnNGhAZuQ" target="_blank" rel="noopener noreferrer" title="유튜브" style={{ ...socialIconStyle, fontSize:"16px" }}>🎥</a>
              <a href="https://blog.naver.com/mzk6682" target="_blank" rel="noopener noreferrer" title="네이버 블로그" style={{ ...socialIconStyle, fontSize:"16px" }}>✍️</a>
            </div>
          </div>

          <div>
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#555", borderBottom:"2px solid #0d2d52", paddingBottom:"8px", marginBottom:"12px" }}>이번 주 추천 기사</div>
            {popular.length > 0
              ? popular.map((p, i) => (
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

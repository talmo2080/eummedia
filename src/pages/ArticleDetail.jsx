import { useState } from "react";
import { Link } from "react-router-dom";

const CC = {
  "이음매거진":"#0d2d52","이음뉴스":"#c0392b","이음에듀":"#1a6b3c",
  "이음피플":"#5c2d8a","이음트렌드":"#c45c0a","이음보이스":"#1c4f8a",
  "이음뷰":"#8a6a00","이음로컬":"#1a6b3c",
};

const ARTICLE = {
  title: "열 번째 봄, 도자기 위로 난 꽃길을 걷다",
  subtitle: "경기 이천 세라피아에서 열리는 '2026 이천도자기축제' 현장을 직접 걸었다.",
  channel: "이음매거진",
  author_name: "정세연 편집국장",
  author_bio: "닥터리부트 두피관리센터 원장 · 두피전문가 27년 · 이음미디어 편집국장",
  author_intro: "두피 전문가 27년 경력의 정세연 원장이자 이음미디어 편집국장입니다. 세상을 잇고 사람을 잇는 이야기를 발굴합니다.",
  thumbnail: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=900&q=80",
  tags: ["이천도자기축제","경기문화","도예","봄여행","이음매거진"],
  views: 1284, published_at: "2026.04.28", read_time: 5,
  content: `
    <p style="font-size:19px;font-weight:600;color:#0d2d52;line-height:1.8;margin-bottom:28px;border-left:4px solid #1c4f8a;padding-left:20px;">봄비가 살짝 내린 4월 셋째 주 토요일, 경기도 이천 설봉공원 일대는 도자기와 꽃의 향연으로 가득 찼다.</p>
    <h3 style="font-size:20px;font-weight:700;color:#0d2d52;margin:36px 0 16px;padding-bottom:8px;border-bottom:1px solid #e0e0e0;">흙으로 빚는 봄의 언어</h3>
    <p style="margin-bottom:24px;line-height:2;">축제 첫날 오전 10시, 세라피아 야외 도예 체험장에는 이미 긴 줄이 늘어서 있었다. 아이의 손을 잡은 부모, 커플, 노부부까지 세대를 초월한 방문객들이 물레 앞에 앉아 흙을 매만졌다.</p>
    <div style="background:#f7f8fa;border-left:4px solid #1c4f8a;padding:20px 24px;margin:28px 0;font-style:italic;font-size:16px;color:#3a3a3a;line-height:1.9;">"도자기는 불로 완성되지만, 시작은 언제나 사람의 손입니다."<cite style="display:block;font-size:12px;color:#9a9a9a;margin-top:10px;font-style:normal;font-weight:600;">- 이천 도예 장인 김광수</cite></div>
    <h3 style="font-size:20px;font-weight:700;color:#0d2d52;margin:36px 0 16px;padding-bottom:8px;border-bottom:1px solid #e0e0e0;">장인의 손, 백 년의 기억</h3>
    <p style="margin-bottom:24px;line-height:2;">축제의 백미는 단연 장인 시연 코너다. 경기도 무형문화재 김광수 장인은 60년 경력의 손놀림으로 10분 만에 항아리 하나를 빚어냈다.</p>
  `,
};

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

const RELATED = [
  { id:"2", title:"27년째 골목을 지키는 손", channel:"이음피플", views:892, thumb:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&q=80" },
  { id:"3", title:"바이올리니스트 박진영, 금호아트홀", channel:"이음피플", views:516, thumb:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=120&q=80" },
  { id:"4", title:"우울증을 이겨낸 13만 유튜버", channel:"이음피플", views:724, thumb:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=120&q=80" },
];

const POPULAR = [
  { id:"p1", title:"우울증을 이겨낸 13만 유튜버 태리TV", channel:"이음피플", views:1284, thumb:"https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80" },
  { id:"p2", title:"넷플릭스의 문화 식민지로 살 것인가", channel:"이음매거진", views:886, thumb:"https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=80&q=80" },
  { id:"p3", title:"27년째 골목을 지키는 손", channel:"이음로컬", views:892, thumb:"https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=80&q=80" },
  { id:"p4", title:"AI 시대 우리 아이 교육은", channel:"이음뷰", views:1102, thumb:"https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=80&q=80" },
  { id:"p5", title:"바이올리니스트 박진영 독주회", channel:"이음피플", views:516, thumb:"https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=80&q=80" },
];

function FloatBtn({ onClick, children, bg, fg }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width:"40px", height:"40px", borderRadius:"50%", background: bg || (h ? "#f0f4f8" : "#fff"), border:"1px solid " + (h ? "#0d2d52" : "#e0e0e0"), boxShadow: h ? "0 4px 12px rgba(0,0,0,0.15)" : "0 2px 8px rgba(0,0,0,0.08)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s", gap:"1px", color: fg || (h ? "#0d2d52" : "#555") }}>
      {children}
    </button>
  );
}

function ArrowBtn({ onClick, dir }) {
  const [h, setH] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
      style={{ width:"32px", height:"32px", borderRadius:"50%", background: h ? "#0d2d52" : "#fff", border:"2px solid " + (h ? "#0d2d52" : "#ddd"), color: h ? "#fff" : "#0d2d52", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", fontSize:"18px", fontWeight:"900", transition:"all 0.2s", lineHeight:1 }}>
      {dir === "prev" ? "\u2039" : "\u203a"}
    </button>
  );
}

export default function ArticleDetail() {
  const a = ARTICLE;
  const color = CC[a.channel] || "#0d2d52";
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

  return (
    <div style={{ fontFamily:"'Noto Sans KR',sans-serif", background:"#fff", color:"#1a1a1a", minHeight:"100vh" }}>

      {/* 플로팅 바 */}
      <div style={{ position:"fixed", right:"20px", top:"50%", transform:"translateY(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"8px", zIndex:999 }}>
        <FloatBtn onClick={onLike}>
          <span style={{ fontSize:"15px" }}>{liked ? "❤️" : "🤍"}</span>
          <span style={{ fontSize:"8px", color:"#9a9a9a", fontWeight:"700" }}>{likeCount}</span>
        </FloatBtn>
        <FloatBtn>
          <span style={{ fontSize:"15px" }}>💬</span>
          <span style={{ fontSize:"8px", color:"#9a9a9a", fontWeight:"700" }}>{comments.length}</span>
        </FloatBtn>
        <FloatBtn onClick={onBookmark}>
          <span style={{ fontSize:"15px" }}>{bookmarked ? "🔖" : "📌"}</span>
        </FloatBtn>
        <div style={{ width:"1px", height:"12px", background:"#e0e0e0" }} />
        <FloatBtn onClick={onKakao} bg="#FEE500" fg="#3C1E1E">
          <span style={{ fontSize:"13px", fontWeight:"900" }}>K</span>
        </FloatBtn>
        <FloatBtn onClick={onFb} bg="#1877F2" fg="white">
          <span style={{ fontSize:"13px", fontWeight:"900" }}>f</span>
        </FloatBtn>
        <FloatBtn onClick={onCopy}>
          <span style={{ fontSize:"15px" }}>{copied ? "✅" : "🔗"}</span>
        </FloatBtn>
      </div>

      {/* 상단바 */}
      <div style={{ background:"#0d2d52", padding:"6px 0", fontSize:"11px" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 32px", display:"flex", justifyContent:"space-between", color:"rgba(255,255,255,0.6)" }}>
          <span style={{ color:"rgba(255,255,255,0.8)", fontWeight:"500" }}>2026년 5월 1일 목요일 · 경기도 고양</span>
          <div style={{ display:"flex", gap:"16px" }}>
            {["시민기자 지원","광고문의","로그인"].map(t => (
              <a key={t} href="#" style={{ color:"rgba(255,255,255,0.55)", textDecoration:"none" }}>{t}</a>
            ))}
          </div>
        </div>
      </div>

      {/* 헤더 */}
      <header style={{ background:"#fff", borderBottom:"1px solid #e0e0e0" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 32px" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 0 14px", borderBottom:"3px solid #0d2d52" }}>
            <Link to="/" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"12px" }}>
              <img src="/logo.png" alt="이음미디어" style={{ height:"52px", width:"auto", objectFit:"contain" }} />
              <div>
                <div style={{ fontFamily:"serif", fontSize:"26px", fontWeight:"900", color:"#0d2d52", letterSpacing:"-1px", lineHeight:1 }}>
                  이<span style={{ color:"#e8432d" }}>음</span>미디어
                </div>
                <div style={{ fontSize:"10px", color:"#9a9a9a", letterSpacing:"3px", marginTop:"3px" }}>E-EUM MEDIA</div>
              </div>
            </Link>
            <div style={{ display:"flex", gap:"8px" }}>
              <button style={{ background:"#1c4f8a", color:"white", border:"none", padding:"8px 18px", fontSize:"12px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>구독하기</button>
              <button style={{ background:"transparent", border:"1px solid #c0c0c0", padding:"7px 16px", fontSize:"12px", cursor:"pointer", fontFamily:"inherit" }}>로그인</button>
            </div>
          </div>
          <nav>
            <ul style={{ display:"flex", listStyle:"none", margin:0, padding:0 }}>
              {["전체","이음매거진","이음로컬","이음에듀","이음피플","이음트렌드","이음보이스","이음뷰"].map(ch => (
                <li key={ch}>
                  <Link to={ch === "전체" ? "/" : "/" + ch} style={{ display:"block", padding:"11px 16px", fontSize:"12.5px", fontWeight: ch === a.channel ? "700" : "500", color: ch === a.channel ? "#1c4f8a" : "#3a3a3a", textDecoration:"none", borderBottom: ch === a.channel ? "2px solid #1c4f8a" : "2px solid transparent" }}>{ch}</Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

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

      {/* 본문 레이아웃 */}
      <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"48px 32px", display:"grid", gridTemplateColumns:"1fr 300px", gap:"56px", alignItems:"start" }}>
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
          <div style={{ fontSize:"11px", color:"#9a9a9a", textAlign:"center", marginBottom:"32px", fontStyle:"italic" }}>이천 세라피아 야외 도예 체험장 / 이음미디어</div>

          {/* 본문 */}
          <div style={{ fontFamily:"serif", fontSize:"17px", lineHeight:"2", color:"#2a2a2a", marginBottom:"28px" }} dangerouslySetInnerHTML={{ __html: a.content }} />

          {/* 협찬 배너 */}
          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", borderLeft:"4px solid #1c4f8a", padding:"16px 20px", margin:"32px 0", display:"flex", alignItems:"center", justifyContent:"space-between", gap:"20px" }}>
            <div>
              <div style={{ fontSize:"9px", color:"#9a9a9a", marginBottom:"3px" }}>SPONSORED</div>
              <div style={{ fontSize:"13px", fontWeight:"700", color:"#0d2d52", marginBottom:"3px" }}>닥터리부트 두피관리센터</div>
              <div style={{ fontSize:"11px", color:"#6b6b6b" }}>고양시 라온 원장 · 두피전문가 27년</div>
            </div>
            <button style={{ background:"#0d2d52", color:"white", border:"none", padding:"9px 20px", fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", whiteSpace:"nowrap" }}>예약 · 문의 →</button>
          </div>

          {/* 태그 */}
          <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", margin:"32px 0", paddingTop:"24px", borderTop:"1px solid #e0e0e0" }}>
            {a.tags.map(tag => (<a key={tag} href="#" style={{ fontSize:"11px", color:"#1c4f8a", border:"1px solid #1c4f8a", padding:"4px 12px", textDecoration:"none" }}>#{tag}</a>))}
          </div>

          {/* 기자란 - 더보기 버튼 */}

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

                {/* 더보기 펼쳐지는 영역 */}
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
          <div style={{ margin:"32px 0" }}>
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

          {/* 관련 기사 */}
          <div style={{ margin:"32px 0" }}>
            <div style={{ fontSize:"13px", fontWeight:"700", color:"#0d2d52", borderLeft:"3px solid #0d2d52", paddingLeft:"12px", marginBottom:"16px" }}>관련 기사</div>
            {RELATED.map(r => (
              <Link key={r.id} to={"/" + r.channel + "/" + r.id} style={{ display:"flex", gap:"14px", padding:"14px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none" }}>
                <img src={r.thumb} alt={r.title} style={{ width:"90px", height:"68px", objectFit:"cover", borderRadius:"3px", flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:"11px", color: CC[r.channel] || "#0d2d52", fontWeight:"700", marginBottom:"5px" }}>{r.channel}</div>
                  <div style={{ fontSize:"13px", color:"#1a1a1a", fontWeight:"600", lineHeight:"1.5", marginBottom:"5px" }}>{r.title}</div>
                  <div style={{ fontSize:"11px", color:"#9a9a9a" }}>👁 {r.views.toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </main>

        {/* 사이드바 */}
        <aside style={{ display:"flex", flexDirection:"column", gap:"24px", position:"sticky", top:"20px" }}>
          <div style={{ background:"#0d2d52", padding:"24px", textAlign:"center" }}>
            <img src="/logo.png" alt="이음미디어" style={{ height:"44px", display:"block", margin:"0 auto 12px" }} />
            <div style={{ fontFamily:"serif", fontSize:"16px", fontWeight:"700", color:"white", marginBottom:"6px" }}>
              이<span style={{ color:"#f0a882" }}>음</span>미디어 구독
            </div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"12px", lineHeight:"1.7", marginBottom:"16px" }}>새 기사 발행 시<br />카카오톡으로 바로 알림!</div>
            <button onClick={onKakao} style={{ width:"100%", background:"#FEE500", color:"#3C1E1E", border:"none", padding:"12px", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>
              💬 카카오 채널 구독 (무료)
            </button>
          </div>

          <div>
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#555", borderBottom:"2px solid #0d2d52", paddingBottom:"8px", marginBottom:"12px" }}>관련 기사</div>
            {RELATED.map(r => (
              <Link key={r.id} to={"/" + r.channel + "/" + r.id} style={{ display:"flex", gap:"10px", padding:"10px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none" }}>
                <img src={r.thumb} alt={r.title} style={{ width:"80px", height:"60px", objectFit:"cover", borderRadius:"2px", flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:"10px", color: CC[r.channel] || "#0d2d52", fontWeight:"700", marginBottom:"3px" }}>{r.channel}</div>
                  <div style={{ fontSize:"12px", color:"#1a1a1a", lineHeight:"1.4", fontWeight:"500" }}>{r.title}</div>
                  <div style={{ fontSize:"10px", color:"#9a9a9a", marginTop:"3px" }}>👁 {r.views}</div>
                </div>
              </Link>
            ))}
          </div>

          <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px" }}>
            <div style={{ fontSize:"9px", color:"#9a9a9a", letterSpacing:"1px", marginBottom:"10px" }}>AD</div>
            <div style={{ width:"100%", height:"120px", background:"linear-gradient(135deg,#0d2d52,#1c4f8a)", display:"flex", alignItems:"center", justifyContent:"center", marginBottom:"12px", borderRadius:"2px" }}>
              <div style={{ textAlign:"center", color:"white" }}>
                <div style={{ fontSize:"22px", marginBottom:"6px" }}>💆</div>
                <div style={{ fontSize:"13px", fontWeight:"700" }}>닥터리부트</div>
                <div style={{ fontSize:"10px", opacity:0.75, marginTop:"3px" }}>두피케어 전문 27년</div>
              </div>
            </div>
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#0d2d52", marginBottom:"4px" }}>두피케어 전문 27년</div>
            <div style={{ fontSize:"11px", color:"#6b6b6b", lineHeight:"1.7", marginBottom:"12px" }}>고양시 라온 원장 · 탈모 예방 전문</div>
            <button style={{ width:"100%", background:"#0d2d52", color:"white", border:"none", padding:"9px", fontSize:"11px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit" }}>예약 · 문의 →</button>
          </div>

          <div>
            <div style={{ fontSize:"12px", fontWeight:"700", color:"#555", borderBottom:"2px solid #0d2d52", paddingBottom:"8px", marginBottom:"12px" }}>이번 주 인기 기사</div>
            {POPULAR.map((p, i) => (
              <Link key={p.id} to={"/" + p.channel + "/" + p.id} style={{ display:"flex", gap:"10px", padding:"8px 0", borderBottom:"1px solid #f0f0f0", textDecoration:"none", alignItems:"center" }}>
                <img src={p.thumb} alt={p.title} style={{ width:"52px", height:"40px", objectFit:"cover", borderRadius:"2px", flexShrink:0 }} />
                <div>
                  <div style={{ fontSize:"10px", color: CC[p.channel] || "#0d2d52", fontWeight:"700", marginBottom:"2px" }}>{p.channel}</div>
                  <div style={{ fontSize:"11px", color:"#1a1a1a", lineHeight:"1.4", fontWeight:"500" }}>{p.title}</div>
                  <div style={{ fontSize:"10px", color:"#9a9a9a" }}>👁 {p.views.toLocaleString()}</div>
                </div>
              </Link>
            ))}
          </div>
        </aside>
      </div>

      {/* 푸터 */}
      <footer style={{ background:"#0d2d52", color:"rgba(255,255,255,0.65)", padding:"40px 24px", textAlign:"center", borderTop:"3px solid #1c4f8a" }}>
        <div style={{ maxWidth:"800px", margin:"0 auto" }}>
          <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"20px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"4px" }}>
              <img src="/logo.png" alt="이음미디어 로고" style={{ height:"52px", width:"auto", objectFit:"contain" }} />
              <div style={{ textAlign:"left" }}>
                <div style={{ fontFamily:"serif", fontSize:"24px", fontWeight:"900", color:"white", letterSpacing:"-1px" }}>이<span style={{ color:"#f0a882" }}>음</span>미디어</div>
                <div style={{ fontSize:"10px", color:"rgba(255,255,255,0.5)", fontFamily:"monospace", letterSpacing:"0.12em" }}>E-EUM MEDIA</div>
              </div>
            </div>
            <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.5)", marginTop:"10px" }}>세상을 잇고, 사람을 잇는다 · 당신의 성공이 우리의 뉴스다</div>
          </div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", lineHeight:"1.9", marginBottom:"16px" }}>
            등록번호: 경기 아XXXXX | 발행인: 성창운 | 편집인: 정세연<br />
            청소년보호책임자: 정세연 | press@eummedia.kr<br />
            주소: 서울 관악구 남부순환로 1699 2층 | 발행일: 매주
          </div>
          <div style={{ paddingTop:"16px", borderTop:"1px solid rgba(255,255,255,0.1)", display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"12px", fontSize:"11px", marginBottom:"12px" }}>
            {[
              { href:"/privacy", label:"개인정보처리방침" },
              { href:"/terms", label:"이용약관" },
              { href:"/youth", label:"청소년보호정책" },
              { href:"/about", label:"편집방침" },
              { href:"/ad", label:"광고문의" },
              { href:"/about", label:"이음미디어 소개" },
            ].map(l => (<a key={l.label} href={l.href} style={{ color:"rgba(255,255,255,0.5)", textDecoration:"none" }}>{l.label}</a>))}
          </div>
          <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.3)" }}>© 2026 이음미디어. All rights reserved.</div>
        </div>
      </footer>

    </div>
  );
}
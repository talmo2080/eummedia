import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { getChannelColorClasses } from "../lib/channelColors";
import { getYouTubeEmbedUrl } from "../lib/youtube";
import VideoGallery from "../components/VideoGallery";
import CardNewsSlideshow from "../components/CardNewsSlideshow";
import CardNewsGallery from "../components/CardNewsGallery";

const CC = {
  "이음매거진":"#0d2d52","이음뉴스":"#c0392b","이음에듀":"#1a6b3c",
  "이음피플":"#5c2d8a","이음트렌드":"#c45c0a","이음보이스":"#1c4f8a",
  "이음뷰":"#8a6a00","이음로컬":"#1a6b3c",
};

function formatDate(iso) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth()+1).padStart(2,'0')}.${String(d.getDate()).padStart(2,'0')}`;
}

// 이음미디어 창간(2026-06-08 KST) 이전 발행 기사에만 노출되는 "이음매거진 통합" 안내 cutoff
const LEGACY_NOTICE_CUTOFF = new Date('2026-06-08T00:00:00+09:00');

function splitIntoParagraphs(content) {
  if (!content) return [];
  const PROTECT = '';
  let s = content;
  s = s.replace(/(\d)\.(\d)/g, '$1' + PROTECT + '$2');
  s = s.replace(/[“”][^“”]*[“”]|"[^"]*"/g, (m) => m.replace(/\./g, PROTECT));
  const parts = s.split('.').map(p => p.trim()).filter(Boolean);
  return parts.map(p => p.replace(new RegExp(PROTECT, 'g'), '.') + '.');
}

// === 단락 분할 전 박스 태그 [quote/box/info] 보호 ===
// 단락 분할(\n+ 또는 마침표 split)이 박스 태그 내부의 줄바꿈·마침표로
// 태그를 쪼개 paragraphToHtml의 ^...$ 매칭이 깨지는 버그 우회.
// 블록을 충돌 가능성 극히 낮은 sentinel 토큰으로 치환 후,
// 단락 분할 → 각 단락에서 토큰을 원래 블록으로 복원 → paragraphToHtml에 통째 전달.
const BLOCK_SENTINEL_PREFIX = '__EUM_PRESERVED_BLOCK_';
const BLOCK_SENTINEL_SUFFIX = '__';
function preserveBlockTags(content) {
  if (!content) return { text: '', blocks: [] };
  const blocks = [];
  // (1) 박스 태그 [quote/box/info]...[/...] — 닫는 태그가 있는 블록
  let text = content.replace(/\[(quote|box|info)\]([\s\S]*?)\[\/\1\]/g, (full) => {
    blocks.push(full);
    return `${BLOCK_SENTINEL_PREFIX}${blocks.length - 1}${BLOCK_SENTINEL_SUFFIX}`;
  });
  // (2) 본문 콘텐츠 이미지 [이미지:URL|캡션] — self-closing 단일 태그
  //     URL/캡션 안에 줄바꿈·마침표 있으면 단락 분할이 깨질 수 있으므로 동일 보호
  text = text.replace(/\[이미지:[^\]]+\]/g, (full) => {
    blocks.push(full);
    return `${BLOCK_SENTINEL_PREFIX}${blocks.length - 1}${BLOCK_SENTINEL_SUFFIX}`;
  });
  return { text, blocks };
}
function restoreBlockTags(text, blocks) {
  if (!blocks.length) return text;
  return text.replace(/__EUM_PRESERVED_BLOCK_(\d+)__/g, (_, i) => blocks[Number(i)] || '');
}

// HTML escape (XSS 방지) — 본문은 textarea 입력값이라 escape 후 커스텀 태그만 HTML로 변환
function escapeHtml(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 단락 텍스트 → HTML 변환 (커스텀 태그 5종 + 굵게 + 구분선)
function paragraphToHtml(p) {
  const text = String(p ?? '').trim();
  if (!text) return '';
  if (/^---+$/.test(text)) {
    return '<hr style="border:none;border-top:1px solid #ddd;margin:28px 0;" />';
  }
  let m = text.match(/^\[quote\]([\s\S]*)\[\/quote\]$/);
  if (m) {
    const inner = escapeHtml(m[1])
      .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<![A-Za-z0-9])\*([^*]+?)\*(?![A-Za-z0-9])/g, '<em>$1</em>')
      // [링크:https://URL|텍스트] — https 시작 URL만 허용 (보안). 텍스트 생략 가능
      .replace(/\[링크:(https:\/\/[^|\]]+)(?:\|([^\]]*))?\]/g, (_, url, text) => {
        const label = (text || url).trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0d2d52;text-decoration:underline;font-weight:600;">${label}</a>`;
      });
    // white-space:pre-line — 박스 내부 \n을 시각적 줄바꿈으로 자동 처리 (자동 줄바꿈은 그대로)
    return `<blockquote style="border-left:3px solid #c9a84c;margin:20px 0;padding:16px 20px;background:#fafaf7;color:#555;font-style:italic;font-size:1.05rem;white-space:pre-line;">${inner}</blockquote>`;
  }
  m = text.match(/^\[box\]([\s\S]*)\[\/box\]$/);
  if (m) {
    const inner = escapeHtml(m[1])
      .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<![A-Za-z0-9])\*([^*]+?)\*(?![A-Za-z0-9])/g, '<em>$1</em>')
      // [링크:https://URL|텍스트] — https 시작 URL만 허용 (보안). 텍스트 생략 가능
      .replace(/\[링크:(https:\/\/[^|\]]+)(?:\|([^\]]*))?\]/g, (_, url, text) => {
        const label = (text || url).trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0d2d52;text-decoration:underline;font-weight:600;">${label}</a>`;
      });
    // white-space:pre-line — 박스 내부 \n을 시각적 줄바꿈으로 자동 처리
    return `<div style="background:#fdf6ec;border:1px solid #e8c98a;border-radius:8px;padding:16px 20px;margin:20px 0;white-space:pre-line;">${inner}</div>`;
  }
  m = text.match(/^\[info\]([\s\S]*)\[\/info\]$/);
  if (m) {
    const inner = escapeHtml(m[1])
      .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<![A-Za-z0-9])\*([^*]+?)\*(?![A-Za-z0-9])/g, '<em>$1</em>')
      // [링크:https://URL|텍스트] — https 시작 URL만 허용 (보안). 텍스트 생략 가능
      .replace(/\[링크:(https:\/\/[^|\]]+)(?:\|([^\]]*))?\]/g, (_, url, text) => {
        const label = (text || url).trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0d2d52;text-decoration:underline;font-weight:600;">${label}</a>`;
      });
    // white-space:pre-line — 박스 내부 \n을 시각적 줄바꿈으로 자동 처리
    return `<div style="background:#f0f5ff;border:1px solid #93b4e8;border-left:4px solid #0d2d52;border-radius:8px;padding:16px 20px;margin:20px 0;white-space:pre-line;">${inner}</div>`;
  }
  // 본문 콘텐츠 이미지 [이미지:URL|캡션] — <figure><img alt><figcaption></figure>
  // 캡션을 alt에 주입 → SSG prerender HTML에 그대로 박혀 검색·AI 노출
  m = text.match(/^\[이미지:([^|\]]+)(?:\|([^\]]*))?\]$/);
  if (m) {
    const url = String(m[1]).trim();
    const caption = (m[2] || '').trim();
    // 보안: https:// 시작 URL만 허용 (외부 임의 URL 방어)
    if (/^https:\/\//.test(url)) {
      const safeUrl = escapeHtml(url);
      const safeCaption = escapeHtml(caption);
      const altAttr = safeCaption || '본문 이미지';
      const figcaption = caption
        ? `<figcaption style="font-size:0.85rem;color:#888;text-align:center;margin-top:8px;line-height:1.6;">${safeCaption}</figcaption>`
        : '';
      return `<figure style="margin:28px auto;text-align:center;"><img src="${safeUrl}" alt="${altAttr}" loading="lazy" style="max-width:100%;height:auto;display:block;margin:0 auto;border-radius:4px;" />${figcaption}</figure>`;
    }
    // 잘못된 URL (http://, javascript: 등) — 일반 단락으로 fallthrough (escape 처리)
  }
  m = text.match(/^##\s+(.+)$/);
  if (m) {
    const inner = escapeHtml(m[1])
      .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<![A-Za-z0-9])\*([^*]+?)\*(?![A-Za-z0-9])/g, '<em>$1</em>')
      // [링크:https://URL|텍스트] — https 시작 URL만 허용 (보안). 텍스트 생략 가능
      .replace(/\[링크:(https:\/\/[^|\]]+)(?:\|([^\]]*))?\]/g, (_, url, text) => {
        const label = (text || url).trim();
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0d2d52;text-decoration:underline;font-weight:600;">${label}</a>`;
      });
    return `<h3 style="font-size:1.2rem;font-weight:700;border-left:4px solid #0d2d52;padding-left:12px;margin:24px 0 12px;">${inner}</h3>`;
  }
  const escaped = escapeHtml(text)
    .replace(/\*\*\*([^*]+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(?<![A-Za-z0-9])\*([^*]+?)\*(?![A-Za-z0-9])/g, '<em>$1</em>')
    // [링크:https://URL|텍스트] — https 시작 URL만 허용 (보안). 텍스트 생략 가능
    .replace(/\[링크:(https:\/\/[^|\]]+)(?:\|([^\]]*))?\]/g, (_, url, text) => {
      const label = (text || url).trim();
      return `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#0d2d52;text-decoration:underline;font-weight:600;">${label}</a>`;
    });
  return `<p style="margin:0 0 1em 0;">${escaped}</p>`;
}

const socialIconStyle = { fontSize: "24px", textDecoration: "none", lineHeight: 1 };

// (AUTHOR_ARTICLES MOCK 제거됨 — 동적 fetch로 교체, authorArticles state 사용)
// (INIT_COMMENTS MOCK 제거됨 — supabase comments 테이블에서 실시간 fetch)

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

function StickyReactionBar({ liked, likeCount, onLike, onCopy, copied, onKakao, onFb, commentCount }) {
  const buttons = [
    { icon: liked ? "❤️" : "🤍", label: likeCount, onClick: onLike, title: "좋아요", active: liked, activeColor: "#e74c3c" },
    { icon: "💬", label: commentCount, onClick: () => document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" }), title: "댓글" },
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

function BottomReactionBar({ liked, likeCount, onLike, onCopy, copied, onKakao, onFb, commentCount }) {
  const items = [
    { icon: liked ? "❤️" : "🤍", label: likeCount, onClick: onLike, title: "좋아요", active: liked, activeColor: "#e74c3c" },
    { icon: "💬", label: commentCount, onClick: () => document.getElementById("comment-section")?.scrollIntoView({ behavior: "smooth" }), title: "댓글" },
    { icon: "K", label: "카톡", onClick: onKakao, title: "카카오 공유", bg: "#FEE500", fg: "#3C1E1E", isBrand: true },
    { icon: "f", label: "FB", onClick: onFb, title: "페이스북 공유", bg: "#1877F2", fg: "white", isBrand: true },
    { icon: copied ? "✅" : "🔗", label: copied ? "복사됨" : "링크", onClick: onCopy, title: "링크 복사" },
  ];

  return (
    <div
      className="flex lg:hidden"
      role="toolbar"
      aria-label="기사 반응"
      style={{
        background: "#fff",
        border: "1px solid #e0e0e0",
        borderRadius: 8,
        margin: "24px 0 8px",
        padding: 8,
        justifyContent: "space-around", alignItems: "center",
        gap: 4,
      }}
    >
      {items.map((it, i) => (
        <button
          key={i}
          onClick={it.onClick}
          title={it.title}
          aria-label={it.title}
          style={{
            minWidth: 52, minHeight: 52,
            padding: "6px 8px",
            background: it.bg || "transparent",
            border: "none",
            borderRadius: it.isBrand ? 10 : 0,
            cursor: "pointer",
            fontFamily: "'Noto Sans KR', sans-serif",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: 2,
            flex: "1 1 0",
          }}
        >
          <span style={
            it.isBrand
              ? { fontSize: 18, fontWeight: 900, color: it.fg, lineHeight: 1 }
              : { fontSize: 24, lineHeight: 1 }
          }>{it.icon}</span>
          <span style={{
            fontSize: 12, fontWeight: 600, lineHeight: 1,
            color: it.fg || (it.active ? it.activeColor : "#666"),
          }}>{it.label}</span>
        </button>
      ))}
    </div>
  );
}

export default function ArticleDetail() {
  const { slug } = useParams();
  const { user, profile } = useAuth();
  const [article, setArticle] = useState(null);
  const [error, setError] = useState(null);
  const [popular, setPopular] = useState([]);
  const [related, setRelated] = useState([]);
  const [authorArticles, setAuthorArticles] = useState([]);   // 이 기자의 다른 기사 — author_id 동적 fetch
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [comments, setComments] = useState([]);
  const [cText, setCText] = useState("");
  const [posting, setPosting] = useState(false);
  const [galleryVideos, setGalleryVideos] = useState([]);
  const [cardnewsList, setCardnewsList] = useState([]);
  // 📦 사이드 광고 (DB 토글, show_in_side_ad=true)
  const [sideAdArticles, setSideAdArticles] = useState([]);
  const [openCardnews, setOpenCardnews] = useState(null);
  const [showAuthorMore, setShowAuthorMore] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");

  const isAdmin = profile?.role === 'admin';

  const onLike = async () => {
    // localStorage 좋아요 기록 토글 (slug 기준)
    let likedSlugs = [];
    try { likedSlugs = JSON.parse(localStorage.getItem('eum-liked-articles') || '[]'); } catch { /* ignore */ }
    if (!Array.isArray(likedSlugs)) likedSlugs = [];
    const alreadyLiked = likedSlugs.includes(slug);
    const delta = alreadyLiked ? -1 : 1;
    // Optimistic UI
    setLiked(!alreadyLiked);
    setLikeCount(p => Math.max(0, p + delta));
    // RPC 호출 — articles.like_count atomic 증감
    const { data: newCount, error: rpcErr } = await supabase
      .rpc('increment_like_count', { p_slug: slug, p_delta: delta });
    if (rpcErr) {
      console.error('[ArticleDetail LIKE] rpc error:', rpcErr);
      // 실패 시 UI 롤백
      setLiked(alreadyLiked);
      setLikeCount(p => Math.max(0, p - delta));
      return;
    }
    // DB 응답값으로 동기화 (race 보정)
    if (typeof newCount === 'number') setLikeCount(newCount);
    // localStorage 갱신
    const next = alreadyLiked
      ? likedSlugs.filter(s => s !== slug)
      : [...likedSlugs, slug];
    try { localStorage.setItem('eum-liked-articles', JSON.stringify(next)); } catch { /* ignore */ }
  };

  const onCopy = async () => {
    try { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* clipboard 미지원 시 무시 */ }
  };
  const onKakao = () => {
    if (typeof window.Kakao === 'undefined') {
      alert('카카오 SDK가 아직 로드되지 않았습니다. 잠시 후 다시 시도해주세요.');
      return;
    }
    if (!window.Kakao.isInitialized()) {
      window.Kakao.init(import.meta.env.VITE_KAKAO_JS_KEY);
    }
    window.Kakao.Share.sendDefault({
      objectType: 'feed',
      content: {
        title: article.title,
        description: article.summary || '',
        imageUrl: article.thumbnail_url || 'https://www.eummedia.kr/og-image.png',
        link: {
          mobileWebUrl: window.location.href,
          webUrl: window.location.href,
        },
      },
    });
  };
  const onFb = () => window.open("https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(window.location.href), "_blank");
  // 댓글 fetch 헬퍼 — articleId 기준으로 다시 불러오기
  const fetchComments = async (articleId) => {
    if (!articleId) return;
    const { data, error: err } = await supabase
      .from('comments')
      .select('id, content, author_id, like_count, is_deleted, created_at, updated_at, parent_id, author:users!author_id(nickname)')
      .eq('article_id', articleId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    if (err) { console.error('[ArticleDetail COMMENTS] fetch error:', err); return; }
    setComments(data ?? []);
  };

  // 댓글 수정 — 본인만 (RLS comments_update_author 자동 보호)
  const startEditComment = (c) => {
    setEditingCommentId(c.id);
    setEditText(c.content);
  };
  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditText("");
  };
  const saveEditComment = async (commentId) => {
    if (!editText.trim()) { alert('내용을 입력해주세요.'); return; }
    const { error: err } = await supabase
      .from('comments')
      .update({ content: editText.trim() })
      .eq('id', commentId);
    if (err) { alert(`댓글 수정 실패: ${err.message}`); return; }
    setEditingCommentId(null);
    setEditText("");
    if (article?.id) await fetchComments(article.id);
  };

  // 댓글 삭제 — 본인 OR admin (soft delete: is_deleted=true).
  // RLS comments_admin_all로 admin UPDATE 허용, comments_delete_author_or_admin은 hard delete용.
  const deleteComment = async (commentId) => {
    if (!window.confirm('댓글을 삭제하시겠습니까?')) return;
    const { error: err } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', commentId);
    if (err) { alert(`댓글 삭제 실패: ${err.message}`); return; }
    if (article?.id) await fetchComments(article.id);
  };

  const onComment = async () => {
    if (!user) {
      alert('댓글은 로그인 후 작성할 수 있습니다.');
      return;
    }
    if (!cText.trim()) return;
    if (!article?.id) return;
    setPosting(true);
    try {
      const { error: err } = await supabase.from('comments').insert({
        article_id: article.id,
        author_id: user.id,
        content: cText.trim(),
        parent_id: null,
        like_count: 0,
        is_deleted: false,
      });
      if (err) {
        console.error('[ArticleDetail COMMENTS] insert error:', err);
        alert(`댓글 등록 실패: ${err.message}`);
        return;
      }
      setCText("");
      await fetchComments(article.id);
    } finally {
      setPosting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('articles')
        .select('id, slug, title, summary, content, thumbnail_url, image_alt, video_url, show_in_article, show_in_gallery, published_at, channel_id, author_id, like_count, view_count, tags, external_url, inline_ad_image, inline_ad_link, inline_ad_title, inline_ad_subtitle, channels(name, slug, english_slug)')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();
      if (cancelled) return;
      if (err) { setError('기사를 불러오지 못했습니다.'); return; }
      setArticle(data);
      setLikeCount(data?.like_count ?? 0);
      // localStorage에서 좋아요 상태 복원
      try {
        const liked = JSON.parse(localStorage.getItem('eum-liked-articles') || '[]');
        setLiked(Array.isArray(liked) && liked.includes(slug));
      } catch { /* parse 실패 무시 */ }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  // 이 기자의 다른 기사 — article.author_id 기준 published 3건 (현재 기사 제외)
  useEffect(() => {
    if (!article?.author_id || !article?.id) { setAuthorArticles([]); return; }
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('articles')
        .select('id, slug, title, published_at, thumbnail_url')
        .eq('author_id', article.author_id)
        .eq('status', 'published')
        .neq('id', article.id)
        .order('published_at', { ascending: false })
        .limit(3);
      if (cancelled) return;
      if (err) { console.error('[ArticleDetail AUTHOR_ARTICLES] fetch error:', err); return; }
      setAuthorArticles(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [article?.author_id, article?.id]);

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

  // 📺 영상 갤러리 — show_in_gallery=true 큐레이션, 최신순 6건
  // (모든 기사 페이지에서 동일 노출 — 자기제외 제거. 큐레이션이 정세연의 결정)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('articles')
        .select('slug, title, video_url, thumbnail_url, channels(name)')
        .eq('status', 'published')
        .eq('show_in_gallery', true)
        .not('video_url', 'is', null)
        .neq('video_url', '')
        .order('published_at', { ascending: false })
        .limit(6);
      if (cancelled) return;
      if (err) { console.error('[ArticleDetail VIDEOS] supabase error:', err); return; }
      setGalleryVideos(data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  // 📦 사이드 광고 fetch — show_in_side_ad=true, side_ad_order ASC
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
      if (err) { console.error('[ArticleDetail SIDE_AD] supabase error:', err); return; }
      setSideAdArticles(data ?? []);
    })();
    return () => { cancelled = true; };
  }, []);

  // 💬 댓글 fetch — 기사 로드 후 articleId 기준 (is_deleted=false)
  const articleId = article?.id;

  // 👁 조회수 카운팅 — 세션당 1회 +1 (sessionStorage 중복 차단)
  //   · RPC increment_article_view_count — RLS 우회 view_count만 안전 증가
  useEffect(() => {
    if (!articleId) return;
    if (typeof window === 'undefined' || !window.sessionStorage) return;
    const sessionKey = `eum-viewed-${articleId}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, '1');
    supabase.rpc('increment_article_view_count', { p_article_id: articleId })
      .then(({ error: rpcErr }) => {
        if (rpcErr) console.warn('[view_count RPC] fail:', rpcErr.message);
      });
  }, [articleId]);

  useEffect(() => {
    if (!articleId) return;
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('comments')
        .select('id, content, author_id, like_count, is_deleted, created_at, updated_at, parent_id, author:users!author_id(nickname)')
        .eq('article_id', articleId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
      if (cancelled) return;
      if (err) { console.error('[ArticleDetail COMMENTS] fetch error:', err); return; }
      setComments(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [articleId]);

  // 📱 카드뉴스 — 다른 기사의 cardnews 여러 건 (영상 갤러리 동일 패턴)
  //   · 현재 기사 제외(neq slug), published만, 최신순, 최대 9건
  //   · 갤러리: 모바일 2 / PC 3 노출 + 더보기로 최대 9건
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error: err } = await supabase
        .from('cardnews')
        .select('id, slides, articles!inner(slug, title, thumbnail_url, status, channels(name))')
        .eq('articles.status', 'published')
        .neq('articles.slug', slug)
        .order('created_at', { ascending: false })
        .limit(9);
      if (cancelled) return;
      if (err) { console.error('[ArticleDetail CARDNEWS] supabase error:', err); return; }
      setCardnewsList(data ?? []);
    })();
    return () => { cancelled = true; };
  }, [slug]);

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
    video_url: article.video_url,
    show_in_article: !!article.show_in_article,
    image_alt: article.image_alt || '',
    author_name: "정세연 편집국장",
    author_bio: "닥터리부트 두피관리센터(일산) 원장 · 두피전문가 27년 · 이음미디어 편집국장",
    author_intro: "두피 전문가 27년 경력의 정세연 원장이자 이음미디어 편집국장입니다. 세상을 잇고 사람을 잇는 이야기를 발굴합니다.",
    tags: Array.isArray(article.tags) ? article.tags : [],
    view_count: article.view_count ?? 0,   // 진짜 조회수 (RPC로 +1, 100 미만 미표시)
    read_time: 5,
  };
  const color = CC[a.channel] || "#0d2d52";

  return (
    <div style={{ fontFamily:"'Noto Sans KR',sans-serif", background:"#fff", color:"#1a1a1a", minHeight:"100vh" }}>

      {/* 브레드크럼 */}
      <div style={{ background:"#f7f8fa", borderBottom:"1px solid #e8e8e8", padding:"10px 0", fontSize:"11px", color:"#9a9a9a" }}>
        <div style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 32px", display:"flex", gap:"6px", alignItems:"center" }}>
          <Link to="/" style={{ color:"#1c4f8a", textDecoration:"none" }}>홈</Link>
          <span>›</span>
          <Link to={article.channels?.english_slug ? `/channel/${article.channels.english_slug}` : '/'} style={{ color:"#1c4f8a", textDecoration:"none" }}>{a.channel}</Link>
          <span>›</span>
          <span>{a.title}</span>
        </div>
      </div>

      {/* 본문 레이아웃: 플로팅바 | 기사 | 사이드바 — lg(≥1024px)에서만 3컬럼 */}
      <div className="grid grid-cols-1 lg:grid-cols-[60px_1fr_300px]" style={{ maxWidth:"1280px", margin:"0 auto", padding:"48px 32px", gap:"32px", alignItems:"start" }}>

        {/* ★ 왼쪽 sticky 반응 바 — 데스크탑(≥1024px) 전용 */}
        <div className="hidden lg:block" style={{ alignSelf: "stretch" }}>
          <StickyReactionBar
            liked={liked} likeCount={likeCount} onLike={onLike}
            onCopy={onCopy} copied={copied}
            onKakao={onKakao} onFb={onFb}
            commentCount={comments.length}
          />
        </div>

        {/* 기사 본문 */}
        <main>

          {/* ━━━━━━━━━━━ 헤더 영역 — 데스크탑 (lg 이상, 기존) ━━━━━━━━━━━ */}
          <div className="hidden lg:block">
            <div style={{ fontSize:"10px", color:color, fontWeight:"700", letterSpacing:"2px", textTransform:"uppercase", marginBottom:"14px", display:"flex", alignItems:"center", gap:"8px" }}>
              <span style={{ width:"24px", height:"1px", background:color, display:"inline-block" }} />{a.channel}
            </div>
            <h1 style={{ fontFamily:"serif", fontSize:"34px", fontWeight:"700", lineHeight:"1.4", color:"#0d2d52", marginBottom:"16px", letterSpacing:"-1px" }}>{a.title}</h1>
            <div style={{ fontFamily:"serif", fontSize:"17px", color:"#5a5a5a", lineHeight:"1.6", marginBottom:"24px", fontStyle:"italic", borderLeft:"3px solid #1c4f8a", paddingLeft:"16px" }}>{a.subtitle}</div>

            {/* 기자 메타 (데스크탑 기존) */}
            <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"16px 0", borderTop:"1px solid #e0e0e0", borderBottom:"1px solid #e0e0e0", marginBottom:"28px" }}>
              <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:color, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"18px", fontWeight:"700", flexShrink:0 }}>정</div>
              <div>
                <div style={{ fontSize:"13px", fontWeight:"700", marginBottom:"3px" }}>{a.author_name}</div>
                <div style={{ fontSize:"11px", color:"#9a9a9a" }}>{a.author_bio}</div>
              </div>
              <div style={{ marginLeft:"auto", textAlign:"right", fontSize:"11px", color:"#9a9a9a", lineHeight:"1.8" }}>
                <div>{a.published_at}</div>
                <div>
                  ⏱ {a.read_time}분
                  {a.view_count >= 100 && (
                    <> · 👁 <strong style={{ color:"#555" }}>{a.view_count.toLocaleString()}</strong></>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ━━━━━━━━━━━ 헤더 영역 — 모바일 (lg 미만, 신문형 신규) ━━━━━━━━━━━ */}
          <div className="lg:hidden">
            {/* 채널 배지 */}
            <span className={`inline-block ${getChannelColorClasses(a.channel)} text-[11px] font-bold px-2 py-1 rounded tracking-wider mb-3`}>
              {a.channel}
            </span>

            {/* 명조체 헤드라인 */}
            <h1 className="font-serif text-[24px] font-bold leading-[1.3] tracking-tight text-neutral-900 mb-3">
              {a.title}
            </h1>

            {/* 부제목 (요약) */}
            <div className="font-serif text-[15px] text-neutral-600 italic leading-[1.6] mb-4 border-l-[3px] border-blue-700 pl-4">
              {a.subtitle}
            </div>

            {/* 기자 메타 — 한 줄 (모바일 본문 진입 빠르게, 하단 기자란에 풀 이력 있음) */}
            <div className="my-3 text-sm text-neutral-600 leading-relaxed">
              <span className="font-bold text-neutral-900">{a.author_name}</span>
              <span className="mx-1.5 text-neutral-400">·</span>
              <span>{a.published_at}</span>
              <span className="mx-1.5 text-neutral-400">·</span>
              <span>읽기 {a.read_minutes || a.read_time || 5}분</span>
              {a.view_count >= 100 && (
                <>
                  <span className="mx-1.5 text-neutral-400">·</span>
                  <span>👁 {a.view_count.toLocaleString()}</span>
                </>
              )}
            </div>
          </div>

          {/* 대표 이미지 — 모바일 16/9 비율(사진 규격 일치 → 잘림 없음), 데스크탑 380px 고정 cover 유지 */}
          <img
            src={a.thumbnail}
            alt={a.image_alt || a.title}
            className="w-full aspect-[16/9] h-auto object-cover lg:aspect-auto lg:h-[380px]"
            style={{ borderRadius:"4px", marginBottom: a.image_alt ? "6px" : "10px", display:"block" }}
          />
          {/* 대표 이미지 캡션 — image_alt 있을 때만 노출 (본문 [이미지:] 캡션과 동일 스타일) */}
          {a.image_alt && (
            <div style={{ fontSize:"0.85rem", color:"#888", textAlign:"center", marginTop:"8px", lineHeight:"1.6" }}>
              {a.image_alt}
            </div>
          )}
          <div style={{ fontSize:"11px", color:"#9a9a9a", textAlign:"center", marginBottom:"32px", fontStyle:"italic", marginTop: a.image_alt ? "4px" : "0" }}>{a.channel} / 이음미디어</div>

          {/* 본문 — 평문 + 원문 보기 (스테이지 1) — 모바일 16/1.8, 데스크탑 17/2.0 */}
          <div className="text-[16px] leading-[1.8] lg:text-[17px] lg:leading-[2.0] text-neutral-800" style={{ fontFamily:"'Noto Sans KR', sans-serif", marginBottom:"24px" }}>
            {(() => {
              // 단락 분할 전 박스 태그 보호 — 분할기가 박스 내부를 쪼개 매칭이 깨지는 버그 우회
              const { text: pc, blocks } = preserveBlockTags(a.content);
              // 박스가 있으면 무조건 \n 분기 사용 (splitIntoParagraphs의 무조건 '.' 추가가 박스 매칭을 깨뜨림)
              const paragraphs = (blocks.length > 0 || (pc && pc.includes('\n')))
                ? pc.split(/\n+/).map(p => p.trim()).filter(Boolean)
                : splitIntoParagraphs(pc);
              return paragraphs.flatMap((para, i, arr) => {
              const midIdx = Math.floor((arr.length - 1) / 2);
              const html = paragraphToHtml(restoreBlockTags(para, blocks));
              const items = [<div key={"p-"+i} dangerouslySetInnerHTML={{ __html: html }} />];
              // 본문 중간 배너 — inline_ad_title 있을 때만 삽입 (이미지 유무에 따라 자동 분기)
              if (i === midIdx && article.inline_ad_title) {
                const hasImage = !!article.inline_ad_image;
                if (hasImage) {
                  // 이미지형 — 이미지가 카드 본체(원본 비율, 잘림 없음). SPONSORED 라벨 위 + 제목/부제 아래
                  items.push(
                    <a key={"midad-"+i} href={article.inline_ad_link || '#'} target="_blank" rel="noopener noreferrer"
                      style={{ display:"block", width:"100%", margin:"32px 0",
                               background:"#f7f8fa", border:"1px solid #e0e0e0",
                               borderLeft:"4px solid #1c4f8a", overflow:"hidden",
                               textDecoration:"none", color:"inherit",
                               fontFamily:"'Noto Sans KR', sans-serif" }}>
                      <div style={{ padding:"10px 16px 8px", fontSize:"10px", color:"#9a9a9a", letterSpacing:"1px", fontWeight:"700", borderBottom:"1px solid #e8e8e8" }}>SPONSORED</div>
                      <img src={article.inline_ad_image} alt={article.inline_ad_title}
                        style={{ width:"100%", height:"auto", display:"block" }} />
                      <div style={{ display:"flex", alignItems:"center", gap:"12px", padding:"14px 16px" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:"15px", fontWeight:"700", color:"#0d2d52", marginBottom: article.inline_ad_subtitle ? "4px" : 0 }}>{article.inline_ad_title}</div>
                          {article.inline_ad_subtitle && (
                            <div style={{ fontFamily:"serif", fontSize:"13px", color:"#5a5a5a", fontStyle:"italic", lineHeight:"1.5" }}>{article.inline_ad_subtitle}</div>
                          )}
                        </div>
                        <div style={{ fontSize:"20px", color:"#0d2d52", flexShrink:0 }}>→</div>
                      </div>
                    </a>
                  );
                } else {
                  // 텍스트형 — 좌측 SPONSORED 세로 라벨 + 우측 제목/부제 (기존 디자인 유지)
                  items.push(
                    <a key={"midad-"+i} href={article.inline_ad_link || '#'} target="_blank" rel="noopener noreferrer"
                      style={{ display:"flex", alignItems:"center", gap:"16px", width:"100%", minHeight:"80px", padding:"16px 20px", margin:"32px 0", background:"#f7f8fa", border:"1px solid #e0e0e0", borderLeft:"4px solid #1c4f8a", textDecoration:"none", color:"inherit", fontFamily:"'Noto Sans KR', sans-serif" }}>
                      <div style={{ fontSize:"10px", color:"#9a9a9a", letterSpacing:"1px", fontWeight:"700", flexShrink:0, paddingRight:"16px", borderRight:"1px solid #e0e0e0" }}>SPONSORED</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:"15px", fontWeight:"700", color:"#0d2d52", marginBottom:"4px" }}>{article.inline_ad_title}</div>
                        {article.inline_ad_subtitle && (
                          <div style={{ fontFamily:"serif", fontSize:"13px", color:"#5a5a5a", fontStyle:"italic", lineHeight:"1.5" }}>{article.inline_ad_subtitle}</div>
                        )}
                      </div>
                      <div style={{ fontSize:"20px", color:"#0d2d52", flexShrink:0 }}>→</div>
                    </a>
                  );
                }
              }
              return items;
              });
            })()}
          </div>
          <div style={{ borderTop:"2px solid #bbb", margin:"24px 0" }} />
          <div style={{ display:"flex", justifyContent: article.external_url ? "space-between" : "center", alignItems:"flex-start", marginBottom:"24px" }}>
            {article.external_url && (
              <a href={article.external_url} target="_blank" rel="noopener noreferrer"
                 style={{ display:"inline-block", background:"#0d2d52", color:"white", padding:"14px 28px", fontSize:"15px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
                원문 보기 →
              </a>
            )}
            <div style={{ textAlign: article.external_url ? "right" : "center" }}>
              <div style={{ fontSize:"13px", color:"#555", marginBottom:"4px" }}>
                정세연 편집국장 | press@eummedia.kr
              </div>
              <div style={{ fontSize:"12px", color:"#888", fontWeight:"600" }}>
                ⓒ 이음미디어, 무단전재 및 재배포 금지
              </div>
            </div>
          </div>
          {/* 이음매거진 통합 안내 — 창간(2026-06-08 KST) 이전 발행 기사에만 노출 */}
          {article.published_at && new Date(article.published_at) < LEGACY_NOTICE_CUTOFF && (
            <div style={{ fontSize:"12px", color:"#9a9a9a", marginBottom:"24px" }}>
              이음매거진은 인터넷신문 이음미디어로 통합되었습니다.<br />
              '세상과 당신을 잇는, 더 넓은 미디어의 시작입니다.'
            </div>
          )}

          {/* 🎬 영상 임베드 — show_in_article=true + video_url + 유효한 YouTube일 때만 */}
          {/* show_in_article=false면 video_url은 보존되지만 본문엔 노출 X (영상 갤러리에만 또는 미노출) */}
          {(() => {
            if (!a.show_in_article) return null;
            const embedUrl = getYouTubeEmbedUrl(a.video_url);
            if (!embedUrl) return null;
            return (
              <div style={{ margin: "32px 0" }}>
                <div style={{ fontSize:"13px", fontWeight:"700", color:"#0d2d52", letterSpacing:"1px", marginBottom:"12px" }}>
                  🎬 기사 영상
                </div>
                <div style={{
                  position: "relative", width: "100%", paddingBottom: "56.25%",
                  background: "#000", borderRadius: "8px", overflow: "hidden",
                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                }}>
                  <iframe
                    src={embedUrl}
                    title={a.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    style={{
                      position: "absolute", top: 0, left: 0,
                      width: "100%", height: "100%", border: 0,
                    }}
                  />
                </div>
              </div>
            );
          })()}

          {/* 모바일 반응 바 — 본문 끝 inline 1회 (lg:hidden, 스크롤 따라다니지 않음) */}
          <BottomReactionBar
            liked={liked} likeCount={likeCount} onLike={onLike}
            onCopy={onCopy} copied={copied}
            onKakao={onKakao} onFb={onFb}
            commentCount={comments.length}
          />

          {/* 💬 댓글 — 광고 박스 위로 이동 (commit 44 섹션 순서 정정) */}
          <div id="comment-section" style={{ margin:"32px 0" }}>
            <div style={{ fontSize:"15px", fontWeight:"700", color:"#0d2d52", borderBottom:"2px solid #0d2d52", paddingBottom:"10px", marginBottom:"20px" }}>댓글 {comments.length}개</div>
            {/* 입력 폼 — 로그인 시 / 비로그인 시 분기 */}
            {user ? (
              <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px", marginBottom:"20px" }}>
                <div style={{ fontSize:"12px", color:"#6b6b6b", marginBottom:"8px" }}>
                  <strong style={{ color:"#0d2d52" }}>{profile?.nickname || user.email}</strong>님으로 작성
                </div>
                <textarea value={cText} onChange={e => setCText(e.target.value)} placeholder="의견을 남겨주세요..." rows={3} style={{ width:"100%", border:"1px solid #d0d0d0", padding:"10px 12px", fontSize:"13px", fontFamily:"inherit", resize:"none", outline:"none", boxSizing:"border-box", marginBottom:"8px" }} />
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <button onClick={onComment} disabled={posting || !cText.trim()}
                    style={{ background: posting || !cText.trim() ? "#9a9a9a" : "#0d2d52", color:"white", border:"none", padding:"8px 20px", fontSize:"12px", fontWeight:"700", cursor: posting || !cText.trim() ? "not-allowed" : "pointer", fontFamily:"inherit" }}>
                    {posting ? "등록 중..." : "댓글 등록"}
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ background:"#f7f8fa", border:"1px solid #e0e0e0", padding:"16px", marginBottom:"20px", textAlign:"center" }}>
                <div style={{ fontSize:"13px", color:"#6b6b6b", marginBottom:"10px" }}>
                  💬 댓글은 로그인 후 작성할 수 있습니다.
                </div>
                <div style={{ display:"flex", justifyContent:"center", gap:"8px", flexWrap:"wrap" }}>
                  <Link to="/login" style={{ display:"inline-block", background:"#0d2d52", color:"white", padding:"8px 20px", fontSize:"12px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
                    로그인
                  </Link>
                  <Link to="/register" style={{ display:"inline-block", background:"#fff", color:"#0d2d52", padding:"8px 20px", fontSize:"12px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit", border:"1px solid #0d2d52" }}>
                    회원가입
                  </Link>
                </div>
              </div>
            )}

            {comments.length === 0 && (
              <div style={{ padding:"24px 0", textAlign:"center", color:"#9a9a9a", fontSize:"13px" }}>
                아직 댓글이 없습니다. 첫 댓글을 남겨주세요.
              </div>
            )}
            {comments.map(c => {
              const nickname = c.author?.nickname || '익명';
              const initial = nickname.charAt(0);
              const date = c.created_at ? formatDate(c.created_at) : '';
              const isOwn = !!user && c.author_id === user.id;
              const canEdit = isOwn;
              const canDelete = isOwn || isAdmin;
              const isEditing = editingCommentId === c.id;
              const wasEdited = c.updated_at && c.created_at &&
                new Date(c.updated_at).getTime() - new Date(c.created_at).getTime() > 1000;
              return (
                <div key={c.id} style={{ padding:"16px 0", borderBottom:"1px solid #f0f0f0" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                    <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                      <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"#e0e0e0", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:"700", color:"#555" }}>{initial}</div>
                      <div>
                        <div style={{ fontSize:"12px", fontWeight:"700" }}>{nickname}</div>
                        <div style={{ fontSize:"10px", color:"#9a9a9a" }}>
                          {date}
                          {wasEdited && <span style={{ marginLeft:"6px", color:"#bbb" }}>(수정됨)</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:"11px", color:"#9a9a9a" }}>👍 {c.like_count ?? 0}</div>
                  </div>
                  {isEditing ? (
                    <div style={{ paddingLeft:"42px" }}>
                      <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
                        style={{ width:"100%", border:"1px solid #d0d0d0", padding:"10px 12px", fontSize:"13px", fontFamily:"inherit", resize:"none", outline:"none", boxSizing:"border-box", marginBottom:"8px", lineHeight:"1.6" }} />
                      <div style={{ display:"flex", gap:"8px", justifyContent:"flex-end" }}>
                        <button onClick={cancelEditComment}
                          style={{ background:"#fff", color:"#666", border:"1px solid #d0d0d0", padding:"6px 14px", fontSize:"13px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", borderRadius:"4px" }}>
                          취소
                        </button>
                        <button onClick={() => saveEditComment(c.id)}
                          style={{ background:"#0d2d52", color:"white", border:"none", padding:"6px 14px", fontSize:"13px", fontWeight:"700", cursor:"pointer", fontFamily:"inherit", borderRadius:"4px" }}>
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div style={{ fontSize:"13px", color:"#3a3a3a", lineHeight:"1.7", paddingLeft:"42px", whiteSpace:"pre-wrap" }}>{c.content}</div>
                      {(canEdit || canDelete) && (
                        <div style={{ display:"flex", gap:"6px", justifyContent:"flex-end", marginTop:"8px", paddingLeft:"42px" }}>
                          {canEdit && (
                            <button onClick={() => startEditComment(c)}
                              style={{ background:"transparent", color:"#1c4f8a", border:"1px solid #1c4f8a", padding:"4px 10px", fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", borderRadius:"4px" }}>
                              ✏️ 수정
                            </button>
                          )}
                          {canDelete && (
                            <button onClick={() => deleteComment(c.id)}
                              style={{ background:"transparent", color:"#c0392b", border:"1px solid #c0392b", padding:"4px 10px", fontSize:"12px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit", borderRadius:"4px" }}>
                              🗑 삭제
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
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
                    {authorArticles.length > 0 && (
                      <div style={{ paddingTop:"14px", borderTop:"1px solid #e0e0e0" }}>
                        <div style={{ fontSize:"11px", color:"#9a9a9a", fontWeight:"700", letterSpacing:"1px", marginBottom:"10px" }}>이 기자의 다른 기사</div>
                        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                          {authorArticles.map(art => (
                            <Link key={art.id} to={`/article/${art.slug}`} style={{ display:"flex", alignItems:"center", gap:"10px", textDecoration:"none" }}>
                              <div style={{ width:"56px", height:"42px", background:"#eef3fa", borderRadius:"3px", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.1rem", overflow:"hidden" }}>
                                {art.thumbnail_url
                                  ? <img src={art.thumbnail_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                                  : '📰'}
                              </div>
                              <div>
                                <div style={{ fontSize:"12px", color:"#1a1a1a", fontWeight:"600", lineHeight:"1.4" }}>{art.title}</div>
                                <div style={{ fontSize:"10px", color:"#9a9a9a", marginTop:"2px" }}>{formatDate(art.published_at)}</div>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 📱 카드뉴스 — 다른 기사 카드뉴스 갤러리 (모바일 2 / PC 3 + 더보기)
              · 0건이면 섹션 숨김
              · 카드 클릭 → 해당 카드뉴스의 5장 슬라이드쇼
              · 엔딩 슬라이드 "전체 기사 보기 →" → 그 기사로 이동
              · 순서: 기자란 → 카드뉴스 → 광고박스 → 영상갤러리 (commit 52) */}
          {cardnewsList.length > 0 && (
            <div style={{ marginTop:"32px" }}>
              <div style={{ fontSize:"20px", fontWeight:"700", color:"#0d2d52", borderLeft:"4px solid #0d2d52", paddingLeft:"12px", marginBottom:"16px" }}>📱 카드뉴스</div>
              <CardNewsGallery key={slug} items={cardnewsList} onOpen={setOpenCardnews} />
            </div>
          )}

          {/* 구분선 */}
          <div style={{ borderTop:"1px solid #e0e0e0", margin:"32px 0" }} />

          {/* 광고 박스 — 정세연 본인 광고 (광고 샘플 역할) — 카드뉴스 뒤로 이동 (commit 52) */}
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

          {/* 📺 영상 갤러리 — show_in_gallery=true 큐레이션 (0건 시 섹션 숨김) */}
          {galleryVideos.length > 0 && (
            <div style={{ marginTop:"32px" }}>
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"space-between",
                borderLeft:"4px solid #0d2d52", paddingLeft:"12px", marginBottom:"16px",
              }}>
                <div style={{ fontSize:"20px", fontWeight:"700", color:"#0d2d52" }}>📺 영상 갤러리</div>
                <Link to="/videos" style={{
                  fontSize:"13px", fontWeight:"700", color:"#0d2d52",
                  textDecoration:"none", borderBottom:"1px solid #0d2d52", paddingBottom:"1px",
                }}>더보기 →</Link>
              </div>
              <VideoGallery videos={galleryVideos} />
            </div>
          )}

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

          {/* 🌱 피움앱 연결 뼈대 — 이음 기사 → 피움 앱 */}
          {/* TODO: 나중에 article.pium_app_slug 값이 있으면 실제 앱 링크로 교체 */}
          <div style={{
            margin:"24px 0 8px",
            padding:"16px",
            background:"#f0fdf4",
            border:"1.5px solid #bbf7d0",
            borderRadius:"4px",
            display:"flex",
            alignItems:"center",
            justifyContent:"space-between",
            gap:"12px",
          }}>
            <div>
              <div style={{ fontSize:"11px", color:"#166534", fontWeight:"700", marginBottom:"4px" }}>🌱 피움앱</div>
              <div style={{ fontSize:"12px", color:"#3d5a3e", lineHeight:"1.6" }}>
                이 기사의 메이커가 만든 앱을<br />피움앱에서 만나보세요.
              </div>
            </div>
            <Link to="/pium" style={{
              flexShrink:0,
              background:"#166534",
              color:"#fff",
              textDecoration:"none",
              fontSize:"11px",
              fontWeight:"700",
              padding:"8px 14px",
              borderRadius:"4px",
              fontFamily:"inherit",
              whiteSpace:"nowrap",
            }}>
              앱 보러가기 →
            </Link>
          </div>

        </main>

        {/* 사이드바 — 협찬 3개 (양주상회 → 플레이앤팝 → 닥터리부트) */}
        <aside className="lg:sticky lg:top-5" style={{ display:"flex", flexDirection:"column", gap:"24px" }}>

          {/* 🌱 피움앱 고정 배너 — 사이드바 항상 첫 번째 */}
          <div style={{ background:"#ffffff", border:"1px solid #e0e0e0", borderRadius:"4px", overflow:"hidden" }}>
            <Link to="/pium" style={{ display:"flex", alignItems:"center", justifyContent:"center", textDecoration:"none", background:"#ffffff", height:"160px" }}>
              <img src="/pium-banner.png" alt="피움앱 — 경험이 기술을 입다"
                   style={{ display:"block", width:"100%", height:"160px", objectFit:"contain", objectPosition:"center", background:"#ffffff" }} />
            </Link>
            <div style={{ padding:"10px 12px", display:"flex", flexDirection:"column", gap:"7px" }}>
              <Link to="/pium-store"
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

          {/* 📦 사이드 광고 (DB 토글) — 양주상회 카드 바로 아래 */}
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
            <a href="http://pf.kakao.com/_DxnesX/friend" target="_blank" rel="noopener noreferrer"
               style={{ display:"block", textAlign:"center", width:"100%", boxSizing:"border-box", background:"#FEE500", color:"#3C1E1E", padding:"12px", fontSize:"13px", fontWeight:"700", textDecoration:"none", fontFamily:"inherit" }}>
              💬 카카오 채널 구독 (무료)
            </a>
          </div>
        </aside>
      </div>

      {/* BottomReactionBar는 본문 끝(main 내부)에 직접 마운트됨 — 여기엔 없음 */}

      {/* 📱 카드뉴스 슬라이드쇼 모달 — 선택된 카드뉴스 5장 (C안 CardSlide)
          articleSlug 명시: 엔딩 "전체 기사 보기 →" 클릭 시 그 기사로 이동 */}
      {openCardnews && (
        <CardNewsSlideshow
          cardnews={openCardnews}
          onClose={() => setOpenCardnews(null)}
          articleThumbnail={openCardnews.articles?.thumbnail_url}
          channelName={openCardnews.articles?.channels?.name}
          articleSlug={openCardnews.articles?.slug}
        />
      )}
    </div>
  );
}

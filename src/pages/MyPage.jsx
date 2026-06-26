import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

const PAGE_SIZE = 15;

// 시민기자 마이페이지 — 1단계 UI (이어쓰기는 별도 commit)
export default function MyPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [application, setApplication] = useState(null);  // 신청자 상태 카드용

  // 비로그인 시 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('articles')
        .select('id, slug, title, status, citizen_complete, reject_reason, view_count, like_count, comment_count, updated_at, channels(name)')
        .eq('author_id', user.id)
        .order('updated_at', { ascending: false });
      if (cancelled) return;
      if (error) { console.error('[MyPage] articles fetch:', error); }
      setArticles(data || []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  // 신청자 상태 카드용 — writer_applications 본인 row (가장 최근 1건)
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from('writer_applications')
        .select('id, status, reject_reason, applied_at')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancelled) return;
      setApplication(data || null);
    })();
    return () => { cancelled = true; };
  }, [user]);

  const counts = {
    all: articles.length,
    draft: articles.filter(a => a.status === 'draft').length,
    submitted: articles.filter(a => a.status === 'submitted').length,
    rejected: articles.filter(a => a.status === 'rejected').length,
    published: articles.filter(a => a.status === 'published').length,
  };

  // 통계
  const totalViews = articles.reduce((sum, a) => sum + (a.view_count || 0), 0);
  const totalLikes = articles.reduce((sum, a) => sum + (a.like_count || 0), 0);

  const filteredArticles = filter === 'all' ? articles : articles.filter(a => a.status === filter);

  // 필터 변경 시 페이지네이션 초기화 (render 중 state 조정 — React 19 권장 패턴)
  const [prevFilter, setPrevFilter] = useState(filter);
  if (filter !== prevFilter) {
    setPrevFilter(filter);
    setVisibleCount(PAGE_SIZE);
  }

  const visibleArticles = filteredArticles.slice(0, visibleCount);
  const hasMore = filteredArticles.length > visibleCount;
  const remaining = filteredArticles.length - visibleCount;

  // 임시저장 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) { alert(`삭제 실패: ${error.message}`); return; }
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // 이어쓰기 — /write?id=xxx 진입 (ArticleEditor에서 fetchDraft + UPDATE 분기)

  if (!user) return null;

  // "새 기사 쓰기" CTA는 writer 전용 (admin/publisher는 /admin에서 진행)
  const isWriter = profile?.role === 'writer';
  const nickname = profile?.nickname || user.email || '회원';
  const initial = nickname.charAt(0).toUpperCase();
  const joinedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('ko-KR')
    : '';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8" style={{ fontFamily: "'Noto Sans KR',sans-serif" }}>
      {/* 1. 기자 기본 정보 */}
      <section className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-[#0d2d52] text-white flex items-center justify-center text-2xl font-bold flex-shrink-0">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif font-bold text-2xl text-neutral-900 truncate">
              {nickname}
            </h1>
            <p className="text-sm text-neutral-600 mt-1">
              이음미디어 {
                profile?.role === 'admin' ? '편집국장' :
                profile?.role === 'publisher' ? '발행인' :
                profile?.role === 'writer' ? '시민기자' : '독자'
              }
            </p>
            {joinedDate && (
              <p className="text-xs text-neutral-500 mt-1">
                가입일: {joinedDate}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* ── 피움 섹션 ── */}
      <div style={{
        background: "linear-gradient(135deg, #dcfce7 0%, #ede9fe 100%)",
        border: "1.5px solid #d1fae5",
        borderRadius: 12,
        padding: "20px 24px",
        marginBottom: 24,
        fontFamily: "'Noto Sans KR', sans-serif",
      }}>
        {/* 헤더 */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom: 16 }}>
          <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
            <img src="/pium-logo.png" alt="plum"
                 style={{ height: 28, width:"auto", objectFit:"contain", mixBlendMode:"multiply" }}/>
            <span style={{ fontSize: 15, fontWeight: 800, color: "#14532d" }}>피움 웹앱스토어</span>
          </div>
          <Link to="/pium" style={{
            fontSize: 12, color: "#166534", fontWeight: 700,
            textDecoration: "none", padding: "4px 12px",
            border: "1.5px solid #166534", borderRadius: 20,
          }}>피움 홈 →</Link>
        </div>

        {/* 역할 표시 */}
        <div style={{ display:"flex", alignItems:"center", gap: 12, flexWrap:"wrap" }}>
          <div style={{ display:"flex", alignItems:"center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "#374151" }}>피움 역할</span>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 99,
              background: profile?.pium_role === "maker"
                ? "linear-gradient(90deg,#16a34a,#7c3aed)"
                : "#e5e7eb",
              color: profile?.pium_role === "maker" ? "#fff" : "#374151",
            }}>
              {profile?.pium_role === "maker" ? "🌱 메이커" : "이용자"}
            </span>
          </div>
          {profile?.pium_role !== "maker" && (
            <span style={{ fontSize: 12, color: "#9ca3af" }}>
              앱을 등록하면 자동으로 메이커가 됩니다
            </span>
          )}
        </div>

        {/* 내 앱 목록 (2단계 예고) */}
        <div style={{
          marginTop: 16,
          padding: "12px 16px",
          background: "rgba(255,255,255,0.7)",
          borderRadius: 8,
          border: "1px dashed #bbf7d0",
          textAlign: "center",
          color: "#9ca3af",
          fontSize: 13,
        }}>
          🌱 내 앱 목록은 2단계에서 추가됩니다
        </div>
      </div>

      {/* 1.2 시민기자 신청자 상태 카드 — reader + 신청서 있을 때만 */}
      {profile?.role === 'reader' && application && (
        <ApplicationStatusCard app={application} />
      )}

      {/* 1.3 reader 전용 — 구독 정보 카드 */}
      {profile?.role === 'reader' && (
        <section className="bg-white border border-neutral-200 rounded-lg p-6 mb-6">
          <h2 className="font-serif font-bold text-xl mb-4 text-neutral-900">
            📋 구독 정보
          </h2>
          <dl className="text-sm">
            <div className="flex py-2 border-b border-neutral-100">
              <dt className="w-20 text-neutral-500 font-semibold flex-shrink-0">닉네임</dt>
              <dd className="text-neutral-900 truncate">{profile?.nickname || '—'}</dd>
            </div>
            <div className="flex py-2 border-b border-neutral-100">
              <dt className="w-20 text-neutral-500 font-semibold flex-shrink-0">이메일</dt>
              <dd className="text-neutral-900 truncate">{user.email}</dd>
            </div>
            <div className="flex py-2">
              <dt className="w-20 text-neutral-500 font-semibold flex-shrink-0">가입일</dt>
              <dd className="text-neutral-900">{joinedDate || '—'}</dd>
            </div>
          </dl>
        </section>
      )}

      {/* 1.4 reader 전용 — 시민기자 신청 CTA (신청 안 한 reader만) */}
      {profile?.role === 'reader' && !application && (
        <Link
          to="/citizen-reporter"
          className="block bg-[#c9a84c] hover:bg-[#b89844] text-[#0d2d52] rounded-lg px-6 py-5 mb-6 text-center transition no-underline"
          style={{ textDecoration: 'none' }}
        >
          <div className="text-3xl mb-2">✍️</div>
          <div className="font-serif font-bold text-xl">시민기자 신청하기</div>
          <div className="text-sm opacity-85 mt-1">
            이음미디어 시민기자로 활동해 보세요
          </div>
        </Link>
      )}

      {/* 1.5. 새 기사 쓰기 CTA — writer 전용 (admin/publisher는 /admin에서 진행) */}
      {isWriter && (
        <Link
          to="/write"
          className="block bg-[#0d2d52] hover:bg-[#1a4070] text-white rounded-lg px-6 py-5 mb-6 text-center transition no-underline"
          style={{ textDecoration: 'none' }}
        >
          <div className="text-3xl mb-2">✍️</div>
          <div className="font-serif font-bold text-xl">새 기사 쓰기</div>
          <div className="text-sm opacity-80 mt-1">
            시민기자로서 이야기를 세상에 전하세요
          </div>
        </Link>
      )}

      {/* 2. 활동 통계 — reader 숨김 (writer/admin/publisher만 노출) */}
      {profile?.role !== 'reader' && (
      <section className="mb-6">
        <h2 className="font-serif font-bold text-xl mb-3 text-neutral-900">
          📊 내 활동
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="총 작성" value={counts.all} color="neutral" />
          <StatCard label="발행" value={counts.published} color="green" />
          <StatCard label="검토대기" value={counts.submitted} color="red" />
          <StatCard label="임시저장" value={counts.draft} color="amber" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-3">
          <StatCard label="총 조회수" value={totalViews > 0 ? totalViews.toLocaleString() : '—'} color="blue" note={totalViews === 0 ? '집계 준비 중' : undefined} />
          <StatCard label="총 좋아요" value={totalLikes > 0 ? totalLikes.toLocaleString() : '—'} color="pink" note={totalLikes === 0 ? '집계 준비 중' : undefined} />
        </div>
      </section>
      )}

      {/* 3. 내 기사 목록 — reader 숨김 */}
      {profile?.role !== 'reader' && (
      <section>
        <h2 className="font-serif font-bold text-xl mb-3 text-neutral-900">
          📝 내 기사
        </h2>

        {/* 필터 탭 */}
        <div className="flex flex-wrap gap-2 mb-4">
          <FilterButton active={filter === 'all'}       onClick={() => setFilter('all')}       label={`전체 ${counts.all}`} />
          <FilterButton active={filter === 'draft'}     onClick={() => setFilter('draft')}     label={`💾 임시저장 ${counts.draft}`} />
          <FilterButton active={filter === 'submitted'} onClick={() => setFilter('submitted')} label={`🔴 검토대기 ${counts.submitted}`} />
          <FilterButton active={filter === 'rejected'}  onClick={() => setFilter('rejected')}  label={`❌ 반려 ${counts.rejected}`} />
          <FilterButton active={filter === 'published'} onClick={() => setFilter('published')} label={`✅ 발행 ${counts.published}`} />
        </div>

        {loading ? (
          <div className="text-center py-12 text-neutral-500">불러오는 중...</div>
        ) : filteredArticles.length === 0 ? (
          <div className="text-center py-12 text-neutral-500 bg-neutral-50 rounded-lg">
            {filter === 'all' ? (
              <>
                아직 작성한 기사가 없습니다.
                {isWriter && (
                  <>
                    <br />
                    <Link to="/write" className="text-blue-600 underline mt-2 inline-block">
                      ✍️ 첫 기사 작성하기 →
                    </Link>
                  </>
                )}
              </>
            ) : (
              `${getStatusLabel(filter)} 기사가 없습니다.`
            )}
          </div>
        ) : (
          <>
            <ul className="space-y-3">
              {visibleArticles.map(a => (
                <ArticleCard
                  key={a.id}
                  article={a}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
            {hasMore && (
              <button
                type="button"
                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                className="w-full py-3 mt-4 bg-white text-[#0d2d52] border border-[#0d2d52] rounded-lg font-bold hover:bg-neutral-50 transition"
              >
                ⬇ 더보기 ({remaining})
              </button>
            )}
          </>
        )}
      </section>
      )}
    </div>
  );
}

// ━━━━━━━━━━━ 보조 컴포넌트 ━━━━━━━━━━━

function ApplicationStatusCard({ app }) {
  const dateStr = app.applied_at
    ? new Date(app.applied_at).toLocaleDateString('ko-KR')
    : '';

  if (app.status === 'pending') {
    return (
      <section className="mb-6 rounded-lg p-5 border" style={{ background: '#eff6ff', borderColor: '#93c5fd' }}>
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">📋</div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif font-bold text-lg text-[#0d2d52] mb-1">
              시민기자 신청 검토 중입니다
            </h2>
            <p className="text-sm text-neutral-700 leading-relaxed">
              편집국장이 검토 후 1-3일 이내에 연락드립니다.
              {dateStr && <span className="text-xs text-neutral-500 ml-2">(신청일: {dateStr})</span>}
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (app.status === 'rejected') {
    return (
      <section className="mb-6 rounded-lg p-5 border" style={{ background: '#fff7ed', borderColor: '#fdba74' }}>
        <div className="flex items-start gap-3">
          <div className="text-3xl flex-shrink-0">📨</div>
          <div className="min-w-0 flex-1">
            <h2 className="font-serif font-bold text-lg text-[#9a3412] mb-2">
              안내: 이번 신청은 반려되었습니다
            </h2>
            {app.reject_reason && (
              <p className="text-sm text-neutral-800 leading-relaxed bg-white border border-orange-200 rounded p-3 mb-2 whitespace-pre-wrap">
                <strong className="text-[#9a3412]">사유:</strong> {app.reject_reason}
              </p>
            )}
            <p className="text-xs text-neutral-600">
              문의: <a href="mailto:press@eummedia.kr" className="text-[#0d2d52] underline">press@eummedia.kr</a>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return null;  // approved 등 다른 status는 표시 안 함
}

function StatCard({ label, value, color, note }) {
  const colors = {
    neutral: 'bg-neutral-50 text-neutral-700',
    green:   'bg-green-50 text-green-700',
    red:     'bg-red-50 text-red-700',
    amber:   'bg-amber-50 text-amber-700',
    blue:    'bg-blue-50 text-blue-700',
    pink:    'bg-pink-50 text-pink-700',
  };
  return (
    <div className={`${colors[color]} rounded-lg p-3 text-center`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-1">{label}</div>
      {note && (
        <div className="text-[10px] mt-0.5 opacity-70">({note})</div>
      )}
    </div>
  );
}

function FilterButton({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-2 rounded-full text-sm font-bold transition ${
        active
          ? 'bg-[#0d2d52] text-white'
          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
      }`}
    >
      {label}
    </button>
  );
}

function ArticleCard({ article, onDelete }) {
  const statusInfo = {
    draft:     { label: '💾 임시저장', color: 'bg-neutral-100 text-neutral-700' },
    submitted: { label: '🔴 검토대기', color: 'bg-red-50 text-red-700' },
    rejected:  { label: '❌ 반려됨',   color: 'bg-orange-50 text-orange-700' },
    published: { label: '✅ 발행됨',   color: 'bg-green-50 text-green-700' },
  }[article.status] || { label: article.status, color: 'bg-neutral-100 text-neutral-700' };

  return (
    <li className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition">
      {/* 상태 + 채널 + 완성도 */}
      <div className="flex items-center gap-2 mb-2 flex-wrap">
        <span className={`${statusInfo.color} px-2 py-1 rounded text-xs font-bold`}>
          {statusInfo.label}
        </span>
        {article.channels?.name && (
          <span className="text-xs text-neutral-500">
            [{article.channels.name}]
          </span>
        )}
        {article.citizen_complete > 0 && (
          <span className="text-xs text-neutral-500">
            · {article.citizen_complete}/14
          </span>
        )}
      </div>

      {/* 제목 */}
      <h3 className="font-serif font-bold text-lg mb-1 text-neutral-900">
        {article.title || '(제목 없음)'}
      </h3>

      {/* 반려 사유 */}
      {article.status === 'rejected' && article.reject_reason && (
        <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-400 text-sm text-red-700 rounded">
          <strong>반려 사유:</strong> {article.reject_reason}
        </div>
      )}

      {/* 시각 + 조회수 */}
      <div className="text-xs text-neutral-500 mt-2 flex gap-3 flex-wrap">
        <span>📅 {new Date(article.updated_at).toLocaleString('ko-KR')}</span>
        {article.status === 'published' && (
          <>
            <span>👁 {article.view_count > 0 ? article.view_count.toLocaleString() : '—'}</span>
            <span>❤️ {article.like_count > 0 ? article.like_count.toLocaleString() : '—'}</span>
          </>
        )}
      </div>

      {/* 액션 버튼 */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {article.status === 'draft' && (
          <>
            <Link
              to={`/write?id=${article.id}`}
              className="px-3 py-2 bg-[#0d2d52] text-white text-sm rounded font-bold inline-block"
            >
              ✍️ 이어서 작성
            </Link>
            <button
              onClick={() => onDelete(article.id)}
              className="px-3 py-2 bg-red-100 text-red-700 text-sm rounded"
            >
              🗑 삭제
            </button>
          </>
        )}
        {article.status === 'submitted' && (
          <span className="px-3 py-2 bg-amber-50 text-amber-700 text-sm rounded">
            ⏳ 편집국장 검토 대기 중
          </span>
        )}
        {article.status === 'rejected' && (
          <Link
            to={`/write?id=${article.id}`}
            className="px-3 py-2 bg-orange-500 text-white text-sm rounded font-bold inline-block"
          >
            ✍️ 수정해서 다시 제출
          </Link>
        )}
        {article.status === 'published' && article.slug && (
          <Link
            to={`/article/${article.slug}`}
            className="px-3 py-2 bg-green-600 text-white text-sm rounded inline-block"
          >
            👁 기사 보기
          </Link>
        )}
      </div>
    </li>
  );
}

function getStatusLabel(status) {
  return {
    draft: '임시저장',
    submitted: '검토대기',
    rejected: '반려된',
    published: '발행된',
  }[status] || '';
}

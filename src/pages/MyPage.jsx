import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// 시민기자 마이페이지 — 1단계 UI (이어쓰기는 별도 commit)
export default function MyPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

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

  // 임시저장 삭제
  const handleDelete = async (id) => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return;
    const { error } = await supabase.from('articles').delete().eq('id', id);
    if (error) { alert(`삭제 실패: ${error.message}`); return; }
    setArticles(prev => prev.filter(a => a.id !== id));
  };

  // 이어쓰기 (다음 commit에서 정식 구현)
  const handleResume = () => {
    alert('이어쓰기 기능은 곧 추가됩니다.');
  };

  if (!user) return null;

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
              이음미디어 {profile?.role === 'admin' ? '편집국장' : profile?.role === 'writer' ? '시민기자' : '독자'}
            </p>
            {joinedDate && (
              <p className="text-xs text-neutral-500 mt-1">
                가입일: {joinedDate}
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. 활동 통계 */}
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

      {/* 3. 내 기사 목록 */}
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
                <br />
                <Link to="/write" className="text-blue-600 underline mt-2 inline-block">
                  ✍️ 첫 기사 작성하기 →
                </Link>
              </>
            ) : (
              `${getStatusLabel(filter)} 기사가 없습니다.`
            )}
          </div>
        ) : (
          <ul className="space-y-3">
            {filteredArticles.map(a => (
              <ArticleCard
                key={a.id}
                article={a}
                onDelete={handleDelete}
                onResume={handleResume}
              />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

// ━━━━━━━━━━━ 보조 컴포넌트 ━━━━━━━━━━━

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

function ArticleCard({ article, onDelete, onResume }) {
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
            <button
              onClick={onResume}
              className="px-3 py-2 bg-[#0d2d52] text-white text-sm rounded font-bold"
            >
              ✍️ 이어서 작성
            </button>
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
          <button
            onClick={onResume}
            className="px-3 py-2 bg-orange-500 text-white text-sm rounded font-bold"
          >
            ✍️ 수정해서 다시 제출
          </button>
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

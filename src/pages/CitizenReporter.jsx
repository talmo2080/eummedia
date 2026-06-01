import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'

const ROADMAP = [
  { step: 'STEP 01', icon: '🎤', name: '봉숭아학당', desc: '방송스피치 과정\n수강 및 수료', color: '#e8f0f8' },
  { step: 'STEP 02', icon: '📚', name: '이음평생교육', desc: '시민기자 과정\n수료 (유료)', color: '#1c4f8a', white: true },
  { step: 'STEP 03', icon: '📝', name: '기사 데뷔', desc: '이음피플·이음로컬\n첫 기사 발행', color: '#e67e22', white: true },
  { step: 'STEP 04', icon: '📂', name: '포트폴리오', desc: '기자 이력\n디지털 아카이브', color: '#8e44ad', white: true },
  { step: 'STEP 05', icon: '🪪', name: '시민기자증', desc: '공식 기자증 발급\n(1년 유효)', color: '#c0392b', white: true },
]

const QUALIFICATIONS = [
  { icon: '✅', title: '봉숭아학당 수료자', desc: '봉숭아학당 문화혁신학교 방송스피치 과정을 수료한 분' },
  { icon: '✅', title: '이음평생교육원 수료자', desc: '이음평생교육원 시민기자 양성 과정을 수료한 분' },
  { icon: '✅', title: '기자증 갱신 대상자', desc: '기존 시민기자증 만료 후 재발급을 원하시는 분' },
  { icon: '✅', title: '지역 이야기 발굴 의지', desc: '고양·일산 지역 이야기를 발굴하고 기록하고 싶은 분' },
]

const BENEFITS = [
  { num: '01', text: '이음미디어 공식 시민기자증 발급 (1년 유효)' },
  { num: '02', text: '기사 작성 시 전문 편집 지원 및 피드백' },
  { num: '03', text: '디지털 포트폴리오 아카이브 제공' },
  { num: '04', text: '이음미디어 시민기자 네트워크 참여' },
  { num: '05', text: '우수 기자 선발 시 이음매거진 고정 필진 기회' },
  { num: '06', text: '기사 구글·네이버·AI 검색 최적화 게시' },
]

const FAQ = [
  { q: '봉숭아학당을 수료하지 않아도 지원 가능한가요?', a: '봉숭아학당 방송스피치 과정 수료가 시민기자 지원의 기본 조건입니다. 먼저 봉숭아학당 27기에 신청해주세요.' },
  { q: '기사를 쓴 경험이 없어도 되나요?', a: '괜찮습니다. 이음평생교육원 시민기자 과정에서 기사 작성법부터 차근차근 배울 수 있습니다.' },
  { q: '시민기자 활동은 어떻게 이루어지나요?', a: '주로 이음피플, 이음로컬 채널에 기사를 기고합니다. 월 1회 이상 기사 작성을 권장하며, 편집국의 피드백을 받아 발행됩니다.' },
  { q: '기자증 유효기간이 지나면 어떻게 되나요?', a: '1년 후 갱신 절차를 거쳐 재발급 가능합니다. 활동 실적이 있는 기자에게는 갱신 우선권이 주어집니다.' },
]

const inp = {
  width: '100%', padding: '11px 14px', border: '1px solid #d0d0d0',
  fontSize: 13, fontFamily: "'Noto Sans KR',sans-serif",
  outline: 'none', color: '#1a1a1a', background: 'white', boxSizing: 'border-box',
}
const lbl = { fontSize: 12, fontWeight: 700, color: '#3a3a3a', marginBottom: 6, display: 'block' }

export default function CitizenReporter() {
  const { user, profile } = useAuth()
  const [form, setForm] = useState({
    name: '', phone: '', region: '',
    qualify: '봉숭아학당 수료자',
    motive: '', experience: '', agree: false,
  })
  const [stage, setStage] = useState('form')   // form / submitted
  // 자격 자가확인 게이트 — 폼을 보여줄 자격이 있는 사용자 한정 노출
  // null: 아직 선택 안 함 / '봉숭아학당 수료자' | '이음평생교육원 수료자': 폼 펼침 / '미수료': 안내
  const [qualified, setQualified] = useState(null)
  const [openFaq, setOpenFaq] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [existingApp, setExistingApp] = useState(null)   // 본인 기존 신청서
  const [checking, setChecking] = useState(true)

  // 기존 신청서 조회 (중복 방지) — !user면 fetch 안 함, 화면 분기에서 !user 먼저 처리
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      const { data } = await supabase
        .from('writer_applications')
        .select('id, status, applied_at')
        .eq('user_id', user.id)
        .order('applied_at', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (cancelled) return
      setExistingApp(data || null)
      setChecking(false)
    })()
    return () => { cancelled = true }
  }, [user])

  // role 이미 writer/publisher/admin이면 신청 불필요
  const alreadyActive = profile && (
    profile.role === 'writer' ||
    profile.role === 'publisher' ||
    profile.role === 'admin'
  )

  const handleSubmit = async () => {
    setError('')
    if (!user) { setError('로그인 후 이용해주세요.'); return }
    if (!form.name.trim() || !form.phone.trim() || !form.region.trim()) {
      setError('이름·전화번호·지역은 필수 입력입니다.'); return
    }
    if (form.motive.trim().length < 50) {
      setError('지원 동기는 최소 50자 이상 작성해주세요.'); return
    }
    if (!form.agree) {
      setError('개인정보 수집·이용에 동의해주세요.'); return
    }

    setLoading(true)
    try {
      const { error: appError } = await supabase.from('writer_applications').insert({
        user_id: user.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        region: form.region.trim(),
        qualify: form.qualify,
        motive: form.motive.trim(),
        experience: form.experience.trim() || null,
      })
      if (appError) {
        setError(`신청서 제출 실패: ${appError.message}\n작성하신 내용은 그대로 보존됩니다.`)
        return
      }
      setStage('submitted')
    } catch (err) {
      setError(`${err?.message || '신청 처리 중 오류가 발생했습니다.'}\n작성하신 내용은 그대로 보존됩니다.`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Noto Sans KR',sans-serif" }}>

      {/* ── 히어로 ── */}
      <div style={{ background: 'linear-gradient(135deg,#0d2d52 0%,#1c4f8a 100%)', padding: '64px 0 52px', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>✍️</div>
          <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 36, fontWeight: 700, lineHeight: 1.4, marginBottom: 14, letterSpacing: -1 }}>
            당신의 이야기로<br /><em style={{ color: '#f0a882', fontStyle: 'normal' }}>세상을 잇는 기자</em>가 되세요
          </h1>
          <p style={{ fontSize: 15, opacity: 0.75, lineHeight: 1.85, fontWeight: 300, marginBottom: 28 }}>
            이음미디어 시민기자단에 합류하세요.<br />
            봉숭아학당 방송스피치 과정을 수료하면 시민기자 자격이 주어집니다.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '16px 20px', fontSize: 13, lineHeight: 1.7, textAlign: 'left' }}>
            <strong style={{ color: '#f0a882' }}>📌 중요 안내</strong><br />
            이음미디어 시민기자가 되려면 <strong style={{ color: '#f0a882' }}>봉숭아학당 방송스피치 과정</strong>을 먼저 수료해야 합니다.<br />
            수료 후 시민기자 교육을 받으면 공식 기자 활동을 시작할 수 있습니다.
          </div>
        </div>
      </div>

      {/* ── 로드맵 ── */}
      <div style={{ background: '#f7f8fa', borderBottom: '1px solid #e0e0e0', padding: '52px 0' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 10, color: '#1c4f8a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>ROADMAP</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>이렇게 시민기자가 됩니다</div>
            <div style={{ fontSize: 13, color: '#6b6b6b' }}>봉숭아학당에서 시작해서 이음미디어 공식 시민기자증까지 — 함께 걸어가요.</div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {ROADMAP.map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 10px', position: 'relative' }}>
                {i < 4 && <div style={{ position: 'absolute', right: -12, top: 24, fontSize: 18, color: '#c0c8d4' }}>→</div>}
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: s.color, margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, border: '3px solid white', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
                  {s.icon}
                </div>
                <div style={{ fontSize: 10, fontWeight: 700, color: '#1c4f8a', letterSpacing: 1, marginBottom: 6 }}>{s.step}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0d2d52', marginBottom: 4 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: '#6b6b6b', lineHeight: 1.6, whiteSpace: 'pre-line' }}>{s.desc}</div>
              </div>
            ))}
          </div>

          {/* 봉숭아학당 안내 박스 */}
          <div style={{ maxWidth: 800, margin: '36px auto 0', background: 'white', border: '1px solid #e0e0e0', borderLeft: '5px solid #1c4f8a', padding: '24px 28px', display: 'flex', gap: 20, alignItems: 'flex-start' }}>
            <div style={{ fontSize: 36, flexShrink: 0 }}>🎤</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>봉숭아학당 방송스피치 과정 — 27기 모집 중</div>
              <div style={{ fontSize: 13, color: '#5a5a5a', lineHeight: 1.8, marginBottom: 12 }}>
                이음미디어 시민기자의 첫 번째 관문, 봉숭아학당 방송스피치 과정입니다.<br />
                목소리와 말하기를 다듬고, 자신만의 표현 방식을 찾는 과정을 통해 시민기자의 기초를 쌓습니다.
              </div>
              <a href="mailto:press@eummedia.kr?subject=[봉숭아학당 27기 신청]"
                style={{ background: '#0d2d52', color: 'white', padding: '9px 22px', fontSize: 12, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontFamily: "'Noto Sans KR',sans-serif" }}>
                봉숭아학당 27기 신청하기 →
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── 폼 섹션 ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px' }}>

        {/* 지원 자격 */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, fontWeight: 700, color: '#0d2d52', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid #0d2d52' }}>
            시민기자 지원 자격
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {QUALIFICATIONS.map(q => (
              <div key={q.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '16px', background: '#f7f8fa', border: '1px solid #e8e8e8' }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{q.icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0d2d52', marginBottom: 4 }}>{q.title}</div>
                  <div style={{ fontSize: 11.5, color: '#6b6b6b', lineHeight: 1.6 }}>{q.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 14, background: '#fff8e1', borderLeft: '4px solid #f39c12', padding: '12px 16px', fontSize: 12, color: '#7d5a00', lineHeight: 1.7 }}>
            📌 봉숭아학당 미수료자는 먼저 봉숭아학당 27기에 신청해주세요. 수료 후 시민기자 과정으로 연계됩니다.
          </div>
        </div>

        {/* 지원 혜택 */}
        <div style={{ marginBottom: 44 }}>
          <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, fontWeight: 700, color: '#0d2d52', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid #0d2d52' }}>
            시민기자 혜택
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {BENEFITS.map((b, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: '1px solid #ebebeb' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#0d2d52', color: 'white', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {b.num}
                </div>
                <div style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.6 }}>{b.text}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 지원 폼 — 5가지 분기: 비로그인 / 로딩 / 이미 활동중 / 이미 신청함 / 폼 / 완료 */}
        {!user ? (
          /* 비로그인 안내 */
          <div style={{ background: '#fff7ed', border: '1px solid #fdba74', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>🔒</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 19, fontWeight: 700, color: '#9a3412', marginBottom: 10 }}>
              로그인 후 신청 가능합니다
            </div>
            <div style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.8, marginBottom: 22 }}>
              회원이 아니시면 회원가입과 동시에 시민기자 신청이 가능합니다.
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/login"
                style={{ background: '#0d2d52', color: 'white', padding: '12px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontFamily: "'Noto Sans KR',sans-serif", minHeight: 48, boxSizing: 'border-box', lineHeight: 1.7 }}>
                로그인
              </Link>
              <Link to="/signup"
                style={{ background: '#c9a84c', color: '#0d2d52', padding: '12px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontFamily: "'Noto Sans KR',sans-serif", minHeight: 48, boxSizing: 'border-box', lineHeight: 1.7 }}>
                회원가입+신청
              </Link>
            </div>
          </div>
        ) : checking ? (
          /* 본인 기존 신청서 확인 중 */
          <div style={{ padding: '40px', textAlign: 'center', color: '#888', fontSize: 14 }}>
            확인 중...
          </div>
        ) : alreadyActive ? (
          /* 이미 활동 중 (writer/publisher/admin) */
          <div style={{ background: '#e8f7ee', border: '1px solid #27ae60', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>✅</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 19, fontWeight: 700, color: '#1a7a3f', marginBottom: 10 }}>
              이미 이음미디어 시민기자/발행인/편집국장으로 활동 중입니다
            </div>
            <div style={{ fontSize: 14, color: '#2a5a3a', lineHeight: 1.8, marginBottom: 22 }}>
              별도 신청이 필요하지 않습니다.
            </div>
            <Link to="/mypage"
              style={{ background: '#0d2d52', color: 'white', padding: '12px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontFamily: "'Noto Sans KR',sans-serif", minHeight: 48, boxSizing: 'border-box', lineHeight: 1.7 }}>
              마이페이지로 가기
            </Link>
          </div>
        ) : existingApp ? (
          /* 이미 신청서 있음 — 상태별 안내 (중복 방지) */
          <div style={{ background: '#eff6ff', border: '1px solid #93c5fd', padding: '40px 28px', textAlign: 'center' }}>
            <div style={{ fontSize: 42, marginBottom: 12 }}>
              {existingApp.status === 'pending' ? '📋' : existingApp.status === 'rejected' ? '📨' : 'ℹ️'}
            </div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 19, fontWeight: 700, color: '#0d2d52', marginBottom: 10 }}>
              {existingApp.status === 'pending'
                ? '이미 신청하셨습니다 — 검토 중입니다'
                : existingApp.status === 'rejected'
                  ? '이전 신청이 반려되었습니다'
                  : `현재 신청 상태: ${existingApp.status}`}
            </div>
            <div style={{ fontSize: 14, color: '#1c4f8a', lineHeight: 1.8, marginBottom: 22 }}>
              {existingApp.status === 'pending'
                ? '편집국장이 검토 후 1-3일 이내에 연락드립니다.'
                : existingApp.status === 'rejected'
                  ? '문의: press@eummedia.kr'
                  : ''}
              {existingApp.applied_at && (
                <><br /><span style={{ fontSize: 12, color: '#6b6b6b' }}>
                  (신청일: {new Date(existingApp.applied_at).toLocaleDateString('ko-KR')})
                </span></>
              )}
            </div>
            <Link to="/mypage"
              style={{ background: '#0d2d52', color: 'white', padding: '12px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontFamily: "'Noto Sans KR',sans-serif", minHeight: 48, boxSizing: 'border-box', lineHeight: 1.7 }}>
              마이페이지로 가기
            </Link>
          </div>
        ) : stage === 'submitted' ? (
          /* 신청 완료 */
          <div style={{ background: '#e8f7ee', border: '1px solid #27ae60', padding: '52px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#1a7a3f', marginBottom: 10 }}>
              시민기자 신청이 접수되었습니다!
            </div>
            <div style={{ fontSize: 14, color: '#2a5a3a', lineHeight: 1.85, marginBottom: 28 }}>
              편집국장이 검토 후 <strong>1-3일 이내</strong>에 연락드립니다.<br />
              마이페이지에서 신청 상태를 확인하실 수 있습니다.
            </div>
            <Link to="/mypage"
              style={{ background: '#0d2d52', color: 'white', padding: '14px 32px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontFamily: "'Noto Sans KR',sans-serif", minHeight: 48, boxSizing: 'border-box', lineHeight: 1.7 }}>
              마이페이지로 가기
            </Link>
          </div>
        ) : qualified === null ? (
          /* 자격 자가확인 게이트 — 폼 진입 전 단계 */
          <div style={{ background: '#f7f8fa', border: '1px solid #e0e0e0', borderTop: '4px solid #0d2d52', padding: '32px' }}>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 20, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>
              자격 확인
            </div>
            <div style={{ fontSize: 14, color: '#3a3a3a', marginBottom: 24, lineHeight: 1.7 }}>
              아래 자격에 해당하시나요?
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button type="button" onClick={() => { setQualified('봉숭아학당 수료자'); setForm(f => ({ ...f, qualify: '봉숭아학당 수료자' })) }}
                style={{ background: '#0d2d52', color: 'white', border: 'none', padding: '20px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", textAlign: 'left', lineHeight: 1.5, minHeight: 56 }}>
                ✅ 봉숭아학당 방송스피치 과정 수료자
              </button>
              <button type="button" onClick={() => { setQualified('이음평생교육원 수료자'); setForm(f => ({ ...f, qualify: '이음평생교육원 수료자' })) }}
                style={{ background: '#0d2d52', color: 'white', border: 'none', padding: '20px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", textAlign: 'left', lineHeight: 1.5, minHeight: 56 }}>
                ✅ 이음평생교육원 시민기자 과정 수료자
              </button>
              <button type="button" onClick={() => setQualified('미수료')}
                style={{ background: 'white', color: '#0d2d52', border: '2px solid #c9a84c', padding: '20px 24px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", textAlign: 'left', lineHeight: 1.5, minHeight: 56 }}>
                아직 수료 전입니다
              </button>
            </div>
          </div>
        ) : qualified === '미수료' ? (
          /* 미수료 안내 — 봉숭아학당 27기 진입 유도 */
          <div style={{ background: '#fff7ed', border: '1px solid #fdba74', borderLeft: '5px solid #c9a84c', padding: '36px 32px' }}>
            <div style={{ fontSize: 38, marginBottom: 14 }}>🎤</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 20, fontWeight: 700, color: '#9a3412', marginBottom: 12, lineHeight: 1.5 }}>
              먼저 봉숭아학당 방송스피치 과정 수료가 필요합니다
            </div>
            <div style={{ fontSize: 14, color: '#5a3a1a', lineHeight: 1.85, marginBottom: 22 }}>
              이음미디어 시민기자가 되려면 먼저 봉숭아학당 방송스피치 과정을 수료해야 합니다.<br />
              아래 버튼으로 봉숭아학당 27기 신청을 보내주세요.
            </div>
            <a href="mailto:press@eummedia.kr?subject=[봉숭아학당 27기 신청]"
              style={{ background: '#0d2d52', color: 'white', padding: '14px 28px', fontSize: 14, fontWeight: 700, textDecoration: 'none', display: 'inline-block', fontFamily: "'Noto Sans KR',sans-serif", marginRight: 10, minHeight: 48, boxSizing: 'border-box', lineHeight: 1.7 }}>
              봉숭아학당 27기 신청하기 →
            </a>
            <button type="button" onClick={() => setQualified(null)}
              style={{ background: 'transparent', color: '#0d2d52', border: 'none', padding: '14px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", textDecoration: 'underline' }}>
              ← 자격 확인 다시
            </button>
          </div>
        ) : (
          /* 폼 — 로그인 + 신청서 없음 + 자격 확인 통과 */
          <div style={{ background: '#f7f8fa', border: '1px solid #e0e0e0', borderTop: '4px solid #0d2d52', padding: '32px' }}>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 20, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>시민기자 지원하기</div>
            <div style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 14, lineHeight: 1.6 }}>
              로그인된 계정({user.email})으로 신청합니다. 편집국장 검토 후 1-3일 이내 연락드립니다.
            </div>
            {/* 선택한 자격 표시 + 다시 선택 */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '10px 14px', background: '#eef3fa', border: '1px solid #c9d6e8', marginBottom: 22, fontSize: 13 }}>
              <span style={{ color: '#0d2d52' }}>
                선택한 자격: <strong>{qualified}</strong>
              </span>
              <button type="button" onClick={() => setQualified(null)}
                style={{ background: 'transparent', color: '#1c4f8a', border: 'none', padding: 0, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", textDecoration: 'underline' }}>
                다시 선택
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
              <div>
                <label style={lbl}>성함 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="홍길동" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>연락처 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="010-0000-0000" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>거주 지역 <span style={{ color: '#e8432d' }}>*</span></label>
              <input style={inp} placeholder="예: 고양시 일산동구" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>봉숭아학당 수료 여부 <span style={{ color: '#e8432d' }}>*</span></label>
              <select style={inp} value={form.qualify} onChange={e => setForm(f => ({ ...f, qualify: e.target.value }))}>
                <option value="해당 없음">해당 없음</option>
                <option value="재학중">재학중</option>
                <option value="봉숭아학당 수료자">봉숭아학당 문화혁신학교 수료자</option>
                <option value="이음평생교육원 수료자">이음평생교육원 시민기자 과정 수료자</option>
                <option value="기자증 갱신">기존 시민기자증 갱신 신청</option>
                <option value="기타">기타 (지원 동기에 기재)</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>지원 동기 (최소 50자) <span style={{ color: '#e8432d' }}>*</span></label>
              <textarea style={{ ...inp, height: 110, resize: 'vertical', lineHeight: 1.7 }}
                placeholder="왜 이음미디어 시민기자로 활동하고 싶으신가요? (50자 이상)"
                value={form.motive} onChange={e => setForm(f => ({ ...f, motive: e.target.value }))} />
              <div style={{ textAlign: 'right', fontSize: 12, fontWeight: 600, marginTop: 4, color: form.motive.trim().length >= 50 ? '#1a6b3c' : '#888' }}>
                {form.motive.trim().length}자{form.motive.trim().length < 50 ? ' (50자 이상 필요)' : ' ✓'}
              </div>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>기사 작성 경험 (선택)</label>
              <textarea style={{ ...inp, height: 80, resize: 'vertical', lineHeight: 1.7 }}
                placeholder="블로그, SNS, 기타 매체에 글을 쓴 경험이 있으면 적어주세요."
                value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
            </div>

            {/* 동의 체크박스 영역 — 미체크 + 제출 시 빨간 강조 */}
            {(() => {
              const showAgreeError = !form.agree && error.includes('개인정보 수집')
              return (
                <div style={{
                  marginBottom: 16,
                  padding: '12px 14px',
                  border: showAgreeError ? '2px solid #dc2626' : '1px solid #e0e0e0',
                  borderRadius: 6,
                  background: showAgreeError ? '#fff5f5' : '#fafafa',
                  transition: 'background 0.2s, border-color 0.2s',
                }}>
                  <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.agree} onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))} style={{ marginTop: 3, flexShrink: 0, width: 18, height: 18, cursor: 'pointer' }} />
                    <span style={{ fontSize: 12.5, color: '#1a1a1a', lineHeight: 1.6, fontWeight: 500 }}>
                      [필수] 개인정보(이름·연락처)를 시민기자 지원 심사 목적으로 수집·이용하는 것에 동의합니다.
                    </span>
                  </label>
                  {showAgreeError && (
                    <div style={{ fontSize: 12, color: '#dc2626', marginTop: 8, marginLeft: 28, fontWeight: 600, lineHeight: 1.5 }}>
                      ⚠ 개인정보 수집·이용 동의가 필요합니다
                    </div>
                  )}
                </div>
              )
            })()}

            {/* 에러 메시지 — 버튼 바로 위 (스크롤 내려 클릭하는 사용자에게 즉시 노출) */}
            {error && (
              <div style={{ background: '#fee2e2', color: '#dc2626', padding: '12px 16px', borderRadius: 6, fontSize: 13, marginBottom: 12, lineHeight: 1.6, whiteSpace: 'pre-wrap', border: '1px solid #fca5a5' }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', background: loading ? '#999' : '#0d2d52', color: 'white', border: 'none', padding: 16, fontSize: 14, fontWeight: 700, cursor: loading ? 'wait' : 'pointer', fontFamily: "'Noto Sans KR',sans-serif", letterSpacing: 0.5 }}>
              {loading ? '처리 중...' : '✍️ 시민기자 신청하기'}
            </button>
          </div>
        )}
      </div>

      {/* ── FAQ ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, fontWeight: 700, color: '#0d2d52', marginBottom: 20, paddingBottom: 10, borderBottom: '2px solid #0d2d52' }}>
          자주 묻는 질문
        </div>
        {FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: '1px solid #ebebeb' }}>
            <div onClick={() => setOpenFaq(openFaq === i ? null : i)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: openFaq === i ? '#1c4f8a' : '#1a1a1a' }}>
              <span>Q. {item.q}</span>
              <span style={{ fontSize: 18, color: '#9a9a9a', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', flexShrink: 0 }}>+</span>
            </div>
            {openFaq === i && (
              <div style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.8, paddingBottom: 16 }}>{item.a}</div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

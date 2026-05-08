import { useState } from 'react'

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
  const [form, setForm] = useState({
    name: '', phone: '', email: '', region: '',
    qualify: '', motivation: '', experience: '', agree: false,
  })
  const [stage, setStage] = useState('form')
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubmit = () => {
    if (!form.name || !form.phone || !form.email || !form.qualify) {
      alert('필수 항목(*)을 모두 입력해주세요.')
      return
    }
    if (!form.agree) { alert('개인정보 수집·이용에 동의해주세요.'); return }
    const subject = `[시민기자 지원] ${form.name} — ${form.qualify}`
    const body = `[시민기자 지원서]\n\n성함: ${form.name}\n연락처: ${form.phone}\n이메일: ${form.email}\n거주지역: ${form.region || '미입력'}\n지원자격: ${form.qualify}\n\n지원동기:\n${form.motivation || '미입력'}\n\n기사 작성 경험:\n${form.experience || '없음'}`
    window.location.href = `mailto:press@eummedia.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStage('pending')
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

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 0 }}>
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
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

        {/* 지원 폼 */}
        {stage === 'form' ? (
          <div style={{ background: '#f7f8fa', border: '1px solid #e0e0e0', borderTop: '4px solid #0d2d52', padding: '32px' }}>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 20, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>시민기자 지원하기</div>
            <div style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 26, lineHeight: 1.6 }}>
              지원서는 <strong>press@eummedia.kr</strong>로 전달됩니다. 검토 후 3일 내 연락드립니다.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>성함 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="홍길동" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>연락처 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="010-0000-0000" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={lbl}>이메일 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="example@email.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>거주 지역</label>
                <input style={inp} placeholder="예: 고양시 일산동구" value={form.region} onChange={e => setForm(f => ({ ...f, region: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>지원 자격 <span style={{ color: '#e8432d' }}>*</span></label>
              <select style={inp} value={form.qualify} onChange={e => setForm(f => ({ ...f, qualify: e.target.value }))}>
                <option value="">해당하는 자격을 선택해주세요</option>
                <option value="봉숭아학당 수료자">봉숭아학당 문화혁신학교 수료자</option>
                <option value="이음평생교육원 수료자">이음평생교육원 시민기자 과정 수료자</option>
                <option value="기자증 갱신">기존 시민기자증 갱신 신청</option>
                <option value="기타">기타 (내용에 기재)</option>
              </select>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>지원 동기</label>
              <textarea style={{ ...inp, height: 100, resize: 'none', lineHeight: 1.7 }}
                placeholder="시민기자에 지원하는 동기와 관심 분야를 적어주세요."
                value={form.motivation} onChange={e => setForm(f => ({ ...f, motivation: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>기사 작성 경험 (선택)</label>
              <textarea style={{ ...inp, height: 80, resize: 'none', lineHeight: 1.7 }}
                placeholder="블로그, SNS, 기타 매체에 글을 쓴 경험이 있으면 적어주세요."
                value={form.experience} onChange={e => setForm(f => ({ ...f, experience: e.target.value }))} />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 22 }}>
              <input type="checkbox" checked={form.agree} onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                [필수] 개인정보(이름·연락처·이메일)를 시민기자 지원 심사 목적으로 수집·이용하는 것에 동의합니다. 수집된 정보는 심사 완료 후 파기됩니다.
              </span>
            </label>

            <button onClick={handleSubmit}
              style={{ width: '100%', background: '#0d2d52', color: 'white', border: 'none', padding: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", letterSpacing: 0.5 }}>
              ✍️ 시민기자 지원서 제출 → press@eummedia.kr
            </button>
          </div>
        ) : stage === 'pending' ? (
          <div style={{ background: '#fff7ed', border: '1px solid #fdba74', padding: '52px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✉️</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#9a3412', marginBottom: 12 }}>메일 앱이 열렸어요</div>
            <div style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.85, marginBottom: 24 }}>
              <strong>press@eummedia.kr</strong>로 보낼 지원서가 자동 입력되었습니다.<br />
              메일을 발송하신 뒤 아래 버튼을 눌러주세요.<br />
              <span style={{ fontSize: 12, color: '#9a3412', display: 'inline-block', marginTop: 10 }}>
                ※ 메일 앱이 열리지 않았다면 press@eummedia.kr로 직접 보내주셔도 됩니다.
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setStage('submitted')}
                style={{ background: '#0d2d52', color: 'white', border: 'none', padding: '16px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", minWidth: 280 }}>
                ✅ 메일을 발송했어요
              </button>
              <button onClick={() => setStage('form')}
                style={{ background: 'transparent', color: '#6b6b6b', border: '1px solid #d0d0d0', padding: '12px 24px', fontSize: 13, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", minWidth: 280 }}>
                ← 폼으로 돌아가기
              </button>
            </div>
          </div>
        ) : (
          <div style={{ background: '#e8f7ee', border: '1px solid #27ae60', padding: '52px 32px', textAlign: 'center' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#1a7a3f', marginBottom: 10 }}>지원서가 접수되었습니다!</div>
            <div style={{ fontSize: 13, color: '#2a5a3a', lineHeight: 1.8, marginBottom: 28 }}>
              <strong>press@eummedia.kr</strong>로 전달되었습니다.<br />
              검토 후 3일 내 편집국장이 직접 연락드립니다.
            </div>
            <button onClick={() => setStage('form')}
              style={{ background: '#0d2d52', color: 'white', border: 'none', padding: '12px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif" }}>
              다시 지원하기
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

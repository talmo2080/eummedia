import { useState } from 'react'

const REPORT_TYPES = [
  { icon: '🏙️', title: '지역 이슈', desc: '고양시·일산의 불합리한 현실, 민원 해결이 필요한 이야기' },
  { icon: '💡', title: '감동 스토리', desc: '이웃의 선행, 숨은 영웅, 알려야 할 따뜻한 사연' },
  { icon: '⚠️', title: '제보·고발', desc: '부당함을 알리고 싶은 사건·사고, 공익적 제보' },
  { icon: '🎓', title: '교육·문화', desc: '학교, 교육 현장, 지역 문화·예술 이야기' },
  { icon: '💼', title: '비즈니스', desc: '지역 소상공인, 창업, 기업 이야기' },
  { icon: '🌱', title: '환경·복지', desc: '환경 문제, 복지 사각지대, 공동체 이야기' },
]

const inp = {
  width: '100%', padding: '11px 14px', border: '1px solid #d0d0d0',
  fontSize: 13, fontFamily: "'Noto Sans KR',sans-serif",
  outline: 'none', color: '#1a1a1a', background: 'white', boxSizing: 'border-box',
}
const lbl = { fontSize: 12, fontWeight: 700, color: '#3a3a3a', marginBottom: 6, display: 'block' }

export default function Report() {
  const [form, setForm] = useState({
    type: '', title: '', content: '', name: '', phone: '', email: '', agree: false,
  })
  const [stage, setStage] = useState('form')
  const [selectedType, setSelectedType] = useState('')

  const handleSubmit = () => {
    if (!form.title || !form.content) {
      alert('제목과 제보 내용을 입력해주세요.')
      return
    }
    if (!form.agree) { alert('개인정보 수집·이용에 동의해주세요.'); return }
    const subject = `[제보] ${form.type ? `[${form.type}] ` : ''}${form.title}`
    const body = `[제보하기]\n\n제보 유형: ${form.type || '미선택'}\n제목: ${form.title}\n제보자: ${form.name || '익명'}\n연락처: ${form.phone || '미제공'}\n이메일: ${form.email || '미제공'}\n\n제보 내용:\n${form.content}`
    window.location.href = `mailto:press@eummedia.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStage('pending')
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Noto Sans KR',sans-serif" }}>

      {/* ── 히어로 ── */}
      <div style={{ background: 'linear-gradient(135deg,#1c4f8a 0%,#0d2d52 100%)', padding: '64px 0 52px', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📬</div>
          <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 36, fontWeight: 700, lineHeight: 1.4, marginBottom: 14, letterSpacing: -1 }}>
            당신의 제보가<br /><em style={{ color: '#f0a882', fontStyle: 'normal' }}>뉴스</em>가 됩니다
          </h1>
          <p style={{ fontSize: 15, opacity: 0.75, lineHeight: 1.85, fontWeight: 300, marginBottom: 28 }}>
            지역의 이야기, 불합리한 현실, 감동적인 사연을 알려주세요.<br />
            이음미디어 시민기자가 직접 취재합니다.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 24, flexWrap: 'wrap' }}>
            {[
              { icon: '🔒', text: '제보자 정보 철저 보호' },
              { icon: '👤', text: '익명 제보 가능' },
              { icon: '⚡', text: '24시간 내 검토' },
            ].map(b => (
              <div key={b.text} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, opacity: 0.85 }}>
                <span>{b.icon}</span><span>{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 제보 유형 선택 ── */}
      <div style={{ background: '#f7f8fa', borderBottom: '1px solid #e0e0e0', padding: '48px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ fontSize: 10, color: '#1c4f8a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>REPORT CATEGORY</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 20, fontWeight: 700, color: '#0d2d52' }}>어떤 이야기를 제보하고 싶으신가요?</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
            {REPORT_TYPES.map(type => (
              <div key={type.title}
                onClick={() => { setSelectedType(type.title); setForm(f => ({ ...f, type: type.title })) }}
                style={{
                  border: `2px solid ${selectedType === type.title ? '#1c4f8a' : '#e0e0e0'}`,
                  padding: '20px 16px', cursor: 'pointer', textAlign: 'center',
                  background: selectedType === type.title ? '#f0f4fa' : 'white', transition: 'all 0.2s',
                }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{type.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0d2d52', marginBottom: 4 }}>{type.title}</div>
                <div style={{ fontSize: 11, color: '#6b6b6b', lineHeight: 1.6 }}>{type.desc}</div>
                {selectedType === type.title && <div style={{ marginTop: 8, fontSize: 11, fontWeight: 700, color: '#1c4f8a' }}>✅ 선택됨</div>}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 제보 폼 ── */}
      {stage === 'form' ? (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px' }}>

          {/* 제보자 보호 안내 */}
          <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderLeft: '4px solid #1c4f8a', padding: '16px 20px', marginBottom: 28, display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 20, flexShrink: 0 }}>🔒</span>
            <div style={{ fontSize: 13, color: '#1e3a5f', lineHeight: 1.7 }}>
              <strong>제보자 정보는 철저히 보호됩니다.</strong><br />
              이름·연락처는 선택사항입니다. 익명으로도 제보 가능하며, 제보자 정보는 절대 외부에 공개되지 않습니다.
            </div>
          </div>

          <div style={{ background: '#f7f8fa', border: '1px solid #e0e0e0', borderTop: '4px solid #1c4f8a', padding: '36px' }}>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>제보하기</div>
            <div style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 28, lineHeight: 1.6 }}>
              제보 내용은 <strong>press@eummedia.kr</strong>로 전달됩니다.
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>제보 제목 <span style={{ color: '#e8432d' }}>*</span></label>
              <input style={inp} placeholder="제보 내용을 한 줄로 요약해주세요"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>제보 유형</label>
              <select style={inp} value={form.type} onChange={e => { setForm(f => ({ ...f, type: e.target.value })); setSelectedType(e.target.value) }}>
                <option value="">유형 선택 (선택사항)</option>
                {REPORT_TYPES.map(t => <option key={t.title} value={t.title}>{t.icon} {t.title}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>제보 내용 <span style={{ color: '#e8432d' }}>*</span></label>
              <textarea style={{ ...inp, height: 160, resize: 'none', lineHeight: 1.7 }}
                placeholder="언제, 어디서, 무슨 일이 있었는지 자세히 알려주세요.&#10;관련 사진이나 자료가 있으시면 이메일(press@eummedia.kr)로 별도 첨부해 주세요."
                value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </div>

            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 16px', marginBottom: 18, fontSize: 12, color: '#78350f', lineHeight: 1.7 }}>
              📌 아래 연락처는 <strong>선택사항</strong>입니다. 익명 제보도 받습니다.<br />
              취재 후 추가 확인이 필요한 경우 연락처가 있으면 더 빠르게 진행됩니다.
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 22 }}>
              <div>
                <label style={lbl}>성함 (선택)</label>
                <input style={inp} placeholder="익명 가능" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>연락처 (선택)</label>
                <input style={inp} placeholder="010-0000-0000" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>이메일 (선택)</label>
                <input style={inp} placeholder="example@email.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 22 }}>
              <input type="checkbox" checked={form.agree} onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                [필수] 제보 처리 목적으로 입력 정보를 수집·이용하는 것에 동의합니다. 제보자 정보는 외부에 공개되지 않으며, 처리 완료 후 파기됩니다.
              </span>
            </label>

            <button onClick={handleSubmit}
              style={{ width: '100%', background: '#1c4f8a', color: 'white', border: 'none', padding: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", letterSpacing: 0.5 }}>
              📬 제보 보내기 → press@eummedia.kr
            </button>
          </div>

          {/* 직접 이메일 */}
          <div style={{ marginTop: 14, border: '1px solid #e0e0e0', padding: '18px 22px', display: 'flex', gap: 14, alignItems: 'center' }}>
            <span style={{ fontSize: 26 }}>✉️</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#0d2d52', marginBottom: 2 }}>사진·영상 등 자료 첨부는 이메일로 직접 보내주세요</div>
              <a href="mailto:press@eummedia.kr" style={{ fontSize: 13, color: '#1c4f8a', fontWeight: 700, textDecoration: 'none' }}>press@eummedia.kr</a>
            </div>
          </div>
        </div>
      ) : stage === 'pending' ? (
        <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ background: '#fff7ed', border: '1px solid #fdba74', padding: '52px 32px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✉️</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#9a3412', marginBottom: 12 }}>메일 앱이 열렸어요</div>
            <div style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.85, marginBottom: 24 }}>
              <strong>press@eummedia.kr</strong>로 보낼 제보 메일이 자동 입력되었습니다.<br />
              메일을 발송하신 뒤 아래 버튼을 눌러주세요.<br />
              <span style={{ fontSize: 12, color: '#9a3412', display: 'inline-block', marginTop: 10 }}>
                ※ 메일 앱이 열리지 않았다면 press@eummedia.kr로 직접 보내주셔도 됩니다.
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setStage('submitted')}
                style={{ background: '#1c4f8a', color: 'white', border: 'none', padding: '16px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", minWidth: 280 }}>
                ✅ 메일을 발송했어요
              </button>
              <button onClick={() => setStage('form')}
                style={{ background: 'transparent', color: '#6b6b6b', border: '1px solid #d0d0d0', padding: '12px 24px', fontSize: 13, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", minWidth: 280 }}>
                ← 폼으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ background: '#e8f7ee', border: '1px solid #27ae60', padding: '52px 32px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#1a7a3f', marginBottom: 10 }}>제보가 접수되었습니다!</div>
            <div style={{ fontSize: 13, color: '#2a5a3a', lineHeight: 1.8, marginBottom: 28 }}>
              소중한 제보 감사합니다.<br />
              <strong>press@eummedia.kr</strong>로 전달되었습니다.<br />
              검토 후 취재가 결정되면 연락드리겠습니다.
            </div>
            <button onClick={() => setStage('form')}
              style={{ background: '#1c4f8a', color: 'white', border: 'none', padding: '12px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif" }}>
              다시 제보하기
            </button>
          </div>
        </div>
      )}

    </div>
  )
}

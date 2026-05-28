import { useState } from 'react'

const AD_PACKAGES = [
  {
    step: 'STEP 1', name: '기사 + 카드뉴스', price: '150,000', icon: '🃏',
    features: ['협찬 기사 작성 (이음미디어 게시)', '카드뉴스 5장 제작', 'SNS 배포용 이미지', '구글·네이버 SEO', 'AI 검색 최적화'],
    color: '#1c4f8a', featured: false,
  },
  {
    step: 'STEP 2', name: '스토리 협찬 기사', price: '250,000', icon: '📰',
    features: ['광고주 스토리 기사', '기사 내 배너 삽입', '구글·네이버 SEO', 'ChatGPT·Perplexity 노출'],
    color: '#e8432d', featured: true,
  },
  {
    step: 'STEP 3', name: '풀패키지', price: '550,000', icon: '🚀',
    features: ['기사 + 카드뉴스', '영상 콘텐츠 포함', '전 채널 동시 노출', '1개월 상단 고정'],
    color: '#0d2d52', featured: false,
  },
]

const FAQ = [
  { q: '광고 기사는 일반 기사와 어떻게 다른가요?', a: '광고 기사는 광고주의 브랜드·서비스 이야기를 기사 형식으로 작성합니다. 하단에 [협찬] 표기가 붙지만 구글·네이버·AI 검색에 일반 기사와 동일하게 노출됩니다.' },
  { q: 'ChatGPT에 실제로 노출되나요?', a: 'ChatGPT, Perplexity 등 AI 검색엔진은 신뢰할 수 있는 언론사 기사를 우선 인용합니다. 이음미디어 기사로 등록된 광고 기사는 AI 검색 결과에 자연스럽게 인용됩니다.' },
  { q: '기사 작성은 누가 하나요?', a: '이음미디어 편집국장(정세연)이 직접 인터뷰 또는 자료를 바탕으로 작성합니다. 초안 검토 후 광고주 확인을 거쳐 게시합니다.' },
  { q: '게시 후 수정이 가능한가요?', a: '게시 후 1회 수정이 포함됩니다. 오탈자, 사실 오류 등은 언제든지 수정 요청 가능합니다.' },
]

const inp = {
  width: '100%', padding: '11px 14px', border: '1px solid #d0d0d0',
  fontSize: 13, fontFamily: "'Noto Sans KR',sans-serif",
  outline: 'none', color: '#1a1a1a', background: 'white', boxSizing: 'border-box',
}
const lbl = { fontSize: 12, fontWeight: 700, color: '#3a3a3a', marginBottom: 6, display: 'block' }

// 광고가 실제로 어떻게 보이는지 — 5종 노출 예시 (public/ad-samples/ 이미지)
const AD_SAMPLES = [
  {
    label: '기사 중간 배너',
    spec: '800 × 120 px',
    desc: '기사 본문 사이에 자연스럽게 삽입\n독자가 기사를 읽다가 자연스럽게 만나는 광고',
    images: ['/ad-samples/banner-sbiz24.png', '/ad-samples/banner-gallery.png'],
    maxWidth: 420,
  },
  {
    label: '사이드바',
    spec: '우측 고정 노출',
    desc: '기사 읽는 동안 항상 오른쪽에 고정\n로고 + 캐치프라이즈 + 예약 버튼 구성',
    images: ['/ad-samples/ad-sidebar.png'],
    maxWidth: 280,
  },
  {
    label: '본문 하단 박스',
    spec: '전폭 카드',
    desc: '기사 아래 카드뉴스 다음에 위치\n큰 면적으로 브랜드 메시지 전달',
    images: ['/ad-samples/ad-box.png'],
    maxWidth: 700,
  },
  {
    label: '영상 갤러리',
    spec: '유튜브 영상 노출',
    desc: '이음보이스 채널 영상 갤러리에 노출\n영상 콘텐츠로 브랜드 스토리 전달',
    images: ['/ad-samples/ad-video.png'],
    maxWidth: 500,
  },
  {
    label: '카드뉴스',
    spec: '슬라이드 5장',
    desc: '4:5 비율 세로형 카드 5장 제작\n홈 메인 + 기사 하단 동시 노출',
    images: ['/ad-samples/ad-cardnews.png'],
    maxWidth: 320,
    link: 'https://www.eummedia.kr/article/article-d13pwd9w',
    linkLabel: '원문 보기 →',
  },
]

export default function Advertise() {
  const [form, setForm] = useState({
    company: '', name: '', phone: '', email: '', package: 'STEP 2', message: '', agree: false,
  })
  const [selectedPkg, setSelectedPkg] = useState('STEP 2')
  const [stage, setStage] = useState('form')
  const [openFaq, setOpenFaq] = useState(null)

  const handleSubmit = () => {
    if (!form.company || !form.name || !form.phone || !form.email) {
      alert('필수 항목(*)을 모두 입력해주세요.')
      return
    }
    if (!form.agree) { alert('개인정보 수집·이용에 동의해주세요.'); return }
    const subject = `[광고문의] ${form.package} - ${form.company}`
    const body = `[광고 문의]\n\n회사명·브랜드명: ${form.company}\n담당자: ${form.name}\n연락처: ${form.phone}\n이메일: ${form.email}\n광고 상품: ${form.package}\n\n문의 내용:\n${form.message || '(내용 없음)'}`
    window.location.href = `mailto:press@eummedia.kr?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    setStage('pending')
  }

  return (
    <div style={{ background: '#fff', minHeight: '100vh', fontFamily: "'Noto Sans KR',sans-serif" }}>

      {/* ── 히어로 ── */}
      <div style={{ background: 'linear-gradient(135deg,#0d2d52 0%,#1c4f8a 100%)', padding: '64px 0 52px', color: 'white', textAlign: 'center' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>📢</div>
          <h1 style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 36, fontWeight: 700, lineHeight: 1.4, marginBottom: 14, letterSpacing: -1 }}>
            광고가 아닌<br /><em style={{ color: '#f0a882', fontStyle: 'normal' }}>당신의 이야기</em>를 싣습니다
          </h1>
          <p style={{ fontSize: 15, opacity: 0.75, lineHeight: 1.85, fontWeight: 300, marginBottom: 28 }}>
            이음미디어는 광고주를 기사의 주인공으로 만듭니다.<br />
            구글·네이버·ChatGPT 검색에서 동시에 노출됩니다.
          </p>
          <div style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', padding: '18px 24px', fontSize: 14, lineHeight: 1.8 }}>
            <strong style={{ color: '#f0a882' }}>"배너 광고는 클릭되지 않습니다.</strong> 하지만 기사는 검색되고, 읽히고, 공유됩니다.<br />
            이음미디어의 광고는 <strong style={{ color: '#f0a882' }}>영원히 남는 콘텐츠</strong>입니다."
          </div>
        </div>
      </div>

      {/* ── 광고 흐름 ── */}
      <div style={{ background: '#f7f8fa', borderBottom: '1px solid #e0e0e0', padding: '52px 0' }}>
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 10, color: '#1c4f8a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>HOW IT WORKS</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#0d2d52' }}>광고 기사 제작 과정</div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {[
              { icon: '📞', title: '문의 접수', desc: '광고 상품 선택 후 문의 폼 제출' },
              { icon: '🤝', title: '미팅·인터뷰', desc: '편집국장과 상담 후 내용 확정' },
              { icon: '✍️', title: '기사 작성', desc: '전문 기자가 스토리 기사 작성' },
              { icon: '🚀', title: '게시·배포', desc: '전 채널 동시 발행' },
              { icon: '🤖', title: 'AI·SEO 노출', desc: '구글·네이버·ChatGPT·Perplexity 최적화' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '24px 16px', background: 'white', border: '1px solid #e0e0e0', borderLeft: i > 0 ? 'none' : '1px solid #e0e0e0', position: 'relative' }}>
                {i < 4 && <div style={{ position: 'absolute', right: -14, top: '50%', transform: 'translateY(-50%)', fontSize: 20, color: '#c0c8d4', zIndex: 1 }}>→</div>}
                <div style={{ fontSize: 32, marginBottom: 10 }}>{s.icon}</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0d2d52', marginBottom: 4 }}>{s.title}</div>
                <div style={{ fontSize: 11, color: '#6b6b6b', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 광고 기사 예시 ── */}
      <div style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 10, color: '#1c4f8a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>SAMPLE</div>
          <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 20, fontWeight: 700, color: '#0d2d52' }}>광고 기사 예시</div>
        </div>
        <div style={{ border: '1px solid #e0e0e0', borderTop: '3px solid #1c4f8a', overflow: 'hidden' }}>
          <div style={{ background: '#f0f0f0', padding: '8px 16px', fontSize: 11, color: '#888', display: 'flex', justifyContent: 'space-between' }}>
            <span>eummedia.kr/article/1234</span><span>[협찬]</span>
          </div>
          <div style={{ padding: '24px' }}>
            <div style={{ fontSize: 10, color: '#1c4f8a', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8 }}>이음로컬</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 18, fontWeight: 700, color: '#0d2d52', marginBottom: 8, lineHeight: 1.5 }}>
              "27년 경력 두피 전문가가 말하는 탈모의 진짜 원인"
            </div>
            <div style={{ fontSize: 13, color: '#555', lineHeight: 1.8, marginBottom: 14 }}>
              일산 닥터리부트 두피관리센터 정세연 원장은 "탈모는 단순히 유전이 아니라 두피 환경의 문제"라고 강조한다. 27년간 수천 명의 두피를 관리해온 그가 말하는 탈모 예방법은...
            </div>
            <div style={{ background: 'linear-gradient(90deg,#eef4fb,#ddeaf8)', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderLeft: '4px solid #1c4f8a', marginBottom: 6 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0d2d52' }}>닥터리부트 두피관리센터</div>
                <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>일산 | 두피·탈모 전문 27년 · 031-000-0000</div>
              </div>
              <button style={{ background: '#0d2d52', color: 'white', border: 'none', padding: '8px 16px', fontSize: 11, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'Noto Sans KR',sans-serif" }}>상담 예약</button>
            </div>
            <div style={{ fontSize: 9, color: '#bbb', textAlign: 'right' }}>※ 본 기사는 광고주의 협찬으로 제작되었습니다</div>
          </div>
        </div>
      </div>

      {/* ── 광고 5종 실제 노출 예시 ── */}
      <div style={{ background: '#f8f7f4', padding: '52px 0', marginTop: 0 }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{ fontSize: 10, color: '#1c4f8a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>WHERE &amp; HOW</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#0d2d52' }}>
              📍 광고가 실제로 이렇게 보입니다
            </div>
            <div style={{ fontSize: 13, color: '#6b6b6b', marginTop: 6 }}>이음미디어 독자가 보는 그대로입니다</div>
          </div>

          {AD_SAMPLES.map((sample, idx) => (
            <div key={idx} style={{
              background: 'white', border: '1px solid #e0e0e0',
              padding: '24px', marginBottom: 20,
            }}>
              {/* 라벨 배지 + spec */}
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap' }}>
                <span style={{
                  background: '#0d2d52', color: 'white',
                  fontSize: 11, fontWeight: 700, padding: '4px 12px', letterSpacing: 0.5,
                }}>[ {sample.label} ]</span>
                <span style={{ fontSize: 12, color: '#888', fontWeight: 600 }}>{sample.spec}</span>
              </div>

              {/* 설명 */}
              <div style={{ fontSize: 13, color: '#555', lineHeight: 1.7, marginBottom: 18, whiteSpace: 'pre-line' }}>
                {sample.desc}
              </div>

              {/* 예시 이미지 1~2개 */}
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', alignItems: 'flex-start' }}>
                {sample.images.map((src, i) => (
                  <div key={i} style={{
                    maxWidth: sample.maxWidth, width: '100%',
                    border: '1px solid #d0d0d0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                    padding: 4, background: '#fafaf7',
                  }}>
                    <img src={src} alt={`${sample.label} 예시 ${i+1}`}
                      style={{ width: '100%', height: 'auto', display: 'block' }}
                      onError={e => { e.currentTarget.style.display = 'none' }} />
                  </div>
                ))}
              </div>

              {/* 원문 보기 버튼 (link 있는 카드만, 예: 카드뉴스) */}
              {sample.link && (
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                  <a href={sample.link} target="_blank" rel="noopener noreferrer"
                    style={{
                      display: 'inline-block', padding: '8px 18px',
                      fontSize: 13, fontWeight: 700, color: '#0d2d52',
                      border: '1.5px solid #0d2d52', borderRadius: 4,
                      textDecoration: 'none', fontFamily: "'Noto Sans KR',sans-serif",
                    }}>
                    {sample.linkLabel || '원문 보기 →'}
                  </a>
                </div>
              )}

              {/* 워터마크 — 실제 화면 예시 */}
              <div style={{ fontSize: 10, color: '#bbb', textAlign: 'right', marginTop: 12, fontStyle: 'italic' }}>
                ※ 실제 화면 예시
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 광고 패키지 ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '52px 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 10, color: '#1c4f8a', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>ADVERTISEMENT PACKAGE</div>
          <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>3단계 광고 패키지</div>
          <div style={{ fontSize: 13, color: '#6b6b6b' }}>광고주 이야기를 기사로 작성해 AI·검색엔진에 동시 노출합니다</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: 36 }}>
          {AD_PACKAGES.map(pkg => (
            <div key={pkg.step}
              onClick={() => { setSelectedPkg(pkg.step); setForm(f => ({ ...f, package: pkg.step })) }}
              style={{ border: `1px solid ${selectedPkg === pkg.step ? pkg.color : '#e0e0e0'}`, borderTop: `4px solid ${pkg.color}`, padding: '24px 20px', cursor: 'pointer', position: 'relative', background: selectedPkg === pkg.step ? '#f7f9ff' : 'white', transition: 'all 0.2s', boxShadow: selectedPkg === pkg.step ? `0 4px 16px rgba(0,0,0,0.08)` : 'none' }}>
              {pkg.featured && <div style={{ position: 'absolute', top: -1, right: 16, background: '#e8432d', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 10px' }}>추천</div>}
              <div style={{ fontSize: 10, color: pkg.color, fontWeight: 700, letterSpacing: 1.5, marginBottom: 8 }}>{pkg.step}</div>
              <div style={{ fontSize: 28, marginBottom: 10 }}>{pkg.icon}</div>
              <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 16, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>{pkg.name}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: pkg.color, marginBottom: 2 }}>₩{pkg.price}</div>
              <div style={{ fontSize: 11, color: '#9a9a9a', marginBottom: 16 }}>1회 기준</div>
              <ul style={{ listStyle: 'none', padding: 0, marginBottom: 16 }}>
                {pkg.features.map(f => (
                  <li key={f} style={{ fontSize: 12, color: '#555', padding: '5px 0', borderBottom: '1px solid #f5f5f5', display: 'flex', gap: 8 }}>
                    <span style={{ color: pkg.color, fontWeight: 700, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
              </ul>
              <div style={{ textAlign: 'center', padding: '10px', background: selectedPkg === pkg.step ? pkg.color : '#f5f5f5', color: selectedPkg === pkg.step ? 'white' : '#888', fontSize: 12, fontWeight: 700, transition: 'all 0.2s' }}>
                {selectedPkg === pkg.step ? '✅ 선택됨' : '선택하기'}
              </div>
            </div>
          ))}
        </div>

        {/* AI 강점 배너 */}
        <div style={{ background: 'linear-gradient(135deg,#0d2d52,#1c4f8a)', color: 'white', padding: '24px 28px', marginBottom: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, opacity: 0.7, marginBottom: 8, letterSpacing: 1 }}>🤖 AI 검색 시대의 광고 전략</div>
          <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 16, fontWeight: 700, marginBottom: 12, lineHeight: 1.6 }}>
            ChatGPT·Perplexity가 당신의 브랜드를 추천합니다
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['✅ 구글 상위 노출', '✅ 네이버 최적화', '✅ ChatGPT 인용', '✅ Perplexity 노출', '✅ 영구 보존'].map(t => (
              <span key={t} style={{ background: 'rgba(255,255,255,0.15)', padding: '6px 14px', fontSize: 12 }}>{t}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 독자 통계 ── */}
      <div style={{ background: '#0d2d52', color: 'white', padding: '36px 0' }}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4" style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>
          {[
            { num: '39건', label: '발행 기사' },
            { num: '7개', label: '콘텐츠 채널' },
            { num: '모집 중', label: '시민기자' },
            { num: '40~70대', label: '주요 독자층' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center', padding: '0 20px', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
              <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 30, fontWeight: 700, color: '#f0a882', marginBottom: 4 }}>{s.num}</div>
              <div style={{ fontSize: 11, opacity: 0.65 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 문의 폼 ── */}
      {stage === 'form' ? (
        <div style={{ maxWidth: 760, margin: '0 auto', padding: '52px 24px' }}>
          <div style={{ background: '#f7f8fa', border: '1px solid #e0e0e0', borderTop: '4px solid #0d2d52', padding: '36px' }}>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#0d2d52', marginBottom: 6 }}>광고 문의하기</div>
            <div style={{ fontSize: 12, color: '#6b6b6b', marginBottom: 28, lineHeight: 1.6 }}>
              문의 내용은 <strong>press@eummedia.kr</strong>로 전달됩니다. 24시간 내 편집국장이 직접 연락드립니다.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
              <div>
                <label style={lbl}>회사명·브랜드명 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="예: 닥터리부트 두피관리센터" value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>담당자 성함 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="홍길동" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" style={{ marginBottom: 14 }}>
              <div>
                <label style={lbl}>연락처 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="010-0000-0000" type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label style={lbl}>이메일 <span style={{ color: '#e8432d' }}>*</span></label>
                <input style={inp} placeholder="example@email.com" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
              </div>
            </div>

            <div style={{ marginBottom: 14 }}>
              <label style={lbl}>광고 상품 선택</label>
              <select style={inp} value={form.package} onChange={e => { setForm(f => ({ ...f, package: e.target.value })); setSelectedPkg(e.target.value) }}>
                <option value="STEP 1">STEP 1 — 카드뉴스 (150,000원)</option>
                <option value="STEP 2">STEP 2 — 스토리 협찬 기사 (250,000원)</option>
                <option value="STEP 3">STEP 3 — 풀패키지 (550,000원)</option>
                <option value="미정">미정 / 상담 후 결정</option>
              </select>
            </div>

            <div style={{ marginBottom: 22 }}>
              <label style={lbl}>문의 내용</label>
              <textarea style={{ ...inp, height: 110, resize: 'none', lineHeight: 1.7 }}
                placeholder="광고하고 싶은 내용, 일정, 예산, 기타 문의사항을 자유롭게 적어주세요."
                value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} />
            </div>

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', marginBottom: 22 }}>
              <input type="checkbox" checked={form.agree} onChange={e => setForm(f => ({ ...f, agree: e.target.checked }))} style={{ marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#555', lineHeight: 1.6 }}>
                [필수] 개인정보(이름·연락처·이메일)를 광고 문의 답변 목적으로 수집·이용하는 것에 동의합니다. 수집된 정보는 답변 완료 후 즉시 파기됩니다.
              </span>
            </label>

            <button onClick={handleSubmit}
              style={{ width: '100%', background: '#0d2d52', color: 'white', border: 'none', padding: 16, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif", letterSpacing: 0.5, transition: 'background 0.2s' }}>
              📩 광고 문의 보내기 → press@eummedia.kr
            </button>
          </div>

          {/* 직접 연락 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
            <a href="mailto:press@eummedia.kr" style={{ border: '1px solid #e0e0e0', padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center', textDecoration: 'none' }}>
              <span style={{ fontSize: 26 }}>✉️</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d2d52', marginBottom: 2 }}>이메일 직접 문의</div>
                <div style={{ fontSize: 11, color: '#6b6b6b' }}>press@eummedia.kr</div>
              </div>
            </a>
            <div style={{ border: '1px solid #e0e0e0', padding: '18px 20px', display: 'flex', gap: 14, alignItems: 'center' }}>
              <span style={{ fontSize: 26 }}>👩‍💼</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0d2d52', marginBottom: 2 }}>담당자</div>
                <div style={{ fontSize: 11, color: '#6b6b6b' }}>편집국장 정세연</div>
              </div>
            </div>
          </div>
        </div>
      ) : stage === 'pending' ? (
        <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ background: '#fff7ed', border: '1px solid #fdba74', padding: '52px 32px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✉️</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#9a3412', marginBottom: 12 }}>메일 앱이 열렸어요</div>
            <div style={{ fontSize: 14, color: '#7c2d12', lineHeight: 1.85, marginBottom: 24 }}>
              <strong>press@eummedia.kr</strong>로 보낼 메일이 자동 입력되었습니다.<br />
              메일을 발송하신 뒤 아래 버튼을 눌러주세요.<br />
              <span style={{ fontSize: 12, color: '#9a3412', display: 'inline-block', marginTop: 10 }}>
                ※ 메일 앱이 열리지 않았다면 press@eummedia.kr로 직접 보내주셔도 됩니다.
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
              <button onClick={() => setStage('submitted')}
                className="w-full md:w-auto"
                style={{ background: '#0d2d52', color: 'white', border: 'none', padding: '16px 36px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif" }}>
                ✅ 메일을 발송했어요
              </button>
              <button onClick={() => setStage('form')}
                className="w-full md:w-auto"
                style={{ background: 'transparent', color: '#6b6b6b', border: '1px solid #d0d0d0', padding: '12px 24px', fontSize: 13, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif" }}>
                ← 폼으로 돌아가기
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: 680, margin: '60px auto', padding: '0 24px', textAlign: 'center' }}>
          <div style={{ background: '#e8f7ee', border: '1px solid #27ae60', padding: '52px 32px' }}>
            <div style={{ fontSize: 52, marginBottom: 14 }}>✅</div>
            <div style={{ fontFamily: "'Noto Serif KR',serif", fontSize: 22, fontWeight: 700, color: '#1a7a3f', marginBottom: 10 }}>광고 문의가 접수되었습니다!</div>
            <div style={{ fontSize: 13, color: '#2a5a3a', lineHeight: 1.8, marginBottom: 28 }}>
              <strong>press@eummedia.kr</strong>로 전달되었습니다.<br />
              24시간 내 편집국장 정세연이 직접 연락드립니다.
            </div>
            <button onClick={() => setStage('form')}
              style={{ background: '#0d2d52', color: 'white', border: 'none', padding: '12px 32px', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Noto Sans KR',sans-serif" }}>
              다시 문의하기
            </button>
          </div>
        </div>
      )}

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
              <span style={{ fontSize: 18, color: '#9a9a9a', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none' }}>+</span>
            </div>
            {openFaq === i && (
              <div style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.8, paddingBottom: 16 }}>
                {item.a}
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  )
}

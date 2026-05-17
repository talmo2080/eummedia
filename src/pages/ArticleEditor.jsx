import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const RED = '#c0392b'
const GREEN = '#1a6b3c'
const ORANGE = '#c45c0a'
const PURPLE = '#5c2d8a'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

const CHANNELS = [
  '이음매거진', '이음피플', '이음로컬',
  '이음에듀', '이음트렌드', '이음보이스', '이음뷰',
]

const GUIDE_CARDS = [
  {
    icon: '🔍',
    title: '제목이 검색을 결정합니다',
    bg: '#eef3fa',
    border: NAVY,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong style={{ color: RED }}>❌ 나쁜 예:</strong> "고양시에서 열린 행사"
        </p>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong style={{ color: GREEN }}>✅ 좋은 예:</strong> "고양시 일산 5월 도예 전시회, 무료 입장 가능"
        </p>
        <p style={{ margin: '0 0 8px 0' }}>→ 지역명 + 핵심단어 + 구체적 정보를 제목 앞쪽에!</p>
        <p style={{ margin: 0 }}>→ 30자 이내가 검색에서 잘리지 않아요.</p>
      </>
    ),
  },
  {
    icon: '✍️',
    title: '첫 문단이 가장 중요합니다',
    bg: '#eef7f2',
    border: GREEN,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>AI와 검색엔진은 첫 문단에서 기사 핵심을 파악해요.</p>
        <p style={{ margin: '0 0 12px 0' }}>다섯 가지를 첫 문단에 담으세요:</p>
        <p style={{ margin: 0, fontWeight: 600 }}>
          누가(Who) · 언제(When) · 어디서(Where) · 무엇을(What) · 왜(Why)
        </p>
      </>
    ),
  },
  {
    icon: '🏷️',
    title: '태그는 독자를 불러오는 문입니다',
    bg: '#fef6ee',
    border: ORANGE,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>태그 없이 발행 = 아무도 못 찾아요.</p>
        <p style={{ margin: '0 0 12px 0' }}>
          <strong>좋은 태그 예시:</strong> #고양시 #일산 #도예전시 #무료전시 #5월행사
        </p>
        <p style={{ margin: 0 }}>→ 지역명 필수 + 주제 키워드 3개 이상!</p>
      </>
    ),
  },
  {
    icon: '📸',
    title: '사진 한 장이 클릭을 만듭니다',
    bg: '#f4eefc',
    border: PURPLE,
    body: (
      <>
        <p style={{ margin: '0 0 12px 0' }}>대표 이미지 없으면 기사 목록에서 눈에 띄지 않아요.</p>
        <p style={{ margin: '0 0 12px 0' }}>
          사진 설명(alt텍스트)에도 키워드를 넣으면 구글 이미지 검색에서도 노출돼요.
        </p>
        <p style={{ margin: 0 }}>
          <strong>예:</strong> "고양시 닥터리부트 두피케어 체험 행사"
        </p>
      </>
    ),
  },
]

const CHECK_DESC = {
  // 1단계 기사 기본 구조
  titleClear: '제목만 봐도 무슨 기사인지 단번에 알 수 있어야 합니다. 너무 길면 검색 화면에서 잘려 나갑니다.',
  leadParagraph: '누가, 언제, 어디서, 무엇을, 왜 했는지 첫 문단(3줄 이내)에 요약하세요. AI는 첫 문단에서 기사의 정체성을 파악합니다.',
  thumbnail: '기사 목록에 보일 이미지를 반드시 설정해야 합니다. 사진이 없으면 포털 검색 결과에서 외면당합니다.',
  contentLength: '텍스트가 너무 짧으면 구글과 네이버 검색 엔진이 \'정보가 부실한 글\'로 분류하여 노출을 제한합니다.',
  spelling: '포털 맞춤법 검사기를 활용해 문장을 다듬어 주세요. 오탈자가 없는 글이 이음미디어의 신뢰도를 만듭니다.',
  // 2단계 AI·검색 최적화
  channelCorrect: '이음피플, 이음로컬 등 기사 성격에 맞는 채널을 올바르게 선택해야 타겟 독자에게 정확히 배달됩니다.',
  tags: '지역명, 업체명, 핵심 주제(예: 고양시, 파크골프, 우울증 극복 등)를 태그로 입력해야 검색 연동이 시작됩니다.',
  titleKeyword: 'AI 검색은 제목 앞쪽에 키워드가 있는 글을 신뢰합니다. 가장 중요한 단어를 제목 맨 앞에 넣으세요.',
  summary: '기사 핵심을 80자 이내로 요약해 넣으세요. AI가 답변 출처를 긁어갈 때 최우선으로 읽는 영역입니다.',
  alt: '사진 설명란에 키워드를 넣어주세요. (예: "태리TV 유튜버 윤진희 이사 인터뷰 현장") 로봇이 사진을 텍스트로 인식하게 돕습니다.',
  // 3단계 최종 발행 준비
  fact: '기사에 사용된 날짜, 장소, 금액, 연도 등의 숫자가 정확한지 메모와 대조해 다시 확인합니다.',
  source: '인터뷰 대상자의 이름 오자는 언론사로서 가장 큰 실수입니다. 명함이나 녹취를 통해 한 번 더 확인하세요.',
  kakao: '발행 즉시 독자들에게 전송할 호기심 자극용 한 줄 카피와 기사 링크를 미리 작성해 둡니다.',
  instagram: '#이음미디어를 포함해 독자들이 인스타에서 검색할 법한 관련 해시태그를 5개 이상 조합해 둡니다.',
  editorReview: '이음미디어의 모든 기사는 발행 전 편집국장(정세연)에게 초안을 전송하고, 최종 확인을 거친 후 세상에 나갑니다.',
}

const inp = (extra = {}) => ({
  width: '100%',
  padding: '14px 16px',
  border: '1px solid #d0d0d0',
  borderRadius: 8,
  fontSize: 18,
  fontFamily: SANS,
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
  lineHeight: 1.5,
  ...extra,
})

const lbl = {
  display: 'block',
  fontSize: 20,
  fontWeight: 700,
  color: NAVY,
  marginBottom: 12,
  lineHeight: 1.5,
}

const card = {
  background: '#fff',
  borderRadius: 12,
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  padding: '28px',
  marginBottom: 20,
}

function ProgressBar({ label, current, max, color }) {
  const pct = max > 0 ? (current / max) * 100 : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 16, fontWeight: 600, color: '#3a3a3a', marginBottom: 8,
      }}>
        <span>{label}</span>
        <span>{current}/{max}</span>
      </div>
      <div style={{ background: '#e5e5e5', height: 8, borderRadius: 4, overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          transition: 'width 0.25s ease',
        }} />
      </div>
    </div>
  )
}

function CheckItem({ item, onToggle }) {
  const done = item.done
  return (
    <li
      onClick={() => onToggle(item.mkey)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '18px 20px', marginBottom: 10,
        borderRadius: 10,
        background: done ? '#eef7f2' : '#fff',
        border: `1px solid ${done ? '#c4e4d2' : '#e5e5e5'}`,
        cursor: 'pointer',
        transition: 'all 0.15s',
        minHeight: 64, boxSizing: 'border-box',
      }}>
      <span style={{
        flexShrink: 0, width: 24, height: 24,
        border: `2px solid ${done ? GREEN : '#bbb'}`,
        background: done ? GREEN : '#fff',
        color: '#fff', fontSize: 16, lineHeight: '20px',
        textAlign: 'center', borderRadius: 4, marginTop: 2,
      }}>
        {done ? '✓' : ''}
      </span>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: 18, fontWeight: 600,
          color: done ? GREEN : '#1a1a1a', lineHeight: 1.5,
        }}>
          {item.label}
        </div>
        {item.desc && (
          <div style={{ fontSize: 15, color: '#666', marginTop: 6, lineHeight: 1.6 }}>
            {item.desc}
          </div>
        )}
      </div>
    </li>
  )
}

function formatNow() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function InfoRow({ label, value, last }) {
  return (
    <div style={{
      display: 'flex', padding: '10px 0',
      borderBottom: last ? 'none' : '1px solid #e5e5e5',
      fontSize: 17,
    }}>
      <span style={{ width: 110, color: '#666', fontWeight: 600 }}>{label}</span>
      <span style={{ flex: 1, color: '#1a1a1a' }}>{value}</span>
    </div>
  )
}

export default function ArticleEditor() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState('edit')
  const [savedAt, setSavedAt] = useState('')
  const [activeTab, setActiveTab] = useState(1)
  const [channel, setChannel] = useState('')
  const [title, setTitle] = useState('')
  const [reporter, setReporter] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState([])
  const [summary, setSummary] = useState('')
  const [thumbnailUrl, setThumbnailUrl] = useState('')
  const [imageAlt, setImageAlt] = useState('')
  const [videoUrl, setVideoUrl] = useState('')
  const [content, setContent] = useState('')

  const [manualChecks, setManualChecks] = useState({
    titleClear: false,
    leadParagraph: false,
    thumbnail: false,
    contentLength: false,
    spelling: false,
    channelCorrect: false,
    tags: false,
    titleKeyword: false,
    summary: false,
    alt: false,
    fact: false,
    source: false,
    kakao: false,
    instagram: false,
    editorReview: false,
  })
  const toggleManual = (key) => setManualChecks(c => ({ ...c, [key]: !c[key] }))

  const stage1 = [
    { label: '1. 제목의 명확성 (30자 이내)', done: manualChecks.titleClear, mkey: 'titleClear', desc: CHECK_DESC.titleClear },
    { label: '2. 두괄식 첫 문단 작성', done: manualChecks.leadParagraph, mkey: 'leadParagraph', desc: CHECK_DESC.leadParagraph },
    { label: '3. 대표 이미지(썸네일) 설정', done: manualChecks.thumbnail, mkey: 'thumbnail', desc: CHECK_DESC.thumbnail },
    { label: '4. 본문 분량 확보 (500자 이상)', done: manualChecks.contentLength, mkey: 'contentLength', desc: CHECK_DESC.contentLength },
    { label: '5. 맞춤법 및 오탈자 최종 검사', done: manualChecks.spelling, mkey: 'spelling', desc: CHECK_DESC.spelling },
  ]
  const stage2 = [
    { label: '6. 카테고리(채널)의 정확한 선택 [SEO]', done: manualChecks.channelCorrect, mkey: 'channelCorrect', desc: CHECK_DESC.channelCorrect },
    { label: '7. 태그(키워드) 3개 이상 입력 [SEO]', done: manualChecks.tags, mkey: 'tags', desc: CHECK_DESC.tags },
    { label: '8. 제목 내 핵심 키워드 전면 배치 [AI]', done: manualChecks.titleKeyword, mkey: 'titleKeyword', desc: CHECK_DESC.titleKeyword },
    { label: '9. 메타 설명(기사 한 줄 요약) 입력 [AI]', done: manualChecks.summary, mkey: 'summary', desc: CHECK_DESC.summary },
    { label: '10. 이미지 대체 텍스트(alt 태그) 입력 [SEO]', done: manualChecks.alt, mkey: 'alt', desc: CHECK_DESC.alt },
  ]
  const stage3 = [
    { label: '11. 사실 관계(Fact) 최종 교차 검증', done: manualChecks.fact, mkey: 'fact', desc: CHECK_DESC.fact },
    { label: '12. 취재원 이름 및 직함 확인', done: manualChecks.source, mkey: 'source', desc: CHECK_DESC.source },
    { label: '13. 카카오톡 공유용 단문 메시지 준비', done: manualChecks.kakao, mkey: 'kakao', desc: CHECK_DESC.kakao },
    { label: '14. 인스타그램 홍보용 해시태그 세팅', done: manualChecks.instagram, mkey: 'instagram', desc: CHECK_DESC.instagram },
    { label: '15. 편집국장 최종 승인 완료', done: manualChecks.editorReview, mkey: 'editorReview', desc: CHECK_DESC.editorReview },
  ]

  const allItems = [...stage1, ...stage2, ...stage3]
  const totalDone = allItems.filter(i => i.done).length
  const stage2Done = stage2.filter(i => i.done).length
  const allComplete = totalDone === 15

  const handleTagKey = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const t = tagInput.trim().replace(/^#/, '')
      if (t && !tags.includes(t)) setTags([...tags, t])
      setTagInput('')
    }
  }
  const removeTag = (t) => setTags(tags.filter(x => x !== t))

  const handleFileSelect = () => {
    alert('이미지 업로드는 Supabase Storage 연동 후 사용 가능합니다. 현재는 URL을 직접 입력해주세요.')
  }

  const handleDraft = () => {
    if (!title.trim()) { alert('제목을 입력해주세요.'); return }
    setSavedAt(formatNow())
    setViewMode('draftSuccess')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const handleSubmit = () => {
    if (!allComplete) { alert('체크리스트를 모두 완료해주세요!'); return }
    setSavedAt(formatNow())
    setViewMode('submitSuccess')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const resetForm = () => {
    setChannel(''); setTitle(''); setReporter(''); setTagInput(''); setTags([])
    setSummary(''); setThumbnailUrl(''); setImageAlt(''); setVideoUrl(''); setContent('')
    setManualChecks({
      titleClear: false, leadParagraph: false, thumbnail: false, contentLength: false, spelling: false,
      channelCorrect: false, tags: false, titleKeyword: false, summary: false, alt: false,
      fact: false, source: false, kakao: false, instagram: false, editorReview: false,
    })
    setActiveTab(1)
    setViewMode('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  const continueEditing = () => {
    setViewMode('edit')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const switchTab = (n) => {
    setActiveTab(n)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const TABS = [
    { num: 1, icon: '✍️', label: '기사 작성' },
    { num: 2, icon: '✅', label: '발행 체크리스트' },
    { num: 3, icon: '📖', label: '글쓰기 가이드' },
  ]

  // ━━ 임시저장 완료 화면 ━━
  if (viewMode === 'draftSuccess') {
    return (
      <div style={{ background: '#f9f8f6', minHeight: '100vh', padding: '80px 24px', fontFamily: SANS }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', background: '#fff',
          borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: '48px', textAlign: 'center', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>💾</div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 700,
            color: NAVY, margin: '0 0 10px 0', lineHeight: 1.4,
          }}>
            임시저장 완료!
          </h1>
          <p style={{ fontSize: 18, color: '#666', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            언제든지 이어서 작성할 수 있습니다.
          </p>

          <div style={{
            background: '#f8f9fa', borderRadius: 12,
            padding: 24, marginBottom: 24, textAlign: 'left',
          }}>
            <InfoRow label="기사 제목" value={title || '(제목 없음)'} />
            <InfoRow label="채널" value={channel || '(미선택)'} />
            <InfoRow label="저장 시각" value={savedAt} />
            <InfoRow label="완성도" value={`${totalDone}/15 체크 완료`} last />
          </div>

          <p style={{ fontSize: 18, color: '#888', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            Supabase 연동 후 실제 저장 및 불러오기가 가능합니다.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={continueEditing} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: NAVY, color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              ✍️ 이어서 작성하기
            </button>
            <button onClick={() => navigate('/')} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              🏠 홈으로 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ━━ 편집국장 전달 완료 화면 ━━
  if (viewMode === 'submitSuccess') {
    return (
      <div style={{ background: '#f9f8f6', minHeight: '100vh', padding: '80px 24px', fontFamily: SANS }}>
        <div style={{
          maxWidth: 600, margin: '0 auto', background: '#fff',
          borderRadius: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          padding: '48px', textAlign: 'center', boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 26, fontWeight: 700,
            color: NAVY, margin: '0 0 10px 0', lineHeight: 1.4,
          }}>
            편집국장에게 전달됐습니다!
          </h1>
          <p style={{ fontSize: 18, color: '#666', margin: '0 0 32px 0', lineHeight: 1.6 }}>
            정세연 편집국장이 검토 후 연락드립니다.
          </p>

          <div style={{
            background: '#eef7f2', borderRadius: 12,
            padding: 24, marginBottom: 24, textAlign: 'left',
          }}>
            <InfoRow label="기사 제목" value={title} />
            <InfoRow label="채널" value={channel} />
            <InfoRow label="기자 이름" value={reporter} />
            <InfoRow label="전달 시각" value={savedAt} />
            <InfoRow label="체크리스트" value="15/15 ✅ 완료" last />
          </div>

          <div style={{
            background: '#eef3fa', borderRadius: 8,
            padding: 20, marginBottom: 32, textAlign: 'left',
            fontSize: 18, lineHeight: 1.85,
          }}>
            <div style={{ fontWeight: 700, color: NAVY, marginBottom: 12 }}>
              📋 다음 단계 안내
            </div>
            <ol style={{ margin: 0, padding: '0 0 0 24px', color: '#3a3a3a' }}>
              <li style={{ marginBottom: 6 }}>편집국장 검토 후 카카오톡으로 연락드립니다.</li>
              <li style={{ marginBottom: 6 }}>수정 요청이 있을 수 있습니다.</li>
              <li style={{ marginBottom: 6 }}>최종 승인 후 이음미디어에 발행됩니다.</li>
              <li>발행 즉시 카카오·인스타에 공유해주세요!</li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={resetForm} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: NAVY, color: '#fff', border: 'none', borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              ✍️ 새 기사 작성하기
            </button>
            <button onClick={() => navigate('/')} style={{
              flex: 1, height: 52, fontSize: 18, fontWeight: 700,
              background: '#fff', color: NAVY, border: `1px solid ${NAVY}`, borderRadius: 8,
              cursor: 'pointer', fontFamily: SANS,
            }}>
              🏠 홈으로 가기
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ━━ 기본 화면 (edit) ━━
  return (
    <div style={{ background: '#f9f8f6', fontFamily: SANS, minHeight: '100vh' }}>
      {/* 탭 영역 (상단 고정) */}
      <div style={{
        background: '#fff', borderBottom: '1px solid #e5e5e5',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'flex' }}>
          {TABS.map(t => {
            const active = activeTab === t.num
            return (
              <button key={t.num} type="button" onClick={() => switchTab(t.num)}
                style={{
                  flex: 1, height: 56, fontSize: 18, fontWeight: 700,
                  fontFamily: SANS,
                  background: active ? NAVY : '#f0f0f0',
                  color: active ? '#fff' : '#888',
                  border: 'none', cursor: 'pointer',
                  transition: 'all 0.15s',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            )
          })}
        </div>

        {/* 진행률 바 영역 (탭 아래, 항상 표시) */}
        <div style={{
          maxWidth: 1000, margin: '0 auto',
          padding: '16px 24px', display: 'flex', gap: 32, flexWrap: 'wrap',
        }}>
          <ProgressBar label="기사 완성도" current={totalDone} max={15} color={NAVY} />
          <ProgressBar label="검색 노출 최적화" current={stage2Done} max={5} color={BLUE} />
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 24px 80px' }}>

        {/* ━━ 탭 1: 기사 작성 ━━ */}
        {activeTab === 1 && (
          <div>
            {/* 1. 채널 선택 */}
            <div style={card}>
              <label style={lbl}>
                채널 선택 <span style={{ color: RED }}>*</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {CHANNELS.map(c => {
                  const sel = channel === c
                  return (
                    <button key={c} type="button" onClick={() => setChannel(c)}
                      style={{
                        height: 48, padding: '0 18px', fontSize: 17,
                        fontFamily: SANS, fontWeight: 600,
                        background: sel ? NAVY : '#fff',
                        color: sel ? '#fff' : '#3a3a3a',
                        border: `1px solid ${sel ? NAVY : '#d0d0d0'}`,
                        borderRadius: 8,
                        cursor: 'pointer', transition: 'all 0.15s',
                      }}>
                      {c}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 2. 제목 */}
            <div style={card}>
              <label style={lbl}>
                기사 제목 <span style={{ color: RED }}>*</span>
              </label>
              <input style={inp({ height: 56, fontSize: 20 })}
                value={title} onChange={e => setTitle(e.target.value)}
                placeholder="제목 입력 (30자 이내 권장)" />
              <div style={{
                textAlign: 'right', fontSize: 18, fontWeight: 600,
                color: title.length > 30 ? RED : '#888', marginTop: 8,
              }}>
                {title.length}자{title.length > 30 ? ' (30자 권장)' : ''}
              </div>
            </div>

            {/* 3. 기자 이름 */}
            <div style={card}>
              <label style={lbl}>
                기자 이름 <span style={{ color: RED }}>*</span>
              </label>
              <input style={inp({ height: 52 })}
                value={reporter} onChange={e => setReporter(e.target.value)}
                placeholder="이름을 입력하세요" />
            </div>

            {/* 4. 태그 */}
            <div style={card}>
              <label style={lbl}>태그</label>
              <input style={inp({ height: 52 })}
                value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleTagKey}
                placeholder="입력 후 Enter — 예: 고양시, 두피케어" />
              <div style={{
                fontSize: 18, fontWeight: 600,
                color: tags.length >= 3 ? GREEN : '#888', marginTop: 12,
              }}>
                {tags.length}개{tags.length >= 3 ? ' ✓' : ' (3개 이상 권장)'}
              </div>
              {tags.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {tags.map(t => (
                    <span key={t} style={{
                      display: 'inline-flex', alignItems: 'center', gap: 8,
                      padding: '8px 16px', background: '#e8eef5', color: NAVY,
                      fontSize: 16, fontWeight: 600, borderRadius: 20,
                    }}>
                      #{t}
                      <button onClick={() => removeTag(t)} style={{
                        background: 'transparent', border: 'none', color: '#666',
                        cursor: 'pointer', padding: 0, fontSize: 18, lineHeight: 1,
                      }}>×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 5. 기사 요약 */}
            <div style={card}>
              <label style={lbl}>기사 요약</label>
              <textarea style={inp({ height: 96, resize: 'none' })}
                value={summary} onChange={e => setSummary(e.target.value)}
                placeholder="80자 이내 핵심 요약 — 검색 결과에 노출됩니다" />
              <div style={{
                textAlign: 'right', fontSize: 18, fontWeight: 600,
                color: summary.length > 80 ? RED : '#888', marginTop: 8,
              }}>
                {summary.length}자{summary.length > 80 ? ' (80자 권장)' : ''}
              </div>
            </div>

            {/* 6. 대표 이미지 */}
            <div style={card}>
              <label style={lbl}>대표 이미지</label>
              <input style={inp({ marginBottom: 12 })}
                value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)}
                placeholder="이미지 URL을 입력하세요 (https://...)" />
              <button type="button" onClick={handleFileSelect}
                style={{
                  width: '100%', height: 48, fontSize: 17, fontWeight: 600,
                  background: '#fff', color: NAVY,
                  border: `1px solid ${NAVY}`, borderRadius: 8,
                  cursor: 'pointer', fontFamily: SANS, marginBottom: 12,
                }}>
                📁 파일 선택
              </button>
              <input style={inp()}
                value={imageAlt} onChange={e => setImageAlt(e.target.value)}
                placeholder="사진 설명 — 예: 고양시 닥터리부트 두피케어 체험" />
            </div>

            {/* 7. 영상 URL */}
            <div style={card}>
              <label style={lbl}>영상 URL</label>
              <input style={inp()}
                value={videoUrl} onChange={e => setVideoUrl(e.target.value)}
                placeholder="유튜브 또는 영상 링크를 붙여넣으세요" />
              <div style={{ fontSize: 16, color: '#888', marginTop: 10, lineHeight: 1.6 }}>
                유튜브 영상은 링크만 입력하시면 기사에 자동으로 표시됩니다
              </div>
            </div>

            {/* 8. 본문 */}
            <div style={card}>
              <label style={lbl}>
                본문 <span style={{ color: RED }}>*</span>
              </label>
              <textarea style={inp({
                height: 600, resize: 'vertical', lineHeight: 1.9,
              })}
                value={content} onChange={e => setContent(e.target.value)}
                placeholder="기사 본문을 입력하세요 (500자 이상 권장)" />
              <div style={{
                textAlign: 'right', fontSize: 18, fontWeight: 700,
                color: content.length >= 500 ? GREEN : RED, marginTop: 8,
              }}>
                {content.length}자
                {content.length >= 500 ? ' ✓ (500자 이상)' : ' (500자 이상 필요)'}
              </div>
            </div>

            {/* 9. 하단 버튼 */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <button onClick={handleDraft} style={{
                flex: 1, height: 56, fontSize: 18, fontWeight: 700,
                background: '#888', color: '#fff',
                border: 'none', borderRadius: 8,
                cursor: 'pointer', fontFamily: SANS,
              }}>
                💾 임시저장
              </button>
              <button onClick={handleSubmit}
                style={{
                  flex: 2, height: 56, fontSize: 18, fontWeight: 700,
                  background: allComplete ? NAVY : '#ccc',
                  color: allComplete ? '#fff' : '#888',
                  border: 'none', borderRadius: 8,
                  cursor: allComplete ? 'pointer' : 'not-allowed',
                  fontFamily: SANS,
                }}>
                📩 편집국장에게 보내기 ({totalDone}/15)
              </button>
            </div>
          </div>
        )}

        {/* ━━ 탭 2: 발행 체크리스트 ━━ */}
        {activeTab === 2 && (
          <div>
            {/* 상단 안내 영역 */}
            <div style={card}>
              <h1 style={{
                fontFamily: SERIF, fontSize: 24, fontWeight: 700,
                color: NAVY, margin: '0 0 12px 0', lineHeight: 1.4,
              }}>
                🚀 노출깡패 기사 발행 체크리스트
              </h1>
              <p style={{ fontSize: 16, color: '#3a3a3a', lineHeight: 1.8, margin: 0 }}>
                아무리 좋은 기사도 검색 로봇과 AI가 읽지 못하면 묻힙니다.<br />
                3단계 15가지를 체크하면 포털과 AI 검색 최상단에 노출됩니다.
              </p>
            </div>

            {/* 1단계 */}
            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                color: NAVY, marginTop: 0, marginBottom: 16, lineHeight: 1.4,
              }}>
                🟦 1단계 기사 기본 구조
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stage1.map((it, i) => <CheckItem key={i} item={it} onToggle={toggleManual} />)}
              </ul>
            </div>

            {/* 2단계 */}
            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                color: NAVY, marginTop: 0, marginBottom: 16, lineHeight: 1.4,
              }}>
                🟩 2단계 AI·검색 최적화
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stage2.map((it, i) => <CheckItem key={i} item={it} onToggle={toggleManual} />)}
              </ul>
            </div>

            {/* 3단계 */}
            <div style={card}>
              <h2 style={{
                fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                color: NAVY, marginTop: 0, marginBottom: 16, lineHeight: 1.4,
              }}>
                🟥 3단계 최종 발행 준비
              </h2>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {stage3.map((it, i) => <CheckItem key={i} item={it} onToggle={toggleManual} />)}
              </ul>
            </div>

            {/* 실수 방지 TOP 5 */}
            <div style={{
              background: '#fff8f0',
              borderLeft: `4px solid ${ORANGE}`,
              borderRadius: 12,
              padding: '28px',
              marginBottom: 20,
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            }}>
              <h3 style={{
                fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                color: NAVY, margin: '0 0 18px 0', lineHeight: 1.4,
              }}>
                📚 시니어 기자가 자주 놓치는 실수 TOP 5
              </h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 16, lineHeight: 1.85, color: '#1a1a1a' }}>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>1️⃣ 태그 입력 누락</strong><br />
                  태그가 없으면 검색 로봇이 기사를 찾아내지 못해 고립됩니다.
                </li>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>2️⃣ 대표 이미지 누락</strong><br />
                  썸네일이 없는 기사는 클릭률이 저하됩니다.
                </li>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>3️⃣ 메타 설명 비워두기</strong><br />
                  AI가 어색한 문장을 멋대로 긁어가지 않도록 직접 요약문을 작성하세요.
                </li>
                <li style={{ marginBottom: 14 }}>
                  <strong style={{ color: NAVY, fontSize: 17 }}>4️⃣ 독단적 즉시 발행</strong><br />
                  편집국장과의 데스크 과정을 거치지 않은 글은 언론사의 공신력을 해칠 수 있습니다.
                </li>
                <li>
                  <strong style={{ color: NAVY, fontSize: 17 }}>5️⃣ SNS 공유 방치</strong><br />
                  좋은 기사를 쓰고도 알리지 않으면 노출 확장 속도가 느려집니다.<br />
                  발행 즉시 이음의 네트워크로 공유하세요.
                </li>
              </ul>
            </div>

            {/* 하단 서명 영역 */}
            <div style={{
              fontSize: 18, color: '#555',
              padding: '24px 0 40px',
              borderTop: '1px solid #e0e0e0',
              marginTop: 16,
            }}>
              인터뷰 이음미디어 에디터: _______________
            </div>
          </div>
        )}

        {/* ━━ 탭 3: 글쓰기 가이드 ━━ */}
        {activeTab === 3 && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h1 style={{
                fontFamily: SERIF, fontSize: 26, fontWeight: 700,
                color: NAVY, margin: '0 0 10px 0', lineHeight: 1.4,
              }}>
                노출 잘 되는 기사 쓰는 법
              </h1>
              <p style={{ fontSize: 18, color: '#666', margin: 0, lineHeight: 1.6 }}>
                이 4가지만 지키면 구글·네이버·카카오에서 찾아옵니다
              </p>
            </div>

            {GUIDE_CARDS.map((g, i) => (
              <div key={i} style={{
                background: g.bg,
                borderLeft: `4px solid ${g.border}`,
                borderRadius: 12,
                padding: '24px 28px', marginBottom: 20,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <h3 style={{
                  fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                  color: NAVY, margin: '0 0 14px 0', lineHeight: 1.4,
                }}>
                  {g.icon} {g.title}
                </h3>
                <div style={{ fontSize: 17, color: '#1a1a1a', lineHeight: 1.85 }}>
                  {g.body}
                </div>
              </div>
            ))}

            <div style={{
              background: NAVY, color: '#fff',
              borderRadius: 12, padding: 24, marginTop: 32,
              textAlign: 'center', fontSize: 17, lineHeight: 1.85,
            }}>
              💡 좋은 기사 한 편이 이음미디어를 알립니다.<br />
              시민기자님의 글이 세상을 잇습니다. 🌿
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

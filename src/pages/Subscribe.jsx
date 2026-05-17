import { Link } from 'react-router-dom'

const KAKAO_URL = 'http://pf.kakao.com/_xmVHxen'

const CHANNELS = [
  { name: '이음매거진', tagline: '시대를 읽는 깊이 있는 기획' },
  { name: '이음피플', tagline: '평범한 사람들의 비범한 순간' },
  { name: '이음로컬', tagline: '고양·일산 지역 밀착 보도' },
  { name: '이음에듀', tagline: '학교와 평생학습 이야기' },
  { name: '이음뷰', tagline: '편집국과 기고자의 칼럼' },
  { name: '이음트렌드', tagline: '문화·라이프스타일·소비' },
  { name: '이음보이스', tagline: '시민의 목소리, 제보·인터뷰' },
]

const BENEFITS = [
  { icon: '📰', title: '매주 큐레이션', desc: '편집국장이 직접 고른 한 주의 핵심 기사를 토요일 아침 카카오톡으로 받아보세요.' },
  { icon: '🤖', title: 'AI 검색 동시 노출', desc: '구독자에게 먼저 발송된 기사가 ChatGPT·Perplexity·구글·네이버에 동시 인용됩니다.' },
  { icon: '🎤', title: '시민기자 우선 안내', desc: '봉숭아학당 27기 모집, 시민기자 양성 과정 등의 모집 소식을 가장 먼저 전합니다.' },
  { icon: '💸', title: '평생 무료', desc: '구독료 0원. 광고와 협찬으로 운영되며 독자에게 비용을 청구하지 않습니다.' },
]

const STEPS = [
  { num: '01', title: '버튼 클릭', desc: '아래 "카카오톡 채널 추가" 버튼을 누르면 카카오톡 앱이 열립니다.' },
  { num: '02', title: '채널 추가', desc: '카카오톡에서 "이음미디어" 채널을 확인하고 "채널 추가"를 누르세요.' },
  { num: '03', title: '매주 토요일 받기', desc: '매주 토요일 오전, 한 주의 핵심 기사 5건이 카카오톡 메시지로 도착합니다.' },
]

const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const RED = '#c0392b'
const SUB = '#f0a882'
const KAKAO_YELLOW = '#FEE500'
const KAKAO_BROWN = '#3C1E1E'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

export default function Subscribe() {
  return (
    <div style={{ background: '#fff', fontFamily: SANS, color: '#1a1a1a' }}>

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
        color: '#fff',
        padding: '88px 32px 72px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, letterSpacing: 4, color: SUB, fontWeight: 700,
            textTransform: 'uppercase', marginBottom: 18,
          }}>
            SUBSCRIBE
          </div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 42, fontWeight: 700, lineHeight: 1.4,
            letterSpacing: -1, marginBottom: 22,
          }}>
            매주 깊이 있는 이야기,<br /><span style={{ color: SUB }}>카카오톡으로 받아보세요</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.9, opacity: 0.85, fontWeight: 300, marginBottom: 36 }}>
            매주 토요일 아침, 편집국장이 직접 고른 핵심 기사 5건을 보내드립니다.<br />
            구독료 0원, 가입 30초, 언제든지 해지 가능합니다.
          </p>

          {/* 이음미디어 공식 매체 정보 박스 (Hero 안 신뢰 영역, 반투명 통일) */}
          <div style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: 8,
            padding: '24px 28px',
            marginBottom: 24,
            maxWidth: 480, marginLeft: 'auto', marginRight: 'auto',
            textAlign: 'left',
          }}>
            <div style={{
              fontSize: 14, fontWeight: 700, marginBottom: 14,
              opacity: 0.85, letterSpacing: 0.5,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span>📋</span>
              <span>이음미디어 공식 매체 정보</span>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, lineHeight: 1.7 }}>
              <tbody>
                <tr>
                  <td style={{ width: 100, padding: '8px 0 0 0', opacity: 0.55, fontWeight: 500, verticalAlign: 'top' }}>등록번호</td>
                  <td style={{ padding: '8px 0 0 0', opacity: 0.95 }}>서울,아56526</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0 0 0', opacity: 0.55, fontWeight: 500, verticalAlign: 'top' }}>발행 법인</td>
                  <td style={{ padding: '8px 0 0 0', opacity: 0.95 }}>주식회사 봉숭아학당문화혁신학교</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0 0 0', opacity: 0.55, fontWeight: 500, verticalAlign: 'top' }}>발행인</td>
                  <td style={{ padding: '8px 0 0 0', opacity: 0.95 }}>성창운 · 편집인 정세연</td>
                </tr>
                <tr>
                  <td colSpan={2} style={{
                    padding: '10px 0 0 0', marginTop: 4,
                    borderTop: '1px solid rgba(255,255,255,0.12)',
                    color: SUB, fontWeight: 600,
                  }}>
                    ✅ 서울특별시 공식 등록 인터넷신문
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* 카카오 채널 추가 메인 버튼 */}
          <a
            href={KAKAO_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
              background: KAKAO_YELLOW, color: KAKAO_BROWN,
              padding: '20px 44px', fontSize: 18, fontWeight: 700,
              textDecoration: 'none', fontFamily: SANS,
              border: 'none', cursor: 'pointer',
              boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
              minWidth: 320, letterSpacing: -0.3,
            }}
          >
            <span style={{ fontSize: 24 }}>💬</span>
            <span>카카오톡 채널 추가하기</span>
          </a>
          <div style={{ marginTop: 16, fontSize: 13, opacity: 0.7 }}>
            ※ 클릭하면 카카오톡 앱이 열립니다 ({KAKAO_URL})
          </div>
        </div>
      </section>

      {/* ── 7 Channels Preview ── */}
      <section style={{ background: '#fafafa', padding: '72px 32px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              WHAT YOU'LL READ
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: NAVY,
              marginBottom: 12, lineHeight: 1.45,
            }}>
              이런 이야기들을 받아보세요
            </h2>
            <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.85 }}>
              이음미디어 7개 채널에서 매주 큐레이션되는 핵심 기사들
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14,
          }}>
            {CHANNELS.map((ch, i) => (
              <div key={ch.name} style={{
                background: '#fff', border: '1px solid #e5e5e5',
                borderTop: `3px solid ${NAVY}`,
                padding: '20px 22px',
              }}>
                <div style={{
                  fontSize: 11, letterSpacing: 2, color: BLUE, fontWeight: 700, marginBottom: 6,
                }}>
                  CH.{String(i + 1).padStart(2, '0')}
                </div>
                <div style={{
                  fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 6,
                }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: 13.5, color: '#5a5a5a', lineHeight: 1.7 }}>
                  {ch.tagline}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4 Benefits ── */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              BENEFITS
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: NAVY, lineHeight: 1.45,
            }}>
              구독자가 누리는 네 가지
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20,
          }}>
            {BENEFITS.map(b => (
              <div key={b.title} style={{
                background: '#fff', border: '1px solid #e5e5e5',
                padding: '28px 24px',
              }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{b.icon}</div>
                <div style={{
                  fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 10,
                }}>
                  {b.title}
                </div>
                <div style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.85 }}>
                  {b.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3 Steps ── */}
      <section style={{ background: '#fafafa', padding: '80px 32px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              HOW TO SUBSCRIBE
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: NAVY,
              marginBottom: 12, lineHeight: 1.45,
            }}>
              30초 안에 끝나는 구독 방법
            </h2>
            <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.85 }}>
              회원가입도, 결제도 필요 없습니다. 카카오톡만 있으면 됩니다.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20,
          }}>
            {STEPS.map((s, i) => (
              <div key={s.num} style={{
                background: '#fff', border: '1px solid #e5e5e5', padding: '28px 28px',
                position: 'relative',
              }}>
                <div style={{
                  fontFamily: SERIF, fontSize: 38, fontWeight: 700, color: RED,
                  lineHeight: 1, marginBottom: 14,
                }}>
                  {s.num}
                </div>
                <div style={{
                  fontFamily: SERIF, fontSize: 19, fontWeight: 700, color: NAVY, marginBottom: 10,
                }}>
                  {s.title}
                </div>
                <div style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.85 }}>
                  {s.desc}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{
                    position: 'absolute', right: -12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 22, color: '#c0c8d4', display: 'none',
                  }}>→</div>
                )}
              </div>
            ))}
          </div>

          {/* Secondary CTA */}
          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <a
              href={KAKAO_URL}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 12,
                background: KAKAO_YELLOW, color: KAKAO_BROWN,
                padding: '18px 40px', fontSize: 16, fontWeight: 700,
                textDecoration: 'none', fontFamily: SANS,
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                minWidth: 280,
              }}
            >
              <span style={{ fontSize: 22 }}>💬</span>
              <span>지금 카카오톡 채널 추가하기</span>
            </a>
          </div>
        </div>
      </section>

      {/* ── Privacy Notice ── */}
      <section style={{ padding: '64px 32px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{
            background: '#fafafa', border: '1px solid #e5e5e5', borderLeft: `4px solid ${BLUE}`,
            padding: '28px 32px',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
            }}>
              <span style={{ fontSize: 22 }}>🔒</span>
              <div style={{
                fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY,
              }}>
                개인정보 처리 안내
              </div>
            </div>
            <div style={{ fontSize: 14, color: '#3a3a3a', lineHeight: 1.95 }}>
              <p style={{ marginBottom: 12 }}>
                이음미디어는 <strong>정보통신망 이용촉진 및 정보보호 등에 관한 법률 제22조</strong>에 따라
                구독자의 동의를 받아 다음과 같이 개인정보를 수집·이용합니다.
              </p>
              <table style={{ width: '100%', fontSize: 13.5, marginBottom: 14, borderCollapse: 'collapse' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '10px 0', color: '#888', width: 130, verticalAlign: 'top' }}>수집 항목</td>
                    <td style={{ padding: '10px 0' }}>카카오톡 채널 식별자 (카카오 측에서 자동 처리)</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '10px 0', color: '#888', verticalAlign: 'top' }}>수집·이용 목적</td>
                    <td style={{ padding: '10px 0' }}>주간 뉴스레터 발송, 시민기자 모집·구독 관련 안내</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #e5e5e5' }}>
                    <td style={{ padding: '10px 0', color: '#888', verticalAlign: 'top' }}>보유·이용 기간</td>
                    <td style={{ padding: '10px 0' }}>구독 해지 시점까지 (해지 즉시 파기)</td>
                  </tr>
                  <tr>
                    <td style={{ padding: '10px 0', color: '#888', verticalAlign: 'top' }}>거부 권리</td>
                    <td style={{ padding: '10px 0' }}>카카오톡 채널 차단·해지로 언제든지 수신을 중단할 수 있습니다.</td>
                  </tr>
                </tbody>
              </table>
              <p style={{ fontSize: 13, color: '#6b6b6b', lineHeight: 1.8, margin: 0 }}>
                구독에 관한 문의는 <a href="mailto:press@eummedia.kr" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>press@eummedia.kr</a>로 연락 주세요.
              </p>
            </div>
          </div>

          {/* Related Links */}
          <div style={{ marginTop: 32, textAlign: 'center', fontSize: 14, color: '#6b6b6b' }}>
            <span>구독 외에 더 깊이 참여하고 싶다면?  </span>
            <Link to="/citizen-reporter" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600, marginRight: 14 }}>
              시민기자 지원 →
            </Link>
            <Link to="/about" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600, marginRight: 14 }}>
              이음미디어 소개 →
            </Link>
            <Link to="/advertise" style={{ color: BLUE, textDecoration: 'none', fontWeight: 600 }}>
              광고 문의 →
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

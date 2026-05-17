import { Link } from 'react-router-dom'

const VALUES = [
  { icon: '🔗', title: '연결', desc: '세상과 사람, 사람과 사람을 잇습니다. 분절된 정보를 맥락으로 엮어 독자에게 전합니다.' },
  { icon: '🛡️', title: '신뢰', desc: '확인된 사실만을 보도합니다. 출처를 밝히고, 광고와 기사를 분리합니다.' },
  { icon: '🌱', title: '성장', desc: '독자와 함께 성장합니다. 시민기자 양성, 평생교육 연계로 지역의 목소리를 키웁니다.' },
  { icon: '⚖️', title: '공정', desc: '권력과 자본으로부터 독립된 시각을 유지합니다. 약자의 편에서 묻고 기록합니다.' },
]

const CHANNELS = [
  { name: '이음매거진', desc: '시대를 읽는 깊이 있는 기획·인터뷰', path: '/channel/magazine' },
  { name: '이음피플',   desc: '평범한 사람들의 비범한 이야기',     path: '/channel/people' },
  { name: '이음로컬',   desc: '지역 소상공인 밀착 보도',           path: '/channel/local' },
  { name: '이음에듀',   desc: '학교, 교육 정책, 평생학습 이야기',  path: '/channel/edu' },
  { name: '이음뷰',     desc: '편집국과 기고자의 칼럼·논평',       path: '/channel/view' },
  { name: '이음트렌드', desc: '문화·AI 디지털 트렌드·라이프스타일', path: '/channel/trend' },
  { name: '이음보이스', desc: '시민의 목소리, 제보와 인터뷰',     path: '/channel/voice' },
]

const PRINCIPLES = [
  { num: '01', title: '사실 확인', desc: '모든 보도는 최소 2개 이상의 출처로 교차 검증합니다. 추측은 보도하지 않습니다.' },
  { num: '02', title: '광고 분리', desc: '광고·협찬 기사는 [협찬] 표기를 명시합니다. 보도 영향력을 광고와 거래하지 않습니다.' },
  { num: '03', title: '독립성', desc: '특정 정파·기업·이익단체로부터 독립된 편집권을 행사합니다.' },
  { num: '04', title: '시민 참여', desc: '시민기자와 독자 제보를 1차 취재원으로 존중합니다.' },
  { num: '05', title: 'AI 시대 대응', desc: 'ChatGPT·Perplexity 등 AI 검색이 인용할 신뢰 가능한 1차 사실 매체가 됩니다.' },
]

const PEOPLE = [
  {
    role: '발행인',
    name: '성창운',
    desc: '이음미디어를 설립하고 운영을 총괄합니다. 지역 언론의 지속 가능성과 독립성을 지키는 일에 책임을 집니다.',
  },
  {
    role: '편집국장',
    name: '정세연',
    desc: '편집 방향과 보도 품질을 책임집니다. 27년 두피관리 전문가 경력을 바탕으로 생활 밀착 콘텐츠를 직접 기획·취재합니다.',
  },
]

const NAVY = '#0d2d52'
const BLUE = '#1c4f8a'
const RED = '#c0392b'
const SUB = '#f0a882'
const SERIF = "'Noto Serif KR', serif"
const SANS = "'Noto Sans KR', sans-serif"

export default function About() {
  return (
    <div style={{ background: '#fff', fontFamily: SANS, color: '#1a1a1a' }}>

      {/* ── Hero ── */}
      <section style={{
        background: `linear-gradient(135deg, ${NAVY} 0%, ${BLUE} 100%)`,
        color: '#fff',
        padding: '88px 32px 80px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, letterSpacing: 4, color: SUB, fontWeight: 700,
            textTransform: 'uppercase', marginBottom: 18,
          }}>
            ABOUT EUM MEDIA
          </div>
          <h1 style={{
            fontFamily: SERIF, fontSize: 44, fontWeight: 700, lineHeight: 1.35,
            letterSpacing: -1, marginBottom: 22,
          }}>
            세상과 당신을 잇는<br /><span style={{ color: SUB }}>이음미디어</span>
          </h1>
          <p style={{ fontSize: 17, lineHeight: 1.9, opacity: 0.85, fontWeight: 300 }}>
            이음미디어는 세상과 당신을 잇고, 당신의 성공이 우리의 뉴스입니다.<br />
            지역의 작은 목소리부터 AI 시대의 큰 흐름까지 — 매일 새 이야기를 전합니다.
          </p>
        </div>
      </section>

      {/* ── Mission ── */}
      <section style={{ background: '#fafafa', padding: '72px 32px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{
            fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
            textTransform: 'uppercase', marginBottom: 14, textAlign: 'center',
          }}>
            OUR MISSION
          </div>
          <h2 style={{
            fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: NAVY,
            marginBottom: 28, textAlign: 'center', lineHeight: 1.45,
          }}>
            왜 이음미디어를 시작했나
          </h2>
          <div style={{
            background: '#fff', border: '1px solid #e5e5e5', borderLeft: `4px solid ${RED}`,
            padding: '36px 40px', fontSize: 16, lineHeight: 2, color: '#2a2a2a',
          }}>
            <p style={{ marginBottom: 18 }}>
              뉴스가 넘쳐나는 시대에, 정작 <strong style={{ color: NAVY }}>믿을 만한 이야기</strong>는 줄어들고 있습니다.
              조회수를 좇는 자극적 헤드라인, 광고와 구분되지 않는 협찬 기사, 출처 없는 인용이 일상이 되었습니다.
            </p>
            <p style={{ marginBottom: 18 }}>
              이음미디어는 <strong style={{ color: NAVY }}>"천천히, 정확하게, 끝까지"</strong>를 약속합니다.
              매일 쏟아지는 속보가 아니라, 깊이 있는 기획을, 클릭 유도가 아니라 맥락을 전합니다.
            </p>
            <p style={{ marginBottom: 0 }}>
              그리고 <strong style={{ color: NAVY }}>독자 한 사람의 이야기</strong>를 출발점으로 삼습니다.
              이웃의 사연, 시민의 제보, 평범한 사람의 비범한 순간을 기록합니다. 그것이 이음(連)의 시작이라고 믿습니다.
            </p>
          </div>
        </div>
      </section>

      {/* ── 4 Values ── */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              CORE VALUES
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.45,
            }}>
              우리가 지키는 네 가지
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24,
          }}>
            {VALUES.map(v => (
              <div key={v.title} style={{
                background: '#fff', border: '1px solid #e5e5e5', borderTop: `3px solid ${NAVY}`,
                padding: '32px 28px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 38, marginBottom: 16 }}>{v.icon}</div>
                <div style={{
                  fontFamily: SERIF, fontSize: 22, fontWeight: 700,
                  color: NAVY, marginBottom: 12,
                }}>
                  {v.title}
                </div>
                <div style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.85 }}>
                  {v.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 7 Channels ── */}
      <section style={{ background: '#fafafa', padding: '80px 32px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              7 CHANNELS
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: NAVY,
              marginBottom: 12, lineHeight: 1.45,
            }}>
              일곱 개의 결, 하나의 이음
            </h2>
            <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.85 }}>
              주제별로 나뉘지만, 모든 채널은 하나의 편집 원칙을 공유합니다.
            </p>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16,
          }}>
            {CHANNELS.map((ch, i) => (
              <Link key={ch.path} to={ch.path} style={{
                textDecoration: 'none', color: 'inherit',
                background: '#fff', border: '1px solid #e5e5e5',
                padding: '24px 26px', display: 'block',
                transition: 'border-color 0.2s, transform 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = NAVY; e.currentTarget.style.transform = 'translateY(-2px)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e5e5e5'; e.currentTarget.style.transform = 'translateY(0)' }}
              >
                <div style={{
                  fontSize: 11, letterSpacing: 2, color: BLUE, fontWeight: 700, marginBottom: 8,
                }}>
                  CH.{String(i + 1).padStart(2, '0')}
                </div>
                <div style={{
                  fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                  color: NAVY, marginBottom: 8,
                }}>
                  {ch.name}
                </div>
                <div style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.7 }}>
                  {ch.desc}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── 5 Principles ── */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              EDITORIAL PRINCIPLES
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.45,
            }}>
              편집 5대 원칙
            </h2>
            {/* 부 슬로건 — 편집 철학이 5대 원칙의 머리 (2026-05-12, 편집인 결정) */}
            <div style={{
              maxWidth: 560,
              margin: '28px auto 0',
              paddingTop: 22,
              borderTop: `1px solid ${SUB}`,
            }}>
              <p style={{
                fontFamily: SERIF,
                fontSize: 18,
                fontStyle: 'italic',
                color: NAVY,
                lineHeight: 1.7,
                letterSpacing: '-0.3px',
                margin: 0,
                textAlign: 'center',
              }}>
                <span style={{ color: SUB, fontSize: 24, marginRight: 4, verticalAlign: '-3px' }}>“</span>
                이음미디어는 정보를 모으지 않고, 정보를 거릅니다.
                <span style={{ color: SUB, fontSize: 24, marginLeft: 4, verticalAlign: '-3px' }}>”</span>
              </p>
            </div>
          </div>
          <div>
            {PRINCIPLES.map(p => (
              <div key={p.num} style={{
                display: 'flex', gap: 28, padding: '28px 0',
                borderBottom: '1px solid #ebebeb', alignItems: 'flex-start',
              }}>
                <div style={{
                  fontFamily: SERIF, fontSize: 32, fontWeight: 700, color: RED,
                  minWidth: 56, lineHeight: 1,
                }}>
                  {p.num}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    fontFamily: SERIF, fontSize: 20, fontWeight: 700,
                    color: NAVY, marginBottom: 8,
                  }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: 15, color: '#3a3a3a', lineHeight: 1.85 }}>
                    {p.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── People ── */}
      <section style={{ background: NAVY, color: '#fff', padding: '80px 32px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: SUB, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              PEOPLE
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 700, lineHeight: 1.45,
            }}>
              만드는 사람들
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 32,
          }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                padding: '32px 32px', borderTop: `3px solid ${SUB}`,
              }}>
                <div style={{
                  fontSize: 11, letterSpacing: 2, color: SUB, fontWeight: 700, marginBottom: 10,
                }}>
                  {p.role.toUpperCase()}
                </div>
                <div style={{
                  fontFamily: SERIF, fontSize: 28, fontWeight: 700, marginBottom: 6,
                }}>
                  {p.name}
                </div>
                <div style={{
                  fontSize: 13, color: SUB, marginBottom: 16, fontWeight: 500,
                }}>
                  {p.role}
                </div>
                <div style={{ fontSize: 14.5, lineHeight: 1.9, opacity: 0.85 }}>
                  {p.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 창간사 ── */}
      <section style={{ background: '#f7f8fa', padding: '80px 32px', borderTop: '1px solid #e5e5e5', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 760, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              FOUNDING STATEMENT
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.45,
            }}>
              창간사
            </h2>
          </div>
          <div style={{
            background: '#fff', borderLeft: `4px solid ${NAVY}`,
            padding: '36px 40px', fontFamily: SERIF, fontSize: 17, lineHeight: 2, color: '#2a2a2a',
          }}>
            <p style={{ marginBottom: 14 }}>"세상에는 기록되지 못한 이야기가 너무 많습니다.</p>
            <p style={{ marginBottom: 14 }}>이음미디어는 그 이야기들을 잇겠습니다.</p>
            <p style={{ marginBottom: 14 }}>속보보다 늦어도 괜찮습니다.</p>
            <p style={{ marginBottom: 14 }}>깊이 있게 기록하겠습니다.</p>
            <p style={{ marginBottom: 22 }}>당신의 이야기가 곧 우리의 뉴스입니다."</p>
            <div style={{
              fontFamily: SANS, fontSize: 13, color: '#6b6b6b',
              textAlign: 'right', paddingTop: 16, borderTop: '1px solid #e5e5e5',
            }}>
              — 정세연 편집국장, 창간사 중에서
            </div>
          </div>
        </div>
      </section>

      {/* ── 이음미디어 패밀리 ── */}
      <section style={{ padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              EUM MEDIA FAMILY
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.45,
            }}>
              이음미디어 패밀리
            </h2>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24,
          }}>
            {[
              {
                icon: '🎤',
                name: '봉숭아학당 문화혁신학교',
                desc: '방송스피치 교육. 이음미디어 발행 법인. 수료 후 이음미디어 시민기자로 활동 가능.',
              },
              {
                icon: '😄',
                name: '웃자대한민국 협회',
                desc: '웃음치료·문화 협회. 이음미디어와 긍정 에너지를 함께 전합니다.',
              },
              {
                icon: '🎓',
                name: '이음평생교육원',
                desc: '준비 중 · 시민기자 과정. 이음미디어 1년 실적 기반 2027 설립 예정.',
              },
            ].map(f => (
              <div key={f.name} style={{
                background: '#fff', border: '1px solid #e5e5e5', borderTop: `3px solid ${NAVY}`,
                padding: '32px 28px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 38, marginBottom: 16 }}>{f.icon}</div>
                <div style={{
                  fontFamily: SERIF, fontSize: 18, fontWeight: 700,
                  color: NAVY, marginBottom: 12, lineHeight: 1.5,
                }}>
                  {f.name}
                </div>
                <div style={{ fontSize: 14, color: '#5a5a5a', lineHeight: 1.85 }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 회사 정보 + 편집 방침 ── */}
      <section style={{ background: '#fff', padding: '80px 32px', borderTop: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{
              fontSize: 11, letterSpacing: 3, color: BLUE, fontWeight: 700,
              textTransform: 'uppercase', marginBottom: 14,
            }}>
              COMPANY INFO
            </div>
            <h2 style={{
              fontFamily: SERIF, fontSize: 30, fontWeight: 700, color: NAVY, lineHeight: 1.45,
            }}>
              회사 정보
            </h2>
          </div>
          <table style={{
            width: '100%', borderCollapse: 'collapse', background: '#fff',
            border: '1px solid #e5e5e5', marginBottom: 40, fontSize: 14, lineHeight: 1.8,
          }}>
            <tbody>
              {[
                ['매체명', '이음미디어 (E-UM MEDIA)'],
                ['발행인', '성창운'],
                ['발행 형태', '인터넷신문'],
                ['등록번호', '서울,아56526'],
                ['등록일', '2026년 04월 27일'],
                ['발행소', '서울시 관악구 남부순환로 1699, 2층'],
                ['전화번호', '02-6956-0339'],
                ['도메인', 'eummedia.kr'],
                ['제보·광고 문의', 'press@eummedia.kr'],
                ['발행 법인', '주식회사 봉숭아학당문화혁신학교'],
              ].map(([k, v]) => (
                <tr key={k} style={{ borderBottom: '1px solid #ebebeb' }}>
                  <th style={{
                    width: 180, textAlign: 'left', padding: '14px 20px',
                    background: '#fafafa', color: NAVY, fontWeight: 700,
                    borderRight: '1px solid #ebebeb', verticalAlign: 'top',
                  }}>{k}</th>
                  <td style={{ padding: '14px 20px', color: '#2a2a2a' }}>{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{
            background: '#f7f8fa', borderLeft: `4px solid ${NAVY}`,
            padding: '28px 32px',
          }}>
            <div style={{
              fontFamily: SERIF, fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 18,
            }}>
              편집 방침
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: 14.5, lineHeight: 2, color: '#3a3a3a' }}>
              <li><strong style={{ color: NAVY, marginRight: 10 }}>01.</strong>속보보다 깊이를 추구합니다.</li>
              <li><strong style={{ color: NAVY, marginRight: 10 }}>02.</strong>사람 중심으로 기사를 씁니다.</li>
              <li><strong style={{ color: NAVY, marginRight: 10 }}>03.</strong>광고와 기사를 명확히 구분합니다.</li>
              <li><strong style={{ color: NAVY, marginRight: 10 }}>04.</strong>독자의 제보와 의견을 소중히 여깁니다.</li>
              <li><strong style={{ color: NAVY, marginRight: 10 }}>05.</strong>SEO·AEO 최적화로 더 많은 사람에게 전합니다.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: '#fafafa', padding: '80px 32px', borderBottom: '1px solid #e5e5e5' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{
            fontFamily: SERIF, fontSize: 28, fontWeight: 700, color: NAVY,
            marginBottom: 16, lineHeight: 1.45,
          }}>
            함께 잇는 길
          </h2>
          <p style={{ fontSize: 15, color: '#6b6b6b', lineHeight: 1.85, marginBottom: 40 }}>
            독자로, 시민기자로, 광고주로 — 이음미디어와 함께해주세요.
          </p>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16,
          }}>
            <Link to="/subscribe" style={{
              background: NAVY, color: '#fff', textDecoration: 'none',
              padding: '22px 24px', textAlign: 'center', fontFamily: SANS,
              border: `2px solid ${NAVY}`, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = NAVY }}
              onMouseLeave={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = '#fff' }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>📨</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>구독 신청</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>매주 토요일 카카오톡으로</div>
            </Link>
            <Link to="/citizen-reporter" style={{
              background: '#fff', color: NAVY, textDecoration: 'none',
              padding: '22px 24px', textAlign: 'center', fontFamily: SANS,
              border: `2px solid ${NAVY}`, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = NAVY }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>✍️</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>시민기자 지원</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>당신의 이야기로 잇기</div>
            </Link>
            <Link to="/advertise" style={{
              background: '#fff', color: NAVY, textDecoration: 'none',
              padding: '22px 24px', textAlign: 'center', fontFamily: SANS,
              border: `2px solid ${NAVY}`, transition: 'all 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = NAVY }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>📢</div>
              <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>광고 문의</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>당신의 이야기를 기사로</div>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}

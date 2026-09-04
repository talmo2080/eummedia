// ─────────────────────────────────────────────────────────────
// 기사 듣기 (개편판)
//
// 설계 (지시서):
//   · 조작 요소 5개로 단순화 (독자층: 눈 피로·어르신)
//     [▶ 듣기 / ⏸ 멈춤] [↺ 처음부터] 속도[느리게/보통/빠르게]
//     [목소리▼] [☐ 읽는 곳 따라가기]
//   · 재생/일시정지 한 버튼 토글, '정지' 삭제 (처음부터로 대체)
//   · 속도 3단계 (1.5 제거), 표기는 우리말
//   · Google 음성 pause/resume 미지원 알려진 문제 → cancel 후 문단 처음부터 재재생
//     안내: "다시 누르면 이 문단부터 이어집니다"
//   · 목소리 이름에 설명 (Google→(자연스러움), local→(기본))
//   · 하이라이트 강화 + 자동 스크롤 토글 (localStorage)
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { articleToSpeech, speechIndexToBodyIndex } from '../lib/tts-transform';

const NAVY = '#0d2d52';
const NAVY_INK = '#e8eef5';

const RATES = [
  { value: 0.8, label: '느리게' },
  { value: 1.0, label: '보통' },
  { value: 1.3, label: '빠르게' },
];
const DEFAULT_RATE = 1.0;
const RATE_STORAGE_KEY = 'eum-tts-rate';
const VOICE_STORAGE_KEY = 'eum-tts-voice';
const AUTOSCROLL_STORAGE_KEY = 'eum-tts-autoscroll';

function loadRate() {
  try {
    const v = Number(localStorage.getItem(RATE_STORAGE_KEY));
    if (RATES.some(r => r.value === v)) return v;
    // 마이그레이션: 기존 1.5는 1.3으로 (1.5 제거됨)
    if (v === 1.5 || v === 1.2) return 1.3;
  } catch {}
  return DEFAULT_RATE;
}
function saveRate(r) {
  try { localStorage.setItem(RATE_STORAGE_KEY, String(r)); } catch {}
}
function loadVoiceName() {
  try { return localStorage.getItem(VOICE_STORAGE_KEY) || null; } catch { return null; }
}
function saveVoiceName(name) {
  try { if (name) localStorage.setItem(VOICE_STORAGE_KEY, name); } catch {}
}
function loadAutoScroll() {
  try {
    const v = localStorage.getItem(AUTOSCROLL_STORAGE_KEY);
    if (v === 'on' || v === 'off') return v === 'on';
  } catch {}
  return true; // 기본 켜짐
}
function saveAutoScroll(on) {
  try { localStorage.setItem(AUTOSCROLL_STORAGE_KEY, on ? 'on' : 'off'); } catch {}
}

// 한국어 음성 우선순위 규칙
//   1) Google 이름 포함 (자연스러움)
//   2) localService === false (네트워크 음성)
//   3) 첫 번째 ko-KR
export function pickPreferredVoice(koVoices) {
  if (!koVoices || koVoices.length === 0) return null;
  const google = koVoices.find(v => /google/i.test(v.name));
  if (google) return google;
  const remote = koVoices.find(v => v.localService === false);
  if (remote) return remote;
  return koVoices[0];
}

// 목소리 이름 + 설명 라벨 (드롭다운용, 기기별 이름을 하드코딩하지 않음)
function labelVoice(v) {
  if (!v) return '';
  const tags = [];
  if (/google/i.test(v.name)) tags.push('자연스러움');
  else if (v.localService === true) tags.push('기본');
  return tags.length ? `${v.name} (${tags.join(', ')})` : v.name;
}

// 인앱 브라우저 감지 (네이버·카카오톡·라인·인스타·페이스북 등)
function isInAppBrowser(ua) {
  if (!ua) return false;
  return /NAVER\(inapp|KAKAOTALK|FBAN|FBAV|Instagram|Line\/|kakaotalk-scrap|whale.*inapp|; wv\)/i.test(ua);
}

export default function ArticleAudioPlayer({ article }) {
  const [state, setState] = useState('idle'); // 'idle' | 'playing' | 'paused'
  const [voice, setVoice] = useState(null);
  const [koVoices, setKoVoices] = useState([]);
  const [supportStatus, setSupportStatus] = useState('checking'); // 'checking' | 'ok' | 'no-tts' | 'no-ko-voice' | 'in-app-browser'
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [autoScroll, setAutoScroll] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(-1);

  const paragraphsRef = useRef([]);
  const idxRef = useRef(0);
  const rateRef = useRef(DEFAULT_RATE);
  const stateRef = useRef('idle');
  const voiceRef = useRef(null);
  const autoScrollRef = useRef(true);
  const userScrollLastRef = useRef(0);
  const userScrollPausedUntilRef = useRef(0);
  const location = useLocation();

  useEffect(() => {
    setRate(loadRate());
    rateRef.current = loadRate();
    setAutoScroll(loadAutoScroll());
    autoScrollRef.current = loadAutoScroll();
  }, []);
  useEffect(() => { stateRef.current = state; }, [state]);
  useEffect(() => { voiceRef.current = voice; }, [voice]);
  useEffect(() => { autoScrollRef.current = autoScroll; }, [autoScroll]);

  // ── 브라우저 지원 & 한국어 음성 감지 (폴링 + voiceschanged + 인앱) ─
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupportStatus('no-tts'); return;
    }
    if (isInAppBrowser(navigator.userAgent)) {
      setSupportStatus('in-app-browser'); return;
    }
    let done = false;
    const tryDetect = () => {
      if (done) return true;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return false;
      const koList = voices.filter(v => /^ko(-|_|$)/i.test(v.lang));
      if (koList.length === 0) return false;
      done = true;
      setKoVoices(koList);
      const savedName = loadVoiceName();
      const saved = savedName ? koList.find(v => v.name === savedName) : null;
      const chosen = saved || pickPreferredVoice(koList);
      setVoice(chosen); voiceRef.current = chosen;
      setSupportStatus('ok');
      return true;
    };
    if (tryDetect()) return;
    const poll = setInterval(() => { if (tryDetect()) clearInterval(poll); }, 100);
    const onChanged = () => { tryDetect(); };
    window.speechSynthesis.addEventListener('voiceschanged', onChanged);
    const finalT = setTimeout(() => {
      if (done) return;
      clearInterval(poll);
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) { setSupportStatus('no-tts'); done = true; return; }
      const koList = voices.filter(v => /^ko(-|_|$)/i.test(v.lang));
      if (koList.length === 0) { setSupportStatus('no-ko-voice'); done = true; return; }
      setKoVoices(koList);
      const savedName = loadVoiceName();
      const saved = savedName ? koList.find(v => v.name === savedName) : null;
      const chosen = saved || pickPreferredVoice(koList);
      setVoice(chosen); voiceRef.current = chosen;
      setSupportStatus('ok'); done = true;
    }, 3000);
    return () => {
      clearInterval(poll); clearTimeout(finalT);
      window.speechSynthesis.removeEventListener('voiceschanged', onChanged);
    };
  }, []);

  // 라우트/언마운트 정리
  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    clearAllHighlights();
  }, [location.pathname]);
  useEffect(() => () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
    clearAllHighlights();
  }, []);

  function clearAllHighlights() {
    if (typeof document === 'undefined') return;
    document.querySelectorAll('.tts-para.tts-speaking').forEach(el => el.classList.remove('tts-speaking'));
  }

  const highlightBodyIndex = useCallback((bodyIdx) => {
    if (typeof document === 'undefined') return;
    clearAllHighlights();
    if (bodyIdx == null || bodyIdx < 0) return;
    const el = document.querySelector(`.tts-para[data-tts-body-index="${bodyIdx}"]`);
    if (!el) return;
    el.classList.add('tts-speaking');
    if (!autoScrollRef.current) return;
    if (Date.now() < userScrollPausedUntilRef.current) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < 80 || rect.bottom > vh - 80) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // 사용자 직접 스크롤 감지 (자동 스크롤 3초간 중단)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      const now = Date.now();
      if (now - userScrollLastRef.current < 100) return;
      userScrollPausedUntilRef.current = now + 3000;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const speakNext = useCallback(() => {
    const paras = paragraphsRef.current;
    if (idxRef.current >= paras.length) {
      setState('idle'); stateRef.current = 'idle';
      setCurrentIdx(-1); idxRef.current = 0;
      clearAllHighlights();
      return;
    }
    const speechIdx = idxRef.current;
    const text = paras[speechIdx];
    const bodyIdx = speechIndexToBodyIndex(
      { title: article?.title, subtitle: article?.subtitle || article?.summary },
      speechIdx
    );
    setCurrentIdx(speechIdx);
    userScrollLastRef.current = Date.now();
    highlightBodyIndex(bodyIdx);

    const u = new SpeechSynthesisUtterance(text);
    const currentVoice = voiceRef.current || voice;
    if (currentVoice) u.voice = currentVoice;
    u.lang = 'ko-KR';
    u.rate = rateRef.current;
    u.pitch = 1.0;
    u.onend = () => {
      if (stateRef.current !== 'playing') return;
      idxRef.current += 1;
      speakNext();
    };
    u.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('TTS error:', e.error);
      }
    };
    window.speechSynthesis.speak(u);
  }, [voice, article, highlightBodyIndex]);

  // 재생 / 일시정지 토글 (지시서: pause/resume 대신 cancel + 문단 재시작)
  const handleToggle = () => {
    if (state === 'playing') {
      // 일시정지 (구현: 현재 문단 위치 유지, cancel, paused로 마킹)
      window.speechSynthesis.cancel();
      setState('paused'); stateRef.current = 'paused';
      return;
    }
    if (state === 'paused') {
      // 재개: 같은 문단부터 다시 시작
      stateRef.current = 'playing';
      setState('playing');
      setTimeout(() => speakNext(), 60);
      return;
    }
    // idle → 첫 재생
    const paras = articleToSpeech({
      title: article?.title,
      subtitle: article?.subtitle || article?.summary,
      body: article?.content,
    }).filter(Boolean);
    if (paras.length === 0) return;
    paragraphsRef.current = paras;
    idxRef.current = 0;
    window.speechSynthesis.cancel();
    setState('playing'); stateRef.current = 'playing';
    speakNext();
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    const paras = articleToSpeech({
      title: article?.title,
      subtitle: article?.subtitle || article?.summary,
      body: article?.content,
    }).filter(Boolean);
    if (paras.length === 0) return;
    paragraphsRef.current = paras;
    idxRef.current = 0;
    setState('playing'); stateRef.current = 'playing';
    speakNext();
  };

  const handleRate = (r) => {
    saveRate(r);
    setRate(r); rateRef.current = r;
    if (state !== 'playing') return;
    window.speechSynthesis.cancel();
    stateRef.current = 'playing';
    setTimeout(() => speakNext(), 60);
  };

  const handleVoice = (voiceName) => {
    const v = koVoices.find(x => x.name === voiceName);
    if (!v) return;
    saveVoiceName(v.name);
    setVoice(v); voiceRef.current = v;
    if (state !== 'playing') return;
    window.speechSynthesis.cancel();
    stateRef.current = 'playing';
    setTimeout(() => speakNext(), 60);
  };

  const handleAutoScroll = (on) => {
    saveAutoScroll(on);
    setAutoScroll(on); autoScrollRef.current = on;
  };

  // ── UI ────────────────────────────────────────────
  if (supportStatus === 'no-tts' || supportStatus === 'no-ko-voice' || supportStatus === 'in-app-browser') {
    return (
      <div role="note" style={{
        padding: '14px 16px',
        background: '#fdf6ec',
        border: '1px solid #e8c98a',
        borderRadius: 6,
        fontSize: 15, color: '#3a2a10',
        lineHeight: 1.7,
        margin: '18px 0 22px',
      }}>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>이 브라우저에서는 듣기가 되지 않습니다.</div>
        <div style={{ color: '#5a4520' }}>
          구글 크롬(빨강·노랑·초록 동그라미) 또는 사파리(나침반 모양)로 열면 들으실 수 있습니다.
        </div>
      </div>
    );
  }

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, minHeight: 44, minWidth: 44, padding: '10px 16px',
    borderRadius: 6, border: `1.5px solid ${NAVY}`,
    background: '#fff', color: NAVY,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  };
  const btnPrimary = { ...btnBase, background: NAVY, color: '#fff' };
  const rateBtnStyle = (val) => ({
    minHeight: 44, minWidth: 44, padding: '8px 14px',
    borderRadius: 4,
    border: `1.5px solid ${val === rate ? NAVY : '#c8d2df'}`,
    background: val === rate ? NAVY : '#fff',
    color: val === rate ? '#fff' : NAVY,
    fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  });

  const isPlaying = state === 'playing';
  const isPaused = state === 'paused';

  return (
    <div role="group" aria-label="기사 듣기 컨트롤" style={{
      display: 'flex', flexWrap: 'wrap', gap: 10,
      padding: '14px 16px',
      background: NAVY_INK,
      border: `1px solid #d5deeb`,
      borderRadius: 6,
      margin: '18px 0 22px',
      alignItems: 'center',
    }}>
      <span aria-hidden="true" style={{ fontSize: 16 }}>🔊</span>

      {/* 재생/일시정지 토글 (또는 idle 상태의 첫 재생) */}
      <button
        type="button"
        onClick={handleToggle}
        aria-label={isPlaying ? '일시정지' : (isPaused ? '이어 듣기 (문단 처음부터)' : '기사 듣기 시작')}
        style={btnPrimary}
      >
        <span aria-hidden="true">{isPlaying ? '⏸' : '▶'}</span>
        <span>{isPlaying ? '멈춤' : (isPaused ? '이어 듣기' : '듣기')}</span>
      </button>

      {/* 처음부터 (재생 중이거나 정지 상태에서 유용) */}
      <button
        type="button"
        onClick={handleRestart}
        aria-label="처음부터 다시 재생"
        style={btnBase}
      >
        <span aria-hidden="true">↺</span>
        <span>처음부터</span>
      </button>

      {/* 속도 (느리게/보통/빠르게) */}
      <div role="group" aria-label="재생 속도 선택" style={{
        display: 'inline-flex', gap: 4, alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, color: '#555', marginRight: 4 }}>속도</span>
        {RATES.map(r => (
          <button
            key={r.value}
            type="button"
            onClick={() => handleRate(r.value)}
            aria-label={`재생 속도 ${r.label}`}
            aria-pressed={r.value === rate}
            style={rateBtnStyle(r.value)}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* 목소리 (2개 이상일 때만) */}
      {koVoices.length >= 2 && voice && (
        <label style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          fontSize: 12, color: '#555',
        }}>
          <span>목소리</span>
          <select
            value={voice.name}
            onChange={(e) => handleVoice(e.target.value)}
            aria-label="낭독 목소리 선택"
            style={{
              minHeight: 44, padding: '6px 10px',
              border: '1.5px solid #c8d2df',
              borderRadius: 4, background: '#fff', color: NAVY,
              fontSize: 13, fontWeight: 700,
              fontFamily: 'inherit', cursor: 'pointer',
              maxWidth: 260,
            }}
          >
            {koVoices.map(v => (
              <option key={v.name} value={v.name}>{labelVoice(v)}</option>
            ))}
          </select>
        </label>
      )}

      {/* 읽는 곳 따라가기 (자동 스크롤 토글) */}
      <label style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        fontSize: 13, color: '#333',
        minHeight: 44, padding: '0 6px',
        cursor: 'pointer',
      }}>
        <input
          type="checkbox"
          checked={autoScroll}
          onChange={(e) => handleAutoScroll(e.target.checked)}
          aria-label="읽는 곳 따라가기"
          style={{ width: 20, height: 20, cursor: 'pointer' }}
        />
        <span>읽는 곳 따라가기</span>
      </label>

      {/* 상태 표시 */}
      {(isPlaying || isPaused) && (
        <span
          style={{ fontSize: 12, color: '#595959', width: '100%', marginTop: 2 }}
          aria-live="polite"
        >
          {isPlaying ? '재생 중' : '멈춤 · 다시 누르면 이 문단부터 이어집니다'}
          {currentIdx >= 0 && paragraphsRef.current.length > 0 &&
            ` · ${currentIdx + 1} / ${paragraphsRef.current.length}문단`}
        </span>
      )}

      {/* 짧은 안내 (aria-hidden — 화면낭독기 사용자에겐 불필요) */}
      <div aria-hidden="true" style={{
        flexBasis: '100%',
        fontSize: 12, color: '#595959',
        marginTop: 2, lineHeight: 1.5,
      }}>
        기기에 설치된 음성으로 읽어드립니다. 기기마다 목소리가 다를 수 있습니다.
      </div>
    </div>
  );
}

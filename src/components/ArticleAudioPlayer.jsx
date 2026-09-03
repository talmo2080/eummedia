// ─────────────────────────────────────────────────────────────
// 기사 듣기 (2차 완전판)
//
// 1차 기능: 재생 / 일시정지 / 정지 / 한국어 음성 자동 / 문단 순차 재생 / 라우트 이탈 정지
// 2차 기능:
//   · 속도 조절 (0.8/1.0/1.2/1.5) — 재생 중 변경 즉시 반영, localStorage 저장
//   · 문단 하이라이트 (data-tts-body-index 매핑) + smooth 스크롤
//   · 사용자 직접 스크롤 감지 시 자동 스크롤 잠깐 중단
//   · 처음부터 다시 (제목부터 재시작)
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { articleToSpeech, speechIndexToBodyIndex } from '../lib/tts-transform';

const NAVY = '#0d2d52';
const NAVY_INK = '#e8eef5';
const GOLD = '#c9a84c';

const RATES = [0.8, 1.0, 1.2, 1.5];
const RATE_STORAGE_KEY = 'eum-tts-rate';
const DEFAULT_RATE = 1.0;

function loadRate() {
  try {
    const v = Number(localStorage.getItem(RATE_STORAGE_KEY));
    if (RATES.includes(v)) return v;
  } catch {}
  return DEFAULT_RATE;
}
function saveRate(r) {
  try { localStorage.setItem(RATE_STORAGE_KEY, String(r)); } catch {}
}

export default function ArticleAudioPlayer({ article }) {
  // state: 'idle' | 'playing' | 'paused'
  const [state, setState] = useState('idle');
  const [voice, setVoice] = useState(null);
  const [supportStatus, setSupportStatus] = useState('checking'); // 'checking' | 'ok' | 'no-tts' | 'no-ko-voice'
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [currentIdx, setCurrentIdx] = useState(-1);

  const paragraphsRef = useRef([]);
  const idxRef = useRef(0);
  const rateRef = useRef(DEFAULT_RATE);
  const stateRef = useRef('idle');
  const autoScrollPausedRef = useRef(false);
  const autoScrollResumeTimerRef = useRef(null);
  const userScrollLastRef = useRef(0);
  const location = useLocation();

  // rate 초기 로드 (마운트 후 한 번)
  useEffect(() => {
    const r = loadRate();
    setRate(r);
    rateRef.current = r;
  }, []);

  // state 최신값을 ref에도 보관 (onend 콜백 안에서 참조)
  useEffect(() => { stateRef.current = state; }, [state]);

  // ── 브라우저 지원 & 한국어 음성 감지 ─────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupportStatus('no-tts');
      return;
    }
    const findKoVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return;
      const ko = voices.find(v => /^ko(-|_|$)/i.test(v.lang));
      if (ko) {
        setVoice(ko);
        setSupportStatus('ok');
      } else {
        setSupportStatus('no-ko-voice');
      }
    };
    findKoVoice();
    window.speechSynthesis.addEventListener('voiceschanged', findKoVoice);
    const timeout = setTimeout(() => {
      if (window.speechSynthesis.getVoices().length === 0) {
        setSupportStatus('no-tts');
      }
    }, 5000);
    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', findKoVoice);
      clearTimeout(timeout);
    };
  }, []);

  // ── 라우트 변경 시 자동 정지 + 하이라이트 제거 ─────
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      clearAllHighlights();
    };
  }, [location.pathname]);

  // ── 컴포넌트 언마운트 시 정지 ────────────────────────
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      clearAllHighlights();
      if (autoScrollResumeTimerRef.current) clearTimeout(autoScrollResumeTimerRef.current);
    };
  }, []);

  // ── 하이라이트 유틸 ────────────────────────────────
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
    // 화면 밖이면 부드럽게 스크롤 (사용자가 직접 스크롤 중이면 잠깐 스킵)
    if (autoScrollPausedRef.current) return;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < 80 || rect.bottom > vh - 80) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);

  // ── 사용자 직접 스크롤 감지 → 자동 스크롤 잠깐 중단 ────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onScroll = () => {
      const now = Date.now();
      // 문단 하이라이트 후 500ms 이내의 스크롤은 자동 스크롤로 간주 (무시)
      if (now - userScrollLastRef.current < 100) return;
      // 그 외 스크롤은 사용자 조작 → 3초간 자동 스크롤 중단
      autoScrollPausedRef.current = true;
      if (autoScrollResumeTimerRef.current) clearTimeout(autoScrollResumeTimerRef.current);
      autoScrollResumeTimerRef.current = setTimeout(() => {
        autoScrollPausedRef.current = false;
      }, 3000);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── 문단 단위 순차 재생 ──────────────────────────────
  const speakNext = useCallback(() => {
    const paras = paragraphsRef.current;
    if (idxRef.current >= paras.length) {
      setState('idle');
      setCurrentIdx(-1);
      idxRef.current = 0;
      clearAllHighlights();
      return;
    }
    const speechIdx = idxRef.current;
    const text = paras[speechIdx];
    // 하이라이트 (본문 문단만 — title/subtitle 오프셋 제외)
    const bodyIdx = speechIndexToBodyIndex(
      { title: article?.title, subtitle: article?.subtitle || article?.summary },
      speechIdx
    );
    setCurrentIdx(speechIdx);
    userScrollLastRef.current = Date.now(); // 자동 스크롤 표시
    highlightBodyIndex(bodyIdx);

    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = 'ko-KR';
    u.rate = rateRef.current;
    u.pitch = 1.0;
    u.onend = () => {
      // 재생 중일 때만 다음으로 진행 (일시정지·정지 후 onend는 무시)
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

  // ── 재생 / 계속재생 ─────────────────────────────────
  const handlePlay = () => {
    if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('playing');
      return;
    }
    // 첫 재생: 낭독문 생성 → 순차 재생
    const paras = articleToSpeech({
      title: article?.title,
      subtitle: article?.subtitle || article?.summary,
      body: article?.content,
    }).filter(Boolean);
    if (paras.length === 0) return;
    paragraphsRef.current = paras;
    idxRef.current = 0;
    window.speechSynthesis.cancel();
    setState('playing');
    // state 업데이트 반영을 기다리지 않고 stateRef도 직접 설정 (onend에서 즉시 참조)
    stateRef.current = 'playing';
    speakNext();
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setState('paused');
    stateRef.current = 'paused';
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setState('idle');
    stateRef.current = 'idle';
    setCurrentIdx(-1);
    idxRef.current = 0;
    clearAllHighlights();
  };

  const handleRestart = () => {
    window.speechSynthesis.cancel();
    // 낭독문 다시 생성 (기사가 바뀌지 않았다면 동일)
    const paras = articleToSpeech({
      title: article?.title,
      subtitle: article?.subtitle || article?.summary,
      body: article?.content,
    }).filter(Boolean);
    if (paras.length === 0) return;
    paragraphsRef.current = paras;
    idxRef.current = 0;
    setState('playing');
    stateRef.current = 'playing';
    speakNext();
  };

  // ── 속도 변경 ───────────────────────────────────────
  // Web Speech API는 재생 중 rate 변경이 반영 안 됨 → 현재 문단을 멈추고
  // 새 rate로 그 문단부터 다시 시작.
  const handleRate = (r) => {
    saveRate(r);
    setRate(r);
    rateRef.current = r;
    if (state !== 'playing') return;
    // 현재 문단부터 재시작
    window.speechSynthesis.cancel();
    // idxRef는 그대로 유지 → 같은 문단부터
    stateRef.current = 'playing';
    // cancel 후 즉시 speak는 브라우저에 따라 딜레이 필요 (사파리)
    setTimeout(() => speakNext(), 60);
  };

  // ── UI ─────────────────────────────────────────────
  if (supportStatus === 'no-tts' || supportStatus === 'no-ko-voice') {
    return (
      <div style={{
        padding: '10px 12px',
        background: '#f7f7f4',
        border: '1px solid #e8e8e8',
        borderRadius: 6,
        fontSize: 13, color: '#595959',
        margin: '16px 0',
      }}>
        이 브라우저에서는 듣기를 지원하지 않습니다.
      </div>
    );
  }
  if (supportStatus === 'checking') return null;

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, minHeight: 44, minWidth: 44, padding: '10px 16px',
    borderRadius: 6, border: `1.5px solid ${NAVY}`,
    background: '#fff', color: NAVY,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  };
  const btnPrimary = { ...btnBase, background: NAVY, color: '#fff' };
  const rateBtn = (r) => ({
    minHeight: 44, minWidth: 44,
    padding: '8px 12px',
    borderRadius: 4,
    border: `1.5px solid ${r === rate ? NAVY : '#c8d2df'}`,
    background: r === rate ? NAVY : '#fff',
    color: r === rate ? '#fff' : NAVY,
    fontSize: 13, fontWeight: 700,
    cursor: 'pointer', fontFamily: 'inherit',
  });

  return (
    <div role="group" aria-label="기사 듣기 컨트롤" style={{
      display: 'flex', flexWrap: 'wrap', gap: 8,
      padding: '12px 14px',
      background: NAVY_INK,
      border: `1px solid #d5deeb`,
      borderRadius: 6,
      margin: '18px 0 22px',
      alignItems: 'center',
    }}>
      <span aria-hidden="true" style={{ fontSize: 16 }}>🔊</span>

      {state === 'idle' && (
        <button type="button" onClick={handlePlay} aria-label="기사 듣기 시작" style={btnPrimary}>
          <span aria-hidden="true">▶</span><span>기사 듣기</span>
        </button>
      )}

      {state === 'playing' && (
        <>
          <button type="button" onClick={handlePause} aria-label="일시정지" style={btnBase}>
            <span aria-hidden="true">⏸</span><span>일시정지</span>
          </button>
          <button type="button" onClick={handleStop} aria-label="정지" style={btnBase}>
            <span aria-hidden="true">⏹</span><span>정지</span>
          </button>
          <button type="button" onClick={handleRestart} aria-label="처음부터 다시" style={btnBase}>
            <span aria-hidden="true">↺</span><span>처음부터</span>
          </button>
        </>
      )}

      {state === 'paused' && (
        <>
          <button type="button" onClick={handlePlay} aria-label="계속 재생" style={btnPrimary}>
            <span aria-hidden="true">▶</span><span>계속 재생</span>
          </button>
          <button type="button" onClick={handleStop} aria-label="정지" style={btnBase}>
            <span aria-hidden="true">⏹</span><span>정지</span>
          </button>
          <button type="button" onClick={handleRestart} aria-label="처음부터 다시" style={btnBase}>
            <span aria-hidden="true">↺</span><span>처음부터</span>
          </button>
        </>
      )}

      {/* 속도 조절 — 항상 노출 (기본값 미리 고르는 것도 허용) */}
      <div role="group" aria-label="재생 속도 선택" style={{
        display: 'inline-flex', gap: 4, alignItems: 'center',
        marginLeft: 6,
      }}>
        <span style={{ fontSize: 12, color: '#555', marginRight: 4 }}>속도</span>
        {RATES.map(r => (
          <button
            key={r}
            type="button"
            onClick={() => handleRate(r)}
            aria-label={`재생 속도 ${r}배`}
            aria-pressed={r === rate}
            style={rateBtn(r)}
          >
            {r}x
          </button>
        ))}
      </div>

      {(state === 'playing' || state === 'paused') && (
        <span
          style={{ fontSize: 12, color: '#595959', marginLeft: 4 }}
          aria-live="polite"
        >
          {state === 'playing' ? '재생 중' : '일시정지됨'}
          {currentIdx >= 0 && paragraphsRef.current.length > 0 &&
            ` · ${currentIdx + 1} / ${paragraphsRef.current.length}문단`}
        </span>
      )}
    </div>
  );
}

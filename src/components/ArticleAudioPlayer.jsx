// ─────────────────────────────────────────────────────────────
// 기사 듣기 (1차 최소 기능)
//
// 지원 브라우저: Web Speech API (window.speechSynthesis)
//   - 크롬(윈도우/맥/안드로이드) · 사파리(맥/아이폰) · 엣지
//   - 파이어폭스는 pause/resume 미지원(브라우저마다 편차 있음) — 정지 후 재시작 필요
//
// 설계 원칙 (지시서 【2】·【4】):
//   1. 첫 재생은 반드시 사용자 클릭 이벤트 안에서 시작 (아이폰 사파리 요구)
//   2. 문단 단위 순차 재생 (안드로이드 크롬 긴 텍스트 중단 회피)
//   3. 다른 기사로 이동 시 자동 정지 (라우트 pathname 변화)
//   4. 한국어 음성이 없으면 조용히 안내만, 에러 팝업 X
//   5. 브라우저 탭 벗어나도 재생 유지 (일시정지 하지 않음)
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { articleToSpeech } from '../lib/tts-transform';

const NAVY = '#0d2d52';
const NAVY_INK = '#e8eef5';

export default function ArticleAudioPlayer({ article }) {
  // state: 'idle' | 'playing' | 'paused'
  const [state, setState] = useState('idle');
  const [voice, setVoice] = useState(null);
  const [supportStatus, setSupportStatus] = useState('checking'); // 'checking' | 'ok' | 'no-tts' | 'no-ko-voice'

  const paragraphsRef = useRef([]);
  const idxRef = useRef(0);
  const location = useLocation();

  // ── 브라우저 지원 & 한국어 음성 감지 ─────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      setSupportStatus('no-tts');
      return;
    }
    const findKoVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return; // 아직 로드 전, voiceschanged 대기
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
    // fallback: 5초 후에도 voices가 안 로드되면 미지원 처리
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

  // ── 라우트 변경(다른 기사로 이동) 시 자동 정지 ─────────
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [location.pathname]);

  // ── 컴포넌트 언마운트 시에도 정지 ────────────────────
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // ── 문단 단위 순차 재생 ─────────────────────────────
  const speakNext = () => {
    const paras = paragraphsRef.current;
    if (idxRef.current >= paras.length) {
      setState('idle');
      idxRef.current = 0;
      return;
    }
    const text = paras[idxRef.current];
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = 'ko-KR';
    u.rate = 1.0;
    u.pitch = 1.0;
    u.onend = () => {
      idxRef.current += 1;
      // cancel() 후에도 onend가 불릴 수 있어 state 재확인
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speakNext();
      }
    };
    u.onerror = (e) => {
      // 사용자가 cancel한 경우도 onerror 호출됨 → interrupted는 정상 흐름
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('TTS error:', e.error);
      }
    };
    window.speechSynthesis.speak(u);
  };

  // ── 재생 / 계속재생 (사용자 클릭 안에서 반드시 speak 호출) ─
  const handlePlay = () => {
    if (state === 'paused') {
      window.speechSynthesis.resume();
      setState('playing');
      return;
    }
    // 첫 재생: 낭독문 생성 후 순차 재생
    const paras = articleToSpeech({
      title: article?.title,
      subtitle: article?.subtitle || article?.summary,
      body: article?.content,
    }).filter(Boolean);
    if (paras.length === 0) return;
    paragraphsRef.current = paras;
    idxRef.current = 0;
    window.speechSynthesis.cancel(); // 잔여 큐 정리
    setState('playing');
    speakNext();
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setState('paused');
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setState('idle');
    idxRef.current = 0;
  };

  // ── UI ────────────────────────────────────────────────
  // 미지원: 조용한 안내 한 줄
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

  // 감지 중: 아무것도 렌더 X (깜빡임 방지)
  if (supportStatus === 'checking') {
    return null;
  }

  const btnBase = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 8, minHeight: 44, padding: '10px 18px',
    borderRadius: 6, border: `1.5px solid ${NAVY}`,
    background: '#fff', color: NAVY,
    fontSize: 14, fontWeight: 700,
    cursor: 'pointer',
    fontFamily: 'inherit',
  };

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
        <button type="button" onClick={handlePlay}
          aria-label="기사 듣기 시작"
          style={{ ...btnBase, background: NAVY, color: '#fff' }}
        >
          <span aria-hidden="true">▶</span>
          <span>기사 듣기</span>
        </button>
      )}

      {state === 'playing' && (
        <>
          <button type="button" onClick={handlePause}
            aria-label="일시정지"
            style={btnBase}>
            <span aria-hidden="true">⏸</span>
            <span>일시정지</span>
          </button>
          <button type="button" onClick={handleStop}
            aria-label="정지"
            style={btnBase}>
            <span aria-hidden="true">⏹</span>
            <span>정지</span>
          </button>
          <span style={{ fontSize: 12, color: '#595959', marginLeft: 4 }} aria-live="polite">
            재생 중
          </span>
        </>
      )}

      {state === 'paused' && (
        <>
          <button type="button" onClick={handlePlay}
            aria-label="계속 재생"
            style={{ ...btnBase, background: NAVY, color: '#fff' }}>
            <span aria-hidden="true">▶</span>
            <span>계속 재생</span>
          </button>
          <button type="button" onClick={handleStop}
            aria-label="정지"
            style={btnBase}>
            <span aria-hidden="true">⏹</span>
            <span>정지</span>
          </button>
          <span style={{ fontSize: 12, color: '#595959', marginLeft: 4 }} aria-live="polite">
            일시정지됨
          </span>
        </>
      )}
    </div>
  );
}

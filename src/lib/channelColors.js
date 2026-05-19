// 이음미디어 7채널 색상 매핑 — Home.jsx / ArticleDetail.jsx 공용
// Tailwind JIT 호환: 클래스 문자열 그대로 박아둠

export const CHANNEL_COLORS = {
  rose:    'bg-rose-100 text-rose-800',
  emerald: 'bg-emerald-100 text-emerald-800',
  sky:     'bg-sky-100 text-sky-800',
  amber:   'bg-amber-100 text-amber-800',
  violet:  'bg-violet-100 text-violet-800',
  orange:  'bg-orange-100 text-orange-800',
  slate:   'bg-slate-100 text-slate-800',
};

// 채널명 → 색상 키 매핑 (Supabase channels 테이블에 color 컬럼 없을 때 fallback)
const NAME_TO_COLOR_KEY = {
  '이음매거진': 'rose',
  '이음로컬':   'emerald',
  '이음에듀':   'sky',
  '이음피플':   'amber',
  '이음트렌드': 'violet',
  '이음보이스': 'orange',
  '이음뷰':     'slate',
};

export function getChannelColorKey(name) {
  return NAME_TO_COLOR_KEY[name] || 'slate';
}

export function getChannelColorClasses(name) {
  return CHANNEL_COLORS[getChannelColorKey(name)];
}

// 채널 border 색상 (좌측 라인용 — ChannelList 헤더 등)
const BORDER_COLORS = {
  rose:    'border-rose-400',
  emerald: 'border-emerald-400',
  sky:     'border-sky-400',
  amber:   'border-amber-400',
  violet:  'border-violet-400',
  orange:  'border-orange-400',
  slate:   'border-slate-400',
};

export function getChannelBorderClass(name) {
  return BORDER_COLORS[getChannelColorKey(name)];
}

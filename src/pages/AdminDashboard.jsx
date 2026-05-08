import { useState } from "react";
import { Link } from "react-router-dom";

const CHANNELS = ["이음매거진","이음로컬","이음에듀","이음피플","이음트렌드","이음보이스","이음뷰"];

const DUMMY_ARTICLES = [
  { id:"1", title:"두피 건강의 비밀, 27년 전문가가 전하는 모발 관리의 모든 것", channel:"이음매거진", author:"정세연", status:"published", created_at:"2026-05-01", views:1240 },
  { id:"2", title:"봄철 두피 트러블, 원인과 해결책 완벽 정리", channel:"이음매거진", author:"정세연", status:"draft", created_at:"2026-04-28", views:0 },
  { id:"3", title:"일산 호수공원 봄 축제, 10만 인파 몰려", channel:"이음로컬", author:"이음로컬팀", status:"published", created_at:"2026-04-25", views:2103 },
  { id:"4", title:"방송스피치사관학교 26기 모집", channel:"이음에듀", author:"이음에듀팀", status:"pending", created_at:"2026-04-20", views:0 },
  { id:"5", title:"두피 전문가 27년, 닥터리부트 정세연 원장 단독 인터뷰", channel:"이음피플", author:"이음피플팀", status:"published", created_at:"2026-04-15", views:3410 },
];

const STATUS = {
  published: { label:"발행됨",  color:"#16a34a", bg:"#dcfce7" },
  draft:     { label:"임시저장", color:"#d97706", bg:"#fef3c7" },
  pending:   { label:"검토중",   color:"#2563eb", bg:"#dbeafe" },
  archived:  { label:"보관됨",   color:"#6b7280", bg:"#f3f4f6" },
};

const tagsOf = (a) => a.tags.split(",").map(t => t.trim()).filter(Boolean);
const LOCATIONS = ["고양시","일산","서울","경기","관악구"];
const hasLoc = (s) => LOCATIONS.some(loc => s.includes(loc));

const CHECKLIST_DATA = {
  // ── STEP 1: 기사의 얼굴 만들기 ─────────────────────────
  c1: {
    label: "제목 (30자 이내)",
    whyHeader: "왜 30자일까요?",
    why: "네이버·구글 검색 결과에서 30자가 넘으면 \"…\"으로 잘려요. 독자가 한 눈에 보고 클릭하게 만들려면 30자가 황금 분량이에요.",
    good: "27년째 골목을 지키는 손 — 닥터리부트 라온 원장의 이야기 (28자)",
    bad: "오늘 일산 닥터리부트 두피관리센터에 갔다왔는데 거기서 정말 좋은 분을 만나서… (잘림)",
    livePreview: (a) => {
      const t = a.title.trim();
      return t ? "현재 " + t.length + "자: \"" + t + "\"" : "(아직 제목을 입력하지 않으셨어요)";
    },
    aiReview: (a) => {
      const t = a.title.trim();
      const L = t.length;
      if (!L) return "제목을 입력하면 AI가 길이·키워드를 검토해 드려요.";
      if (L > 30) return "제목이 " + L + "자입니다. 30자 이내로 줄이면 검색에서 잘리지 않아요.";
      if (L < 10) return "제목이 좀 짧아요. 핵심 키워드를 추가해 더 구체적으로 표현해보세요.";
      if (!hasLoc(t)) return "지역명(고양시·일산 등)을 추가하면 지역 검색 노출이 30% 올라갑니다.";
      return "👍 좋은 제목이에요! 길이도 적당하고 지역 키워드도 포함됐어요.";
    },
    score: (a, ck) => {
      if (ck) return 5;
      const L = a.title.trim().length;
      if (!L) return 0;
      if (L > 30) return 2;
      if (L < 5) return 1;
      if (L < 10) return 2;
      if (L < 20) return 3;
      return hasLoc(a.title) ? 5 : 4;
    },
  },

  c2: {
    label: "첫 문단에 5W 담기 (Who/When/Where/What/Why)",
    whyHeader: "왜 첫 문단에 5W를 다 담아야 할까요?",
    why: "독자도 AI도 첫 문단에서 기사의 핵심을 파악합니다. 5W가 빠지면 ChatGPT가 \"이 기사는 무슨 내용인지 모르겠다\"고 판단해 검색 결과에서 밀려나요.",
    good: "5월 4일 토요일 오후 3시(When), 고양시 일산 봉숭아학당(Where)에서 27기 시민기자 수료식(What)이 열렸다. 이음미디어 정세연 편집국장(Who)은 \"세상을 잇는 기자가 되라\"고 격려했다(Why).",
    bad: "오늘 정말 좋은 행사가 있었어요. 사람도 많고 분위기도 화기애애했답니다.",
    livePreview: (a) => {
      const fp = (a.content.split("\n").find(p => p.trim().length > 0) || "").trim();
      if (!fp) return "(본문을 작성하면 첫 문단이 표시됩니다)";
      return "첫 문단 (" + fp.length + "자):\n\"" + fp.slice(0, 200) + (fp.length > 200 ? "…" : "") + "\"";
    },
    aiReview: (a) => {
      if (a.content.length < 50) return "첫 문단을 작성하면 AI가 5W 누락 여부를 검토해 드려요.";
      return "워드프레스 연동 후 AI가 첫 문단을 직접 분석해 5W 누락 항목을 알려드립니다. (현재는 직접 확인해주세요)";
    },
    score: (a, ck) => ck ? 5 : (a.content.length > 100 ? 2 : 0),
  },

  c3: {
    label: "대표 이미지 설정",
    whyHeader: "왜 이미지가 필수일까요?",
    why: "이미지 없는 기사는 카카오톡·페이스북 공유 시 휑한 회색 박스만 나와요. 클릭률이 70% 떨어집니다. 또 구글 이미지 검색에서 노출되지 않아요.",
    good: "기사와 직접 관련된 가로 사진(1200×630 권장). 인물·현장·물건이 명확히 보이는 사진.",
    bad: "흐릿한 사진, 세로 스마트폰 사진, 인터넷에서 무단 다운로드한 사진(저작권 위반).",
    livePreview: () => "(이미지 업로드 기능은 워드프레스 연동 후 활성화됩니다. 현재는 워드프레스에서 직접 설정해주세요.)",
    aiReview: () => "워드프레스 연동 후 AI가 이미지 품질·alt 텍스트·저작권을 자동 검토합니다.",
    score: (a, ck) => ck ? 5 : 0,
  },

  c4: {
    label: "본문 500자 이상",
    whyHeader: "왜 500자 이상이어야 할까요?",
    why: "구글·네이버는 짧은 글을 \"얕은 콘텐츠\"로 분류해 검색 결과에서 밀어냅니다. 500자는 검색 노출 최소 기준이고, 1500자가 넘으면 \"깊이 있는 기사\"로 평가받아요.",
    good: "현장 묘사 + 인터뷰 인용 + 통계·자료 + 분석. 보통 1000~2000자가 균형 잡힌 분량.",
    bad: "200자 단편으로 \"다녀왔다\"만 적은 글, 또는 5000자 넘게 늘어진 글.",
    livePreview: (a) => {
      const L = a.content.length;
      if (!L) return "(본문을 작성하기 시작하면 글자 수가 표시됩니다)";
      return "현재 " + L + "자 " + (L >= 500 ? "✅ (검색 최적화 통과)" : "→ 500자까지 " + (500 - L) + "자 부족");
    },
    aiReview: (a) => {
      const L = a.content.length;
      if (!L) return "본문 작성을 시작하면 AI가 길이·구조를 검토해 드려요.";
      if (L < 200) return "현재 " + L + "자. 검색 노출 최소 기준(500자)까지 " + (500 - L) + "자 더 필요해요.";
      if (L < 500) return (500 - L) + "자만 더 작성하면 검색 최적화 기준 통과! 인터뷰 인용 한 단락만 추가해도 충분해요.";
      if (L < 1500) return L + "자로 작성됐어요. 1500자 이상이면 \"깊이 있는 기사\"로 평가받을 수 있어요.";
      if (L > 5000) return L + "자 — 너무 길어요. 핵심만 추려 3000자 이내로 줄여보세요.";
      return L + "자 — 충분히 깊이 있는 분량입니다. 👍";
    },
    score: (a, ck) => {
      if (ck) return 5;
      const L = a.content.length;
      if (!L) return 0;
      if (L < 100) return 1;
      if (L < 300) return 2;
      if (L < 500) return 3;
      if (L < 1500) return 4;
      return 5;
    },
  },

  c5: {
    label: "맞춤법·오탈자 확인",
    whyHeader: "왜 맞춤법이 중요할까요?",
    why: "오탈자 한 곳에 독자 신뢰가 깨집니다. \"되요/돼요\", \"갈께요/갈게요\" 같은 흔한 실수가 매체 품격을 떨어뜨려요.",
    good: "네이버 맞춤법 검사기(search.naver.com → \"맞춤법\" 검색)에 본문을 붙여넣고 검사 후 수정 완료.",
    bad: "\"오늘 정말 좋았어요. 다음에 또 오고 싶었구요.\" (구요 → 고요)",
    aiReview: () => "워드프레스 연동 후 AI가 맞춤법·문체·일관성을 자동 검토할 예정입니다.",
    score: (a, ck) => ck ? 5 : 0,
  },

  // ── STEP 2: AI·검색에 잘 노출되게 ─────────────────────
  c6: {
    label: "카테고리(채널) 올바르게 선택",
    badge: "SEO",
    whyHeader: "왜 카테고리가 검색에 영향을 줄까요?",
    why: "이음미디어 7개 채널은 각각 다른 독자층을 타깃합니다. 두피 기사를 \"이음로컬(지역)\"에 발행하면 두피 관심 독자가 못 찾아요.",
    good: "두피·미용·건강 → 이음매거진 / 일산 동네 소식 → 이음로컬 / 봉숭아학당 모집 → 이음에듀",
    bad: "닥터리부트 인터뷰를 \"이음로컬\"에 발행 → 지역 독자만 보게 됨 (라이프스타일 독자 누락)",
    livePreview: (a) => "현재 선택된 채널: " + a.channel,
    aiReview: (a) => {
      const c = (a.content + " " + a.title).toLowerCase ? (a.content + " " + a.title) : "";
      const sigs = [
        { ch: "이음로컬", words: ["고양","일산","축제","주민","동네"] },
        { ch: "이음피플", words: ["인터뷰","원장","대표","선생","박사"] },
        { ch: "이음에듀", words: ["수강","수료","교육","강의","학당"] },
      ];
      if (c.length < 50) return "본문을 작성하면 AI가 적합한 채널을 추천해 드려요.";
      const matches = sigs.filter(s => s.words.some(w => c.includes(w)));
      if (!matches.length) return "본문을 더 작성하면 AI가 채널 추천을 시작해요.";
      if (matches.find(m => m.ch === a.channel)) return "👍 \"" + a.channel + "\" 채널이 본문 키워드와 잘 맞아요.";
      return "본문 키워드를 보면 \"" + matches[0].ch + "\" 채널이 더 적합해 보여요.";
    },
    score: (a, ck) => (ck || a.channel.length > 0) ? 5 : 0,
  },

  c7: {
    label: "태그(키워드) 3개 이상 입력",
    badge: "SEO",
    whyHeader: "태그가 왜 3개 이상이어야 할까요?",
    why: "같은 키워드로 검색하는 독자에게 노출됩니다. 1~2개로는 노출이 거의 안 되고, 5~7개가 적정합니다.",
    good: "고양시, 두피케어, 탈모예방, 닥터리부트, 27년경력 (5개)",
    bad: "일기, 메모 (검색 안 됨) / 이음미디어 (불필요한 자기 태그)",
    livePreview: (a) => {
      const tags = tagsOf(a);
      if (!tags.length) return "(태그를 입력하면 표시됩니다)";
      return tags.length + "개: " + tags.map(t => "#" + t).join(" ");
    },
    aiReview: (a) => {
      const tags = tagsOf(a);
      if (!tags.length) return "태그를 입력하면 AI가 검색 노출 효과를 분석해 드려요.";
      if (tags.length < 3) return "현재 " + tags.length + "개. 최소 3개 이상 입력해야 검색 노출이 시작됩니다.";
      if (tags.length > 10) return tags.length + "개는 너무 많아요. 5~7개가 적정합니다.";
      return tags.length + "개 태그 — 적절합니다. 👍";
    },
    score: (a, ck) => {
      if (ck) return 5;
      const n = tagsOf(a).length;
      if (!n) return 0;
      if (n < 3) return n + 1;
      if (n <= 7) return 5;
      return 4;
    },
  },

  c8: {
    label: "제목에 핵심 키워드 포함",
    badge: "AI",
    whyHeader: "왜 제목 앞쪽에 키워드를 넣어야 할까요?",
    why: "ChatGPT·Perplexity 같은 AI 검색은 제목 앞쪽 단어에 가중치를 둡니다. \"고양시 두피케어 27년…\"으로 시작하면 \"고양시 두피케어\" 검색에 우선 매칭돼요.",
    good: "고양시 두피케어 27년 닥터리부트 정세연 원장 단독 인터뷰",
    bad: "어느 봄날 만난 멋진 분의 이야기 — 고양시 닥터리부트 (키워드가 뒤에)",
    livePreview: (a) => {
      const tags = tagsOf(a);
      if (!a.title || !tags.length) return "(제목과 태그를 모두 입력하면 매칭 분석이 표시됩니다)";
      const matched = tags.filter(t => a.title.includes(t));
      return "제목에 포함된 태그 키워드: " + matched.length + "/" + tags.length + "개" + (matched.length ? " (" + matched.join(", ") + ")" : "");
    },
    aiReview: (a) => {
      const tags = tagsOf(a);
      if (!a.title || !tags.length) return "제목과 태그를 모두 입력하면 AI가 매칭을 분석해 드려요.";
      const matched = tags.filter(t => a.title.includes(t));
      if (!matched.length) return "태그 키워드(" + tags.slice(0,3).join(", ") + ")가 제목에 하나도 없어요. 1~2개라도 제목에 포함시켜보세요.";
      if (matched.length < 2) return "태그 1개만 제목에 포함됐어요. 핵심 키워드 1개 더 추가하면 좋아요.";
      return "👍 제목에 핵심 키워드 " + matched.length + "개가 잘 포함됐어요.";
    },
    score: (a, ck) => {
      if (ck) return 5;
      const tags = tagsOf(a);
      if (!a.title || !tags.length) return 0;
      const matched = tags.filter(t => a.title.includes(t)).length;
      if (!matched) return 1;
      if (matched === 1) return 3;
      return 5;
    },
  },

  c9: {
    label: "기사 요약 (메타 설명) 입력",
    badge: "AI",
    whyHeader: "메타 설명이 왜 검색 노출에 중요할까요?",
    why: "구글·네이버 검색 결과 화면에 제목 아래 표시되는 한 줄 설명입니다. 이 한 줄이 매력적이면 클릭률이 2~3배 올라가요. 비워두면 검색엔진이 어색하게 자동 생성해요.",
    good: "27년 두피전문가 정세연 원장이 알려주는 일산 두피케어의 비밀 — 탈모 예방 핵심 5가지 (60자)",
    bad: "(빈칸으로 두면 본문 첫 줄이 자동 표시되어 어색한 문장이 보임)",
    livePreview: (a) => {
      if (!a.summary.trim()) return "(요약문을 입력하면 표시됩니다)";
      return "현재 " + a.summary.length + "자: \"" + a.summary + "\"";
    },
    aiReview: (a) => {
      const L = a.summary.trim().length;
      if (!L) return "요약문을 입력하면 AI가 길이·매력도를 검토해 드려요.";
      if (L < 30) return "현재 " + L + "자. 너무 짧아요. 핵심 내용을 더 담아 50~80자가 좋아요.";
      if (L > 80) return L + "자입니다. 80자 이내로 줄이면 검색 결과에서 잘리지 않아요.";
      return L + "자 — 적절한 길이입니다. 👍";
    },
    score: (a, ck) => {
      if (ck) return 5;
      const L = a.summary.trim().length;
      if (!L) return 0;
      if (L < 20) return 2;
      if (L < 50) return 3;
      if (L <= 80) return 5;
      return 3;
    },
  },

  c10: {
    label: "대표 이미지 alt 텍스트 입력",
    badge: "SEO",
    whyHeader: "alt 텍스트가 왜 필요할까요?",
    why: "1) 구글 이미지 검색 노출 시 이 텍스트로 매칭됨 2) 시각장애인 독자가 스크린리더로 이미지 내용을 들을 수 있음 3) 인터넷이 느려 이미지가 안 뜰 때 대신 표시됨.",
    good: "고양시 닥터리부트 두피관리센터 정세연 원장이 두피 진단을 하는 모습",
    bad: "사진1, image001.jpg, IMG_0042 (의미 없음)",
    aiReview: () => "워드프레스 연동 후 AI가 이미지를 직접 보고 alt 텍스트 작성을 도와드릴 예정입니다.",
    score: (a, ck) => ck ? 5 : 0,
  },

  // ── STEP 3: 발행 마지막 점검 ─────────────────────────
  c11: {
    label: "사실 관계 다시 한번 확인",
    whyHeader: "왜 사실 확인이 마지막에 한번 더 필요할까요?",
    why: "잘못된 사실이 실리면 정정 보도 + 매체 신뢰도 하락 + 법적 분쟁까지 갈 수 있어요. 발행 후 수정은 어려워요. 발행 전 명함·메모·자료를 다시 펼쳐 확인하세요.",
    good: "취재 메모를 다시 보며 날짜·장소·인물명·숫자를 본문과 대조 / 관공서 자료는 출처 명시",
    bad: "\"5월 4일이었나? 5일이었나?\" 애매한 채로 발행 / 들은 숫자(\"한 200명?\") 그대로 사용",
    aiReview: () => "워드프레스 연동 후 AI가 본문 내 날짜·숫자·고유명사 일관성을 자동 검토할 예정입니다.",
    score: (a, ck) => ck ? 5 : 0,
  },

  c12: {
    label: "취재원 이름·직함 정확",
    whyHeader: "왜 이름이 그렇게 중요할까요?",
    why: "이름 한 글자 틀리면 \"제 이름도 모르고 인터뷰했냐\" 항의 받습니다. 직함도 마찬가지 — \"원장\" vs \"대표\"는 다릅니다. 이음미디어의 신뢰는 디테일에서 옵니다.",
    good: "정세연 (40대, 닥터리부트 라온점 원장 · 두피전문가 27년)",
    bad: "정세현 원장님 (이름 오자) / 정세연 대표 (직함 오류)",
    aiReview: () => "워드프레스 연동 후 AI가 본문 내 인명·직함의 일관성을 자동 검토할 예정입니다.",
    score: (a, ck) => ck ? 5 : 0,
  },

  c13: {
    label: "카카오톡 공유 문구 준비",
    whyHeader: "공유 문구가 왜 별도로 필요할까요?",
    why: "기사 발행만 하고 끝나면 아무도 못 봐요. 발행 직후 카카오톡 채널에 매력적인 문구로 공유해야 클릭이 일어납니다. 미리 준비해두면 바로 보낼 수 있어요.",
    good: "📰 [이음미디어] 27년째 골목을 지키는 손 — 닥터리부트 라온 정세연 원장 이야기 → [링크]",
    bad: "[링크만 덜렁] / \"새 기사 올렸어요~\" (무성의)",
    livePreview: (a) => {
      if (!a.title || !a.channel) return "(제목과 채널을 입력하면 자동 추천 문구가 생성됩니다)";
      return "자동 추천 문구:\n📰 [이음미디어 · " + a.channel + "] " + a.title + " → [발행 후 링크]";
    },
    aiReview: () => "워드프레스 연동 후 AI가 SNS 공유 문구를 자동 생성해 드릴 예정입니다.",
    score: (a, ck) => ck ? 5 : 0,
  },

  c14: {
    label: "인스타그램 해시태그 5개 이상 준비",
    whyHeader: "해시태그가 왜 5개 이상이어야 할까요?",
    why: "인스타그램은 해시태그로 검색됩니다. 1~2개로는 노출이 미미하고, 5~10개가 적정. \"#이음미디어\"는 자기 매체 홍보용으로 필수.",
    good: "#이음미디어 #고양시 #일산 #두피케어 #닥터리부트 #탈모예방 (6개)",
    bad: "#일기 #메모 (관련 없음) / #이음미디어만 (1개)",
    livePreview: (a) => {
      const tags = tagsOf(a);
      if (!tags.length) return "(태그를 입력하면 자동 변환 미리보기가 표시됩니다)";
      const insta = ["#이음미디어"].concat(tags.map(t => "#" + t.replace(/\s+/g, "")));
      return "자동 변환 미리보기 (" + insta.length + "개):\n" + insta.join(" ");
    },
    aiReview: () => "워드프레스 연동 후 AI가 인스타그램 트렌드 해시태그를 추천해 드릴 예정입니다.",
    score: (a, ck) => ck ? 5 : 0,
  },

  c15: {
    label: "편집국장(정세연) 발행 전 승인",
    whyHeader: "왜 편집국장 승인이 필수일까요?",
    why: "이음미디어의 모든 기사는 편집국장의 최종 검토를 거쳐 발행됩니다. 사실 오류·표현·편집 방향을 한번 더 점검해 매체의 일관성과 신뢰를 지키는 절차입니다.",
    good: "카카오톡으로 기사 초안 보내기 → 편집국장 검토 → \"OK\" 응답 받으면 발행",
    bad: "바로 발행 → 오류 발견 → 정정 보도 → 매체 신뢰도 하락",
    aiReview: () => "이 항목은 사람의 검토가 필요한 단계로, AI가 대체할 수 없습니다.",
    score: (a, ck) => ck ? 5 : 0,
  },
};

const CHECKLIST_STAGES = [
  { num:"STEP 1", title:"기사의 얼굴 만들기", icon:"📌", color:"#1c4f8a",
    desc:"독자가 처음 마주하는 부분 — 제목·첫 문단·이미지·본문·맞춤법. 이 5가지가 기사의 첫인상을 결정합니다.",
    itemIds:["c1","c2","c3","c4","c5"] },
  { num:"STEP 2", title:"AI·검색에 잘 노출되게", icon:"🤖", color:"#0e9f6e",
    desc:"구글·네이버·ChatGPT가 당신의 기사를 찾아낼 수 있도록 길을 만들어주는 단계입니다.",
    itemIds:["c6","c7","c8","c9","c10"] },
  { num:"STEP 3", title:"발행 마지막 점검", icon:"📣", color:"#c0392b",
    desc:"발행하기 전 마지막 5가지 — 사실 확인·취재원·SNS 공유·편집국장 승인까지.",
    itemIds:["c11","c12","c13","c14","c15"] },
];

const ALL_IDS = CHECKLIST_STAGES.flatMap(stg => stg.itemIds);
const SEO_IDS = CHECKLIST_STAGES[1].itemIds;

const COMMON_MISTAKES = [
  { num:"1", title:"태그(키워드)를 입력하지 않는 경우",
    desc:"태그 없이 발행하면 검색에 전혀 노출되지 않을 수 있어요. 반드시 3개 이상 입력하세요." },
  { num:"2", title:"대표 이미지를 설정하지 않는 경우",
    desc:"이미지 없이 발행하면 기사 목록에서 눈에 띄지 않아요. 꼭 사진 한 장을 넣으세요." },
  { num:"3", title:"메타 설명(기사 요약)을 비워두는 경우",
    desc:"검색 결과에서 기사 설명이 자동 생성되면 어색한 문장이 나올 수 있어요. 직접 입력하는 것이 훨씬 좋습니다." },
  { num:"4", title:"편집국장 확인 없이 바로 발행하는 경우",
    desc:"이음미디어 기사는 반드시 편집국장 확인 후 발행해야 합니다. 절차를 지켜주세요." },
  { num:"5", title:"카카오·인스타 공유를 깜빡하는 경우",
    desc:"발행 후 SNS 공유를 하지 않으면 아무도 기사를 못 봐요. 발행 즉시 공유 문구를 보내세요." },
];

function Dots({ score, color }) {
  return (
    <span style={{ letterSpacing:"3px", fontSize:"0.95rem", whiteSpace:"nowrap" }}>
      {[0,1,2,3,4].map(i => (
        <span key={i} style={{ color: i < score ? color : "#d1d5db" }}>●</span>
      ))}
    </span>
  );
}

export default function AdminDashboard() {
  const [tab, setTab] = useState("list"); // list | write
  const [articles, setArticles] = useState(DUMMY_ARTICLES);
  const [filterStatus, setFilterStatus] = useState("all");
  const [article, setArticle] = useState({
    title:"", channel:"이음매거진", content:"", summary:"", tags:"", is_sponsored:false
  });
  const [checklist, setChecklist] = useState(
    Object.fromEntries(ALL_IDS.map(id => [id, false]))
  );
  const [collapsed, setCollapsed] = useState({}); // 항목별 펼침/접힘 (기본 펼쳐짐)

  // 폼 입력 → 자동 판정 가능한 항목들 갱신 (수동 항목은 사용자가 직접 토글)
  function autoCheck(a) {
    const tagsCount = tagsOf(a).length;
    const titleLen = a.title.trim().length;
    setChecklist(prev => ({
      ...prev,
      c1: titleLen > 0 && titleLen <= 30,
      c4: a.content.length >= 500,
      c6: a.channel.length > 0,
      c7: tagsCount >= 3,
      c9: a.summary.trim().length > 0,
    }));
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const updated = { ...article, [name]: type === "checkbox" ? checked : value };
    setArticle(updated);
    autoCheck(updated);
  }

  const toggleCheck = (id) => setChecklist(c => ({ ...c, [id]: !c[id] }));
  const toggleCollapse = (id) => setCollapsed(c => ({ ...c, [id]: !c[id] }));

  // 점수 계산
  const itemScore = (id) => CHECKLIST_DATA[id].score(article, checklist[id]);
  const totalSum = ALL_IDS.reduce((acc, id) => acc + itemScore(id), 0);
  const totalPct = Math.round((totalSum / (ALL_IDS.length * 5)) * 100);
  const seoSum = SEO_IDS.reduce((acc, id) => acc + itemScore(id), 0);
  const seoPct = Math.round((seoSum / (SEO_IDS.length * 5)) * 100);
  const totalChecked = ALL_IDS.filter(id => checklist[id]).length;
  const canPublish = totalChecked === ALL_IDS.length && article.title.trim().length > 0 && article.channel.length > 0;
  const filtered = filterStatus === "all" ? articles : articles.filter(a => a.status === filterStatus);

  return (
    <div style={s.page}>
      <main style={s.main}>

        {/* ── 기사 목록 탭 ── */}
        {tab === "list" && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>기사 목록</h1>
              <button onClick={()=>setTab("write")} style={s.writeBtn}>+ 새 기사 작성</button>
            </div>

            <div style={s.filterRow}>
              {[["all","전체"],["published","발행됨"],["draft","임시저장"],["pending","검토중"],["archived","보관됨"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilterStatus(v)}
                  style={{...s.filterBtn,...(filterStatus===v?s.filterActive:{})}}>
                  {l} ({v==="all" ? articles.length : articles.filter(a=>a.status===v).length})
                </button>
              ))}
            </div>

            <div style={s.table}>
              <div style={s.tableHead}>
                <span style={{flex:3}}>제목</span>
                <span style={{flex:1}}>채널</span>
                <span style={{flex:1}}>작성자</span>
                <span style={{flex:1}}>상태</span>
                <span style={{flex:1}}>조회수</span>
                <span style={{flex:1}}>작성일</span>
                <span style={{flex:1}}>관리</span>
              </div>
              {filtered.map(a => (
                <div key={a.id} style={s.tableRow}>
                  <span style={{flex:3, fontWeight:600, color:"#1a2744", fontSize:"0.9rem"}}>{a.title}</span>
                  <span style={{flex:1, fontSize:"0.85rem", color:"#555"}}>{a.channel}</span>
                  <span style={{flex:1, fontSize:"0.85rem", color:"#555"}}>{a.author}</span>
                  <span style={{flex:1}}>
                    <span style={{...s.statusBadge, color:STATUS[a.status].color, background:STATUS[a.status].bg}}>
                      {STATUS[a.status].label}
                    </span>
                  </span>
                  <span style={{flex:1, fontSize:"0.85rem", color:"#888"}}>{a.views.toLocaleString()}</span>
                  <span style={{flex:1, fontSize:"0.82rem", color:"#aaa"}}>{a.created_at}</span>
                  <span style={{flex:1, display:"flex", gap:6}}>
                    <button style={s.editBtn}>수정</button>
                    <button style={s.deleteBtn}>삭제</button>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── 기사 작성 탭 ── */}
        {tab === "write" && (
          <div style={s.writeLayout}>

            {/* 왼쪽: 작성 폼 */}
            <div style={s.writeForm}>
              <div style={s.pageHeader}>
                <h1 style={s.pageTitle}>기사 작성</h1>
                <button onClick={()=>setTab("list")} style={s.backBtn}>← 목록으로</button>
              </div>

              <div style={s.field}>
                <label style={s.label}>제목 * (30자 이내 권장)</label>
                <input name="title" value={article.title} onChange={handleChange}
                  placeholder="예: 27년째 골목을 지키는 손 — 닥터리부트 라온 원장" style={s.input} />
              </div>

              <div style={s.fieldRow}>
                <div style={{...s.field, flex:1}}>
                  <label style={s.label}>채널 *</label>
                  <select name="channel" value={article.channel} onChange={handleChange} style={s.select}>
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{...s.field, flex:1}}>
                  <label style={s.label}>태그 (쉼표로 구분 · 3개 이상)</label>
                  <input name="tags" value={article.tags} onChange={handleChange}
                    placeholder="고양시, 두피케어, 탈모예방" style={s.input} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>요약문 (메타 설명 · 80자 이내)</label>
                <input name="summary" value={article.summary} onChange={handleChange}
                  placeholder="검색·SNS 공유 시 표시되는 한 줄 요약" style={s.input} />
              </div>

              <div style={s.field}>
                <label style={s.label}>본문 * (500자 이상)</label>
                <textarea name="content" value={article.content} onChange={handleChange}
                  placeholder="기사 본문을 입력하세요..." style={s.textarea} rows={15} />
                <span style={s.charCount}>{article.content.length}자 {article.content.length < 500 && <span style={{color:"#ef4444"}}>(500자 이상 필요)</span>}</span>
              </div>

              <div style={s.field}>
                <label style={s.label}>대표 이미지</label>
                <div style={s.uploadBox}>
                  <span style={{fontSize:"2rem"}}>📷</span>
                  <p style={{color:"#888", fontSize:"0.85rem", margin:"8px 0 0"}}>클릭하거나 이미지를 드래그하세요</p>
                  <p style={{color:"#aaa", fontSize:"0.78rem"}}>JPG, PNG, WebP (최대 5MB)</p>
                </div>
              </div>

              <div style={s.sponsoredRow}>
                <input type="checkbox" name="is_sponsored" id="sponsored"
                  checked={article.is_sponsored} onChange={handleChange} />
                <label htmlFor="sponsored" style={{fontSize:"0.88rem", color:"#555"}}>협찬 기사 (AD 표시)</label>
              </div>

              <div style={s.btnRow}>
                <button style={s.draftBtn}>💾 임시저장</button>
                <button style={s.submitBtn}
                  disabled={!canPublish}
                  title={!canPublish ? "체크리스트 15개 + 제목 + 채널을 모두 완료해주세요" : ""}>
                  발행하기 ({totalChecked}/{ALL_IDS.length})
                </button>
              </div>
            </div>

            {/* 오른쪽: 발행 전 체크리스트 */}
            <aside style={s.checklistAside}>

              {/* 헤더 박스 */}
              <div style={s.clHead}>
                <div style={s.clTitle}>📋 발행 전 체크리스트</div>
                <div style={s.clSubtitle}>
                  3단계 · 15가지를 모두 체크하면 발행 준비 완료!<br />
                  각 항목마다 <strong>왜 그런지</strong>·<strong>좋은 예시</strong>·<strong>안 좋은 예시</strong>·<strong>AI 검토</strong>를 함께 보여드려요.
                </div>
              </div>

              {/* 진행률 박스 */}
              <div style={s.progBox}>
                <div style={s.progItem}>
                  <div style={s.progTop}>
                    <span style={s.progLabel}>✅ 기사 완성도</span>
                    <span style={{...s.progPct, color:"#0d2d52"}}>{totalPct}%</span>
                  </div>
                  <div style={s.progBg}>
                    <div style={{...s.progBar, width: totalPct + "%", background:"linear-gradient(90deg,#1c4f8a,#0d2d52)"}}/>
                  </div>
                  <p style={s.progSubdesc}>15개 항목의 품질 점수를 합산한 종합 완성도입니다 (75점 만점).</p>
                </div>
                <div style={{...s.progItem, marginBottom:0}}>
                  <div style={s.progTop}>
                    <span style={s.progLabel}>🤖 AI·검색 최적화</span>
                    <span style={{...s.progPct, color:"#0e9f6e"}}>{seoPct}%</span>
                  </div>
                  <div style={s.progBg}>
                    <div style={{...s.progBar, width: seoPct + "%", background:"linear-gradient(90deg,#0e9f6e,#047857)"}}/>
                  </div>
                  <p style={s.progSubdesc}>구글·네이버·ChatGPT 등 AI 검색 노출 최적화 점수입니다 (STEP 2의 5개 항목 기준).</p>
                </div>
              </div>

              {/* 3단계 섹션들 */}
              {CHECKLIST_STAGES.map(stage => {
                const stageScore = stage.itemIds.reduce((acc, id) => acc + itemScore(id), 0);
                const stageDone = stage.itemIds.filter(id => checklist[id]).length;
                const stageTotal = stage.itemIds.length;
                return (
                  <div key={stage.num} style={s.clSection}>
                    <div style={{...s.clSectionHead, background: stage.color}}>
                      <div style={s.clSectionTitle}>{stage.icon} {stage.num} · {stage.title}</div>
                      <div style={s.clSectionCount}>{stageDone}/{stageTotal}{stageDone === stageTotal ? " ✅" : ""}</div>
                    </div>
                    <div style={s.clSectionDesc}>{stage.desc}</div>

                    {stage.itemIds.map(id => {
                      const item = CHECKLIST_DATA[id];
                      const isOn = checklist[id];
                      const isCollapsed = !!collapsed[id];
                      const score = itemScore(id);
                      return (
                        <div key={id} style={s.itemCard}>
                          {/* 헤더: 체크박스 + 라벨 + 점수 dots */}
                          <div style={s.itemHeader}>
                            <div onClick={()=>toggleCheck(id)}
                              style={{...s.clBox, ...(isOn ? s.clBoxOn : {}), cursor:"pointer"}}>
                              {isOn ? "✓" : ""}
                            </div>
                            <div style={{flex:1, cursor:"pointer"}} onClick={()=>toggleCheck(id)}>
                              <div style={{...s.itemLabel, ...(isOn ? s.itemLabelDone : {})}}>
                                {item.label}
                                {item.badge === "SEO" && <span style={s.seoBadge}>SEO</span>}
                                {item.badge === "AI" && <span style={s.aiBadge}>AI</span>}
                              </div>
                              <div style={s.itemMeta}>
                                <span style={s.itemMetaLabel}>진행률</span>
                                <Dots score={score} color={stage.color} />
                                <span style={s.itemMetaScore}>{score}/5</span>
                              </div>
                            </div>
                            <button onClick={()=>toggleCollapse(id)} style={s.collapseBtn}>
                              {isCollapsed ? "▼ 펼치기" : "▲ 접기"}
                            </button>
                          </div>

                          {/* 펼침 영역 — 부연설명들 */}
                          {!isCollapsed && (
                            <div style={s.itemBody}>
                              <div style={s.whyBox}>
                                <div style={s.sectionTitle}>💡 {item.whyHeader}</div>
                                <div style={s.whyText}>{item.why}</div>
                              </div>
                              <div style={s.goodBox}>
                                <div style={s.sectionTitle}>✏️ 좋은 예시</div>
                                <div style={s.goodText}>{item.good}</div>
                              </div>
                              <div style={s.badBox}>
                                <div style={s.sectionTitle}>❌ 안 좋은 예시</div>
                                <div style={s.badText}>{item.bad}</div>
                              </div>
                              {item.livePreview && (
                                <div style={s.liveBox}>
                                  <div style={s.sectionTitle}>📝 현재 입력 상태</div>
                                  <div style={s.liveText}>{item.livePreview(article)}</div>
                                </div>
                              )}
                              <div style={s.aiBox}>
                                <div style={s.sectionTitle}>🤖 AI 검토 결과</div>
                                <div style={s.aiText}>{item.aiReview(article)}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* 자주 하는 실수 박스 */}
              <div style={s.eduBox}>
                <h4 style={s.eduTitle}>📚 시민기자 필독 · 자주 하는 실수 TOP 5</h4>
                {COMMON_MISTAKES.map(m => (
                  <div key={m.num} style={s.eduItem}>
                    <div style={s.eduNum}>{m.num}</div>
                    <div>
                      <div style={s.eduItemTitle}>{m.title}</div>
                      <div style={s.eduItemDesc}>{m.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  page:        { minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Noto Sans KR',sans-serif" },
  main:        { maxWidth:1400, margin:"0 auto", padding:"28px 24px" },
  pageHeader:  { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24 },
  pageTitle:   { fontFamily:"'Noto Serif KR',serif", fontSize:"1.5rem", fontWeight:700, color:"#0d2d52", margin:0 },
  writeBtn:    { background:"#0d2d52", color:"#fff", border:"none", borderRadius:10, padding:"10px 20px", cursor:"pointer", fontSize:"0.9rem", fontWeight:600, fontFamily:"'Noto Sans KR',sans-serif" },
  backBtn:     { background:"#f1f5f9", color:"#555", border:"1px solid #e2e8f0", borderRadius:10, padding:"8px 16px", cursor:"pointer", fontSize:"0.88rem", fontFamily:"'Noto Sans KR',sans-serif" },
  filterRow:   { display:"flex", gap:8, marginBottom:16, flexWrap:"wrap" },
  filterBtn:   { background:"#fff", border:"1.5px solid #e2e8f0", color:"#666", padding:"7px 14px", borderRadius:20, cursor:"pointer", fontSize:"0.82rem", fontFamily:"'Noto Sans KR',sans-serif" },
  filterActive:{ background:"#0d2d52", color:"#c9a84c", borderColor:"#0d2d52", fontWeight:600 },
  table:       { background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  tableHead:   { display:"flex", padding:"12px 20px", background:"#f8fafc", borderBottom:"1px solid #e2e8f0", fontSize:"0.82rem", fontWeight:600, color:"#888" },
  tableRow:    { display:"flex", padding:"14px 20px", borderBottom:"1px solid #f1f5f9", alignItems:"center" },
  statusBadge: { fontSize:"0.75rem", fontWeight:600, padding:"3px 10px", borderRadius:10 },
  editBtn:     { background:"#f1f5f9", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:"0.78rem", color:"#0d2d52", fontWeight:600 },
  deleteBtn:   { background:"#fee2e2", border:"none", borderRadius:6, padding:"4px 10px", cursor:"pointer", fontSize:"0.78rem", color:"#dc2626", fontWeight:600 },
  writeLayout: { display:"grid", gridTemplateColumns:"1fr 480px", gap:24, alignItems:"start" },
  writeForm:   { background:"#fff", borderRadius:12, padding:"28px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  field:       { display:"flex", flexDirection:"column", gap:6, marginBottom:16 },
  fieldRow:    { display:"flex", gap:16, marginBottom:0 },
  label:       { fontSize:"0.85rem", fontWeight:600, color:"#374151" },
  input:       { border:"1.5px solid #e2e8f0", borderRadius:8, padding:"10px 14px", fontSize:"0.92rem", outline:"none", fontFamily:"'Noto Sans KR',sans-serif" },
  select:      { border:"1.5px solid #e2e8f0", borderRadius:8, padding:"10px 14px", fontSize:"0.92rem", outline:"none", fontFamily:"'Noto Sans KR',sans-serif", background:"#fff" },
  textarea:    { border:"1.5px solid #e2e8f0", borderRadius:8, padding:"12px 14px", fontSize:"0.92rem", outline:"none", fontFamily:"'Noto Sans KR',sans-serif", resize:"vertical", lineHeight:1.7 },
  charCount:   { fontSize:"0.78rem", color:"#aaa", textAlign:"right" },
  uploadBox:   { border:"2px dashed #e2e8f0", borderRadius:10, padding:"32px", textAlign:"center", cursor:"pointer", background:"#f8fafc" },
  sponsoredRow:{ display:"flex", alignItems:"center", gap:8, marginBottom:20 },
  btnRow:      { display:"flex", gap:12, justifyContent:"flex-end" },
  draftBtn:    { background:"#f1f5f9", color:"#374151", border:"1.5px solid #e2e8f0", borderRadius:10, padding:"11px 24px", cursor:"pointer", fontSize:"0.92rem", fontWeight:600, fontFamily:"'Noto Sans KR',sans-serif" },
  submitBtn:   { background:"#0d2d52", color:"#fff", border:"none", borderRadius:10, padding:"11px 28px", cursor:"pointer", fontSize:"0.92rem", fontWeight:700, fontFamily:"'Noto Sans KR',sans-serif" },

  // 발행 전 체크리스트 사이드바
  checklistAside:  { display:"flex", flexDirection:"column", gap:12, position:"sticky", top:80, maxHeight:"calc(100vh - 100px)", overflowY:"auto" },

  clHead:          { background:"linear-gradient(135deg,#0d2d52,#1c4f8a)", color:"white", borderRadius:12, padding:"22px 24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  clTitle:         { fontSize:"1.15rem", fontWeight:700, marginBottom:8, fontFamily:"'Noto Serif KR',serif" },
  clSubtitle:      { fontSize:"0.85rem", opacity:0.88, lineHeight:1.75 },

  progBox:         { background:"#fff", borderRadius:12, padding:"22px 24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  progItem:        { marginBottom:18 },
  progTop:         { display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 },
  progLabel:       { fontSize:"0.92rem", fontWeight:700, color:"#374151" },
  progPct:         { fontSize:"1.6rem", fontWeight:900 },
  progBg:          { height:12, background:"#f3f4f6", borderRadius:10, overflow:"hidden", marginBottom:6 },
  progBar:         { height:"100%", borderRadius:10, transition:"width 0.4s ease" },
  progSubdesc:     { fontSize:"0.8rem", color:"#6b7280", background:"#f9fafb", padding:"8px 12px", borderRadius:6, lineHeight:1.7, borderLeft:"3px solid #e5e7eb", margin:"6px 0 0" },

  clSection:       { background:"#fff", borderRadius:12, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  clSectionHead:   { padding:"14px 20px", display:"flex", justifyContent:"space-between", alignItems:"center" },
  clSectionTitle:  { fontSize:"0.98rem", fontWeight:700, color:"white" },
  clSectionCount:  { fontSize:"0.78rem", color:"rgba(255,255,255,0.85)", background:"rgba(255,255,255,0.2)", padding:"3px 10px", borderRadius:20 },
  clSectionDesc:   { padding:"12px 20px", background:"#f9fafb", borderBottom:"1px solid #f3f4f6", fontSize:"0.84rem", color:"#6b7280", lineHeight:1.75 },

  // 항목 카드
  itemCard:        { padding:"16px 20px", borderBottom:"1px solid #f3f4f6" },
  itemHeader:      { display:"flex", alignItems:"flex-start", gap:14, marginBottom:0 },
  clBox:           { width:28, height:28, borderRadius:8, border:"2px solid #d1d5db", background:"white", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all 0.15s", fontSize:"1rem", marginTop:2 },
  clBoxOn:         { background:"#0d2d52", borderColor:"#0d2d52", color:"white" },
  itemLabel:       { fontSize:"0.95rem", fontWeight:700, color:"#1f2937", lineHeight:1.5, marginBottom:6 },
  itemLabelDone:   { textDecoration:"line-through", color:"#9ca3af" },
  itemMeta:        { display:"flex", alignItems:"center", gap:8, fontSize:"0.78rem", color:"#9ca3af" },
  itemMetaLabel:   { fontSize:"0.75rem", color:"#9ca3af" },
  itemMetaScore:   { fontSize:"0.75rem", color:"#6b7280", fontWeight:700 },
  collapseBtn:     { background:"transparent", border:"1px solid #e5e7eb", borderRadius:6, padding:"3px 8px", fontSize:"0.72rem", color:"#6b7280", cursor:"pointer", whiteSpace:"nowrap", fontFamily:"'Noto Sans KR',sans-serif", flexShrink:0, marginTop:2 },
  itemBody:        { marginTop:14, marginLeft:42 },

  sectionTitle:    { fontSize:"0.82rem", fontWeight:700, marginBottom:6 },

  whyBox:          { background:"#fffbeb", border:"1px solid #fde68a", borderRadius:8, padding:"12px 14px", marginBottom:8 },
  whyText:         { fontSize:"0.85rem", color:"#78350f", lineHeight:1.85, whiteSpace:"pre-line" },

  goodBox:         { background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"12px 14px", marginBottom:8 },
  goodText:        { fontSize:"0.85rem", color:"#166534", lineHeight:1.75, whiteSpace:"pre-line" },

  badBox:          { background:"#fef2f2", border:"1px solid #fecaca", borderRadius:8, padding:"12px 14px", marginBottom:8 },
  badText:         { fontSize:"0.85rem", color:"#991b1b", lineHeight:1.75, whiteSpace:"pre-line" },

  liveBox:         { background:"#eff6ff", border:"1px solid #bfdbfe", borderRadius:8, padding:"12px 14px", marginBottom:8 },
  liveText:        { fontSize:"0.85rem", color:"#1e3a5f", lineHeight:1.75, whiteSpace:"pre-line", fontFamily:"'Noto Sans KR',sans-serif" },

  aiBox:           { background:"#f5f3ff", border:"1px solid #ddd6fe", borderRadius:8, padding:"12px 14px" },
  aiText:          { fontSize:"0.85rem", color:"#5b21b6", lineHeight:1.75, whiteSpace:"pre-line" },

  // 배지
  seoBadge:        { display:"inline-block", background:"#dcfce7", color:"#16a34a", fontSize:"0.65rem", fontWeight:700, padding:"2px 7px", borderRadius:10, marginLeft:6, verticalAlign:"middle" },
  aiBadge:         { display:"inline-block", background:"#ede9fe", color:"#7e3af2", fontSize:"0.65rem", fontWeight:700, padding:"2px 7px", borderRadius:10, marginLeft:6, verticalAlign:"middle" },

  // 자주 하는 실수
  eduBox:          { background:"#fff", borderRadius:12, padding:"22px 24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)" },
  eduTitle:        { fontSize:"0.98rem", fontWeight:700, color:"#0d2d52", paddingBottom:10, borderBottom:"2px solid #0d2d52", margin:"0 0 14px" },
  eduItem:         { display:"flex", gap:12, padding:"10px 0", borderBottom:"1px solid #f3f4f6" },
  eduNum:          { width:24, height:24, background:"#0d2d52", color:"white", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.72rem", fontWeight:700, flexShrink:0, marginTop:1 },
  eduItemTitle:    { fontSize:"0.88rem", fontWeight:700, color:"#374151", marginBottom:4 },
  eduItemDesc:     { fontSize:"0.8rem", color:"#9ca3af", lineHeight:1.7 },
};

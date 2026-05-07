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

export default function AdminDashboard() {
  const [tab, setTab] = useState("list"); // list | write
  const [articles, setArticles] = useState(DUMMY_ARTICLES);
  const [filterStatus, setFilterStatus] = useState("all");
  const [article, setArticle] = useState({
    title:"", channel:"이음매거진", content:"", summary:"", tags:"", is_sponsored:false
  });
  const [checklist, setChecklist] = useState({
    title:false, content:false, image:false, channel:false, tags:false, copyright:false
  });

  // 체크리스트 자동 체크
  function updateChecklist(a) {
    setChecklist({
      title:     a.title.length > 0,
      content:   a.content.length >= 200,
      image:     false, // 이미지 업로드 후 true
      channel:   a.channel.length > 0,
      tags:      a.tags.length > 0,
      copyright: false,
    });
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    const updated = { ...article, [name]: type==="checkbox" ? checked : value };
    setArticle(updated);
    updateChecklist(updated);
  }

  const checkCount = Object.values(checklist).filter(Boolean).length;
  const filtered = filterStatus === "all" ? articles : articles.filter(a => a.status === filterStatus);

  return (
    <div style={s.page}>
      {/* 헤더 */}
      <header style={s.header}>
        <div style={s.headerInner}>
          <Link to="/" style={s.logo}>이음미디어</Link>
          <span style={s.adminBadge}>관리자</span>
          <nav style={s.gnb}>
            <button onClick={()=>setTab("list")} style={{...s.gnbBtn,...(tab==="list"?s.gnbActive:{})}}>📋 기사 목록</button>
            <button onClick={()=>setTab("write")} style={{...s.gnbBtn,...(tab==="write"?s.gnbActive:{})}}>✏️ 기사 작성</button>
          </nav>
          <Link to="/" style={s.siteBtn}>사이트 보기 →</Link>
        </div>
      </header>

      <main style={s.main}>

        {/* ── 기사 목록 탭 ── */}
        {tab === "list" && (
          <div>
            <div style={s.pageHeader}>
              <h1 style={s.pageTitle}>기사 목록</h1>
              <button onClick={()=>setTab("write")} style={s.writeBtn}>+ 새 기사 작성</button>
            </div>

            {/* 상태 필터 */}
            <div style={s.filterRow}>
              {[["all","전체"],["published","발행됨"],["draft","임시저장"],["pending","검토중"],["archived","보관됨"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFilterStatus(v)}
                  style={{...s.filterBtn,...(filterStatus===v?s.filterActive:{})}}>
                  {l} ({v==="all" ? articles.length : articles.filter(a=>a.status===v).length})
                </button>
              ))}
            </div>

            {/* 기사 테이블 */}
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
                <label style={s.label}>제목 *</label>
                <input name="title" value={article.title} onChange={handleChange}
                  placeholder="기사 제목을 입력하세요" style={s.input} />
              </div>

              <div style={s.fieldRow}>
                <div style={{...s.field, flex:1}}>
                  <label style={s.label}>채널 *</label>
                  <select name="channel" value={article.channel} onChange={handleChange} style={s.select}>
                    {CHANNELS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{...s.field, flex:1}}>
                  <label style={s.label}>태그 (쉼표로 구분)</label>
                  <input name="tags" value={article.tags} onChange={handleChange}
                    placeholder="두피, 건강, 모발" style={s.input} />
                </div>
              </div>

              <div style={s.field}>
                <label style={s.label}>요약문</label>
                <input name="summary" value={article.summary} onChange={handleChange}
                  placeholder="기사 요약 (검색/SNS 공유 시 표시)" style={s.input} />
              </div>

              <div style={s.field}>
                <label style={s.label}>본문 * (200자 이상)</label>
                <textarea name="content" value={article.content} onChange={handleChange}
                  placeholder="기사 본문을 입력하세요..." style={s.textarea} rows={15} />
                <span style={s.charCount}>{article.content.length}자 {article.content.length < 200 && <span style={{color:"#ef4444"}}>(200자 이상 필요)</span>}</span>
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
                <button style={s.draftBtn}>임시저장</button>
                <button style={s.submitBtn}
                  disabled={checkCount < 5}
                  title={checkCount < 5 ? "체크리스트를 모두 완료해주세요" : ""}>
                  발행하기 ({checkCount}/6)
                </button>
              </div>
            </div>

            {/* 오른쪽: 체크리스트 */}
            <div style={s.checklistBox}>
              <h3 style={s.checklistTitle}>📋 발행 전 체크리스트</h3>
              <p style={s.checklistDesc}>모든 항목을 확인 후 발행하세요</p>

              <div style={s.checklistProgress}>
                <div style={{...s.progressBar, width:`${(checkCount/6)*100}%`}}/>
              </div>
              <p style={s.progressText}>{checkCount}/6 완료</p>

              {[
                ["title",    "제목 입력",          "기사 제목을 입력해주세요"],
                ["content",  "본문 200자 이상",     "충분한 본문 내용이 필요합니다"],
                ["image",    "대표 이미지 등록",    "썸네일 이미지를 업로드하세요"],
                ["channel",  "채널 선택",           "발행할 채널을 선택해주세요"],
                ["tags",     "태그 입력",           "검색을 위한 태그를 입력하세요"],
                ["copyright","저작권 확인",         "이미지 저작권을 확인하세요"],
              ].map(([key, label, desc]) => (
                <div key={key} style={s.checkItem}>
                  <div style={{...s.checkIcon, background: checklist[key] ? "#16a34a" : "#e5e7eb"}}>
                    {checklist[key] ? "✓" : ""}
                  </div>
                  <div>
                    <p style={{...s.checkLabel, color: checklist[key] ? "#16a34a" : "#374151"}}>{label}</p>
                    {!checklist[key] && <p style={s.checkDesc}>{desc}</p>}
                  </div>
                  {key === "copyright" && (
                    <button onClick={()=>setChecklist(c=>({...c,copyright:!c.copyright}))}
                      style={s.manualCheck}>확인완료</button>
                  )}
                </div>
              ))}

              <div style={s.checklistTip}>
                <p style={{fontSize:"0.8rem", color:"#6b7280", lineHeight:1.6}}>
                  💡 <strong>발행하기</strong> 버튼은 체크리스트 5개 이상 완료 시 활성화됩니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 푸터 */}
      <footer style={s.footer}>
        <div style={s.footerTop}/>
        <div style={s.footerInner}>
          <div style={s.footerLogo}>이음미디어 관리자</div>
          <p style={s.footerCopy}>© 2026 이음미디어. 등록번호: 서울, 이56526</p>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page:        { minHeight:"100vh", background:"#f1f5f9", fontFamily:"'Noto Sans KR',sans-serif" },
  header:      { background:"#0a1628", boxShadow:"0 2px 12px rgba(0,0,0,0.3)", position:"sticky", top:0, zIndex:100 },
  headerInner: { maxWidth:1400, margin:"0 auto", padding:"0 24px", height:60, display:"flex", alignItems:"center", gap:16 },
  logo:        { fontFamily:"'Noto Serif KR',serif", fontSize:"1.2rem", fontWeight:900, color:"#fff", textDecoration:"none" },
  adminBadge:  { background:"#c9a84c", color:"#0a1628", fontSize:"0.72rem", fontWeight:700, padding:"3px 8px", borderRadius:10 },
  gnb:         { display:"flex", gap:4, flex:1, marginLeft:16 },
  gnbBtn:      { background:"none", border:"none", color:"#a0aec0", cursor:"pointer", padding:"6px 16px", borderRadius:20, fontSize:"0.88rem", fontFamily:"'Noto Sans KR',sans-serif" },
  gnbActive:   { background:"rgba(201,168,76,0.2)", color:"#c9a84c", fontWeight:600 },
  siteBtn:     { color:"#c9a84c", fontSize:"0.82rem", textDecoration:"none", whiteSpace:"nowrap" },
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
  writeLayout: { display:"grid", gridTemplateColumns:"1fr 300px", gap:24, alignItems:"start" },
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
  checklistBox:{ background:"#fff", borderRadius:12, padding:"24px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", position:"sticky", top:80 },
  checklistTitle:{ fontFamily:"'Noto Serif KR',serif", fontSize:"1.1rem", fontWeight:700, color:"#0d2d52", margin:"0 0 4px" },
  checklistDesc:{ fontSize:"0.82rem", color:"#888", margin:"0 0 16px" },
  checklistProgress:{ height:8, background:"#e5e7eb", borderRadius:4, overflow:"hidden", marginBottom:6 },
  progressBar: { height:"100%", background:"#16a34a", borderRadius:4, transition:"width 0.3s" },
  progressText:{ fontSize:"0.82rem", color:"#6b7280", textAlign:"right", marginBottom:16 },
  checkItem:   { display:"flex", gap:12, alignItems:"flex-start", padding:"10px 0", borderBottom:"1px solid #f1f5f9" },
  checkIcon:   { width:22, height:22, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"0.75rem", color:"#fff", flexShrink:0, marginTop:2 },
  checkLabel:  { fontSize:"0.88rem", fontWeight:600, margin:0 },
  checkDesc:   { fontSize:"0.78rem", color:"#9ca3af", margin:"2px 0 0" },
  manualCheck: { marginLeft:"auto", background:"#f0fdf4", border:"1px solid #86efac", borderRadius:6, padding:"3px 8px", cursor:"pointer", fontSize:"0.75rem", color:"#16a34a", whiteSpace:"nowrap" },
  checklistTip:{ marginTop:16, padding:"12px", background:"#f8fafc", borderRadius:8 },
  footer:      { background:"#0a1628", marginTop:64 },
  footerTop:   { height:4, background:"linear-gradient(90deg,#c9a84c,#e8c96d,#c9a84c)" },
  footerInner: { maxWidth:1400, margin:"0 auto", padding:"20px 24px", textAlign:"center" },
  footerLogo:  { fontFamily:"'Noto Serif KR',serif", fontSize:"1.1rem", fontWeight:900, color:"#fff" },
  footerCopy:  { fontSize:"0.75rem", color:"#4a5568", marginTop:8 },
};

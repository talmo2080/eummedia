import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", password:"", password2:"", agree:false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.password !== form.password2) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (!form.agree) { setError("이용약관에 동의해주세요."); return; }
    setLoading(true); setError("");
    try {
      // TODO: Supabase Auth 연동 시 아래 주석 해제
      // const { error } = await supabase.auth.signUp({ email: form.email, password: form.password });
      // if (error) throw error;
      alert("회원가입 기능은 Supabase 연동 후 활성화됩니다!");
    } catch (err) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <Link to="/" style={s.logo}>이음미디어</Link>
        <p style={s.slogan}>세상과 당신을 잇는 주간인터넷신문</p>
      </header>

      <main style={s.main}>
        <div style={s.card}>
          <h1 style={s.title}>회원가입</h1>
          <p style={s.subtitle}>이음미디어 회원이 되어보세요</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>이름</label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="실명 입력" style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>이메일</label>
              <input name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="이메일 주소 입력" style={s.input} required />
            </div>
            <div style={s.field}>
              <label style={s.label}>비밀번호</label>
              <input name="password" type="password" value={form.password} onChange={handleChange}
                placeholder="8자 이상 입력" style={s.input} required minLength={8} />
            </div>
            <div style={s.field}>
              <label style={s.label}>비밀번호 확인</label>
              <input name="password2" type="password" value={form.password2} onChange={handleChange}
                placeholder="비밀번호 재입력" style={s.input} required />
            </div>

            <div style={s.agreeRow}>
              <input name="agree" type="checkbox" checked={form.agree} onChange={handleChange} id="agree" />
              <label htmlFor="agree" style={s.agreeLabel}>
                <Link to="/terms" style={s.agreeLink}>이용약관</Link> 및&nbsp;
                <Link to="/privacy" style={s.agreeLink}>개인정보처리방침</Link>에 동의합니다
              </label>
            </div>

            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? "처리 중..." : "회원가입"}
            </button>
          </form>

          <div style={s.loginLink}>
            이미 회원이신가요? <Link to="/login" style={s.link}>로그인</Link>
          </div>
        </div>
      </main>

      <footer style={s.footer}>
        <div style={s.footerTop}/>
        <div style={s.footerInner}>
          <div style={s.footerLogo}>이음미디어</div>
          <p style={s.footerSlogan}>세상과 당신을 잇는 주간인터넷신문</p>
          <div style={s.footerLegal}>
            <span>등록번호: 서울, 이56526</span><span>|</span>
            <span>발행인: 성창운</span><span>|</span>
            <span>편집국장: 정세연</span><span>|</span>
            <span>청소년보호책임자: 정세연</span>
          </div>
          <p style={s.footerAddr}>발행소: 서울시 관악구 남부순환로 1699, 2층 | (주)봉숭아학당문화혁신학교</p>
          <p style={s.footerCopy}>© 2026 이음미디어. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

const s = {
  page:       { minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Noto Sans KR',sans-serif", display:"flex", flexDirection:"column" },
  header:     { background:"#0a1628", padding:"20px 24px", textAlign:"center", borderBottom:"4px solid #c9a84c" },
  logo:       { fontFamily:"'Noto Serif KR',serif", fontSize:"1.8rem", fontWeight:900, color:"#fff", textDecoration:"none", display:"block" },
  slogan:     { color:"#c9a84c", fontSize:"0.82rem", margin:"6px 0 0", letterSpacing:"0.5px" },
  main:       { flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" },
  card:       { background:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:420, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" },
  title:      { fontFamily:"'Noto Serif KR',serif", fontSize:"1.6rem", fontWeight:700, color:"#0d2d52", margin:"0 0 8px", textAlign:"center" },
  subtitle:   { color:"#888", fontSize:"0.88rem", textAlign:"center", margin:"0 0 28px" },
  error:      { background:"#fee2e2", color:"#dc2626", padding:"10px 14px", borderRadius:8, fontSize:"0.85rem", marginBottom:16 },
  form:       { display:"flex", flexDirection:"column", gap:14 },
  field:      { display:"flex", flexDirection:"column", gap:6 },
  label:      { fontSize:"0.85rem", fontWeight:600, color:"#444" },
  input:      { border:"1.5px solid #e2e8f0", borderRadius:10, padding:"12px 14px", fontSize:"0.95rem", outline:"none", fontFamily:"'Noto Sans KR',sans-serif" },
  agreeRow:   { display:"flex", alignItems:"center", gap:8, marginTop:4 },
  agreeLabel: { fontSize:"0.83rem", color:"#555" },
  agreeLink:  { color:"#0d2d52", fontWeight:600, textDecoration:"underline" },
  submitBtn:  { background:"#0d2d52", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontSize:"1rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", marginTop:4 },
  loginLink:  { textAlign:"center", marginTop:20, fontSize:"0.85rem", color:"#888" },
  link:       { color:"#4a6fa5", fontWeight:600, textDecoration:"none" },
  footer:     { background:"#0a1628", fontFamily:"'Noto Sans KR',sans-serif" },
  footerTop:  { height:4, background:"linear-gradient(90deg,#c9a84c,#e8c96d,#c9a84c)" },
  footerInner:{ maxWidth:1200, margin:"0 auto", padding:"28px 24px", textAlign:"center" },
  footerLogo: { fontFamily:"'Noto Serif KR',serif", fontSize:"1.4rem", fontWeight:900, color:"#fff" },
  footerSlogan:{ color:"#c9a84c", fontSize:"0.82rem", margin:"6px 0 16px" },
  footerLegal:{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"6px 12px", fontSize:"0.78rem", color:"#a0aec0", marginBottom:6 },
  footerAddr: { fontSize:"0.75rem", color:"#718096", margin:"4px 0" },
  footerCopy: { fontSize:"0.72rem", color:"#4a5568", marginTop:12 },
};

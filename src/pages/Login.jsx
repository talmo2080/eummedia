import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // TODO: Supabase Auth 연동 시 아래 주석 해제
      // const { error } = await supabase.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      // navigate("/");
      alert("로그인 기능은 Supabase 연동 후 활성화됩니다!");
    } catch (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
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
          <h1 style={s.title}>로그인</h1>
          <p style={s.subtitle}>이음미디어 회원 서비스를 이용하세요</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleLogin} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="이메일 주소 입력"
                style={s.input}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
                style={s.input}
                required
              />
            </div>
            <button type="submit" style={s.loginBtn} disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div style={s.divider}><span>또는</span></div>

          <button style={s.kakaoBtn}>
            <span>💛</span> 카카오로 로그인
          </button>

          <div style={s.links}>
            <Link to="/signup" style={s.link}>회원가입</Link>
            <span style={s.dot}>·</span>
            <Link to="/find-password" style={s.link}>비밀번호 찾기</Link>
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
  form:       { display:"flex", flexDirection:"column", gap:16 },
  field:      { display:"flex", flexDirection:"column", gap:6 },
  label:      { fontSize:"0.85rem", fontWeight:600, color:"#444" },
  input:      { border:"1.5px solid #e2e8f0", borderRadius:10, padding:"12px 14px", fontSize:"0.95rem", outline:"none", fontFamily:"'Noto Sans KR',sans-serif", transition:"border 0.2s" },
  loginBtn:   { background:"#0d2d52", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontSize:"1rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", marginTop:4 },
  divider:    { display:"flex", alignItems:"center", gap:12, margin:"20px 0", color:"#ccc", fontSize:"0.82rem" },
  kakaoBtn:   { width:"100%", background:"#FEE500", color:"#3C1E1E", border:"none", borderRadius:10, padding:"13px", fontSize:"0.95rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  links:      { display:"flex", justifyContent:"center", gap:8, marginTop:20, alignItems:"center" },
  link:       { color:"#4a6fa5", fontSize:"0.85rem", textDecoration:"none" },
  dot:        { color:"#ccc" },
  footer:     { background:"#0a1628", fontFamily:"'Noto Sans KR',sans-serif" },
  footerTop:  { height:4, background:"linear-gradient(90deg,#c9a84c,#e8c96d,#c9a84c)" },
  footerInner:{ maxWidth:1200, margin:"0 auto", padding:"28px 24px", textAlign:"center" },
  footerLogo: { fontFamily:"'Noto Serif KR',serif", fontSize:"1.4rem", fontWeight:900, color:"#fff" },
  footerSlogan:{ color:"#c9a84c", fontSize:"0.82rem", margin:"6px 0 16px" },
  footerLegal:{ display:"flex", flexWrap:"wrap", justifyContent:"center", gap:"6px 12px", fontSize:"0.78rem", color:"#a0aec0", marginBottom:6 },
  footerAddr: { fontSize:"0.75rem", color:"#718096", margin:"4px 0" },
  footerCopy: { fontSize:"0.72rem", color:"#4a5568", marginTop:12 },
};

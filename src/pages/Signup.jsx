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
    </div>
  );
}

const s = {
  page:       { minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Noto Sans KR',sans-serif", display:"flex", flexDirection:"column" },
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
};

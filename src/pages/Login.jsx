import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      navigate("/");
    } catch (err) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
    } finally {
      setLoading(false);
    }
  }

  const handleKakaoLogin = async () => {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: window.location.origin + '/',
      },
    });
    if (error) {
      setError('카카오 로그인 중 오류가 발생했습니다: ' + error.message);
    }
    // 성공 시 Supabase가 카카오 OAuth 페이지로 리다이렉트 → 동의 후
    // redirectTo로 복귀하면 AuthContext가 세션을 감지해 로그인 상태로 전환
  };

  return (
    <div style={s.page}>
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
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  style={{ ...s.input, paddingRight: 50 }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  style={s.eyeBtn}
                  aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
            </div>
            <button type="submit" style={s.loginBtn} disabled={loading}>
              {loading ? "로그인 중..." : "로그인"}
            </button>
          </form>

          <div style={s.divider}><span>또는</span></div>

          <button type="button" onClick={handleKakaoLogin} style={s.kakaoBtn}>
            <span>💛</span> 카카오로 로그인
          </button>

          <div style={s.links}>
            <Link to="/register" style={s.link}>회원가입</Link>
            <span style={s.dot}>·</span>
            <Link to="/find-password" style={s.link}>비밀번호 찾기</Link>
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
  form:       { display:"flex", flexDirection:"column", gap:16 },
  field:      { display:"flex", flexDirection:"column", gap:6 },
  label:      { fontSize:"0.85rem", fontWeight:600, color:"#444" },
  input:      { border:"1.5px solid #e2e8f0", borderRadius:10, padding:"12px 14px", fontSize:"0.95rem", outline:"none", fontFamily:"'Noto Sans KR',sans-serif", transition:"border 0.2s", width:"100%", boxSizing:"border-box" },
  eyeBtn:     { position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", fontSize:20, padding:0, lineHeight:1 },
  loginBtn:   { background:"#0d2d52", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontSize:"1rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", marginTop:4 },
  divider:    { display:"flex", alignItems:"center", gap:12, margin:"20px 0", color:"#ccc", fontSize:"0.82rem" },
  kakaoBtn:   { width:"100%", background:"#FEE500", color:"#3C1E1E", border:"none", borderRadius:10, padding:"13px", fontSize:"0.95rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  links:      { display:"flex", justifyContent:"center", gap:8, marginTop:20, alignItems:"center" },
  link:       { color:"#4a6fa5", fontSize:"0.85rem", textDecoration:"none" },
  dot:        { color:"#ccc" },
};

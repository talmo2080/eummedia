import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

// /register — 일반 독자 회원가입
// 이메일 + 비번 + 닉네임 3필드만. 트리거 handle_new_auth_user()가
// public.users 행을 reader role로 자동 생성. writer_applications INSERT 없음.
// 시민기자 지원은 /signup (Signup.jsx) 별도 흐름.
export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [needsEmailConfirm, setNeedsEmailConfirm] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) { setError("이메일을 입력해주세요."); return; }
    if (password.length < 8) { setError("비밀번호는 8자 이상 입력해주세요."); return; }
    if (nickname.trim().length < 2) { setError("닉네임은 2자 이상 입력해주세요."); return; }

    setLoading(true);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { nickname: nickname.trim() } },
      });
      if (signUpError) throw signUpError;
      if (!data?.user) {
        setError("계정 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
        return;
      }

      // Confirm email 켜진 환경 → session 없음. 이메일 인증 안내.
      if (!data.session) {
        setNeedsEmailConfirm(true);
      }
      // 트리거가 public.users 행 자동 생성 (role='reader' + 닉네임 fallback 체인)
      // 클라이언트는 별도 INSERT 하지 않음
      setSuccess(true);
    } catch (err) {
      const msg = err?.message || "가입 처리 중 오류가 발생했습니다.";
      // 흔한 에러를 친화적으로 변환
      if (/already registered|exists/i.test(msg)) {
        setError("이미 가입된 이메일입니다. 로그인해주세요.");
      } else if (/password/i.test(msg)) {
        setError("비밀번호 조건을 확인해주세요.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }

  const handleKakaoRegister = async () => {
    setError("");
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: { redirectTo: window.location.origin + '/' },
    });
    if (oauthError) {
      setError('카카오 가입 중 오류가 발생했습니다: ' + oauthError.message);
    }
    // 성공 시 카카오 OAuth 페이지로 리다이렉트 → 동의 후 홈 복귀
    // 트리거가 public.users 행 자동 생성
  };

  // ━━ 성공 화면 ━━
  if (success) {
    return (
      <div style={s.page}>
        <main style={s.main}>
          <div style={s.card}>
            <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 12 }}>✅</div>
            <h1 style={s.title}>가입 완료!</h1>
            <p style={s.subtitle}>
              {needsEmailConfirm
                ? <><strong>{email}</strong>로 인증 메일을 보냈습니다.<br />메일함을 확인해 인증 링크를 눌러주세요.</>
                : <>이음미디어 독자 회원으로 가입되었습니다.<br />지금 바로 댓글·구독 등 회원 서비스를 이용하세요.</>}
            </p>
            <button type="button" onClick={() => navigate("/")} style={s.loginBtn}>
              홈으로 가기
            </button>
            {!needsEmailConfirm && (
              <div style={{ ...s.links, marginTop: 16 }}>
                <Link to="/mypage" style={s.link}>마이페이지 가기 →</Link>
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  // ━━ 가입 폼 ━━
  return (
    <div style={s.page}>
      <main style={s.main}>
        <div style={s.card}>
          <h1 style={s.title}>회원가입</h1>
          <p style={s.subtitle}>이음미디어 독자 회원으로 가입하세요</p>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleRegister} style={s.form}>
            <div style={s.field}>
              <label style={s.label}>이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                style={s.input}
                required
              />
            </div>
            <div style={s.field}>
              <label style={s.label}>비밀번호 (8자 이상)</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  style={{ ...s.input, paddingRight: 50 }}
                  required
                  minLength={8}
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
            <div style={s.field}>
              <label style={s.label}>닉네임 (2자 이상)</label>
              <input
                type="text"
                value={nickname}
                onChange={e => setNickname(e.target.value)}
                placeholder="댓글·마이페이지에 표시"
                style={s.input}
                required
                minLength={2}
              />
            </div>
            <button type="submit" style={s.loginBtn} disabled={loading}>
              {loading ? "가입 중..." : "회원가입"}
            </button>
          </form>

          <div style={s.divider}><span>또는</span></div>

          <button type="button" onClick={handleKakaoRegister} style={s.kakaoBtn}>
            <span>💛</span> 카카오로 1초 가입하기
          </button>

          <div style={s.links}>
            <Link to="/login" style={s.link}>로그인</Link>
            <span style={s.dot}>·</span>
            <Link to="/find-password" style={s.link}>비밀번호 찾기</Link>
          </div>
        </div>
      </main>
    </div>
  );
}

const s = {
  page:        { minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Noto Sans KR',sans-serif", display:"flex", flexDirection:"column" },
  main:        { flex:1, display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px" },
  card:        { background:"#fff", borderRadius:16, padding:"40px 36px", width:"100%", maxWidth:420, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" },
  title:       { fontFamily:"'Noto Serif KR',serif", fontSize:"1.6rem", fontWeight:700, color:"#0d2d52", margin:"0 0 8px", textAlign:"center" },
  subtitle:    { color:"#888", fontSize:"0.88rem", textAlign:"center", margin:"0 0 28px", lineHeight:1.7 },
  error:       { background:"#fee2e2", color:"#dc2626", padding:"10px 14px", borderRadius:8, fontSize:"0.85rem", marginBottom:16, lineHeight:1.6 },
  form:        { display:"flex", flexDirection:"column", gap:16 },
  field:       { display:"flex", flexDirection:"column", gap:6 },
  label:       { fontSize:"0.85rem", fontWeight:600, color:"#444" },
  input:       { border:"1.5px solid #e2e8f0", borderRadius:10, padding:"12px 14px", fontSize:"0.95rem", outline:"none", fontFamily:"'Noto Sans KR',sans-serif", transition:"border 0.2s", width:"100%", boxSizing:"border-box" },
  eyeBtn:      { position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", fontSize:20, padding:0, lineHeight:1 },
  loginBtn:    { background:"#0d2d52", color:"#fff", border:"none", borderRadius:10, padding:"13px", fontSize:"1rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", marginTop:4, width:"100%" },
  divider:     { display:"flex", alignItems:"center", justifyContent:"center", gap:12, margin:"20px 0", color:"#ccc", fontSize:"0.82rem" },
  kakaoBtn:    { width:"100%", background:"#FEE500", color:"#3C1E1E", border:"none", borderRadius:10, padding:"13px", fontSize:"0.95rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", display:"flex", alignItems:"center", justifyContent:"center", gap:8 },
  links:       { display:"flex", justifyContent:"center", gap:8, marginTop:20, alignItems:"center" },
  link:        { color:"#4a6fa5", fontSize:"0.85rem", textDecoration:"none" },
  dot:         { color:"#ccc" },
};

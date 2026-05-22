import { useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";

// /signup — 시민기자 지원서
// 회원가입 = 계정 생성 + writer_applications INSERT 한 흐름
export default function Signup() {
  const [form, setForm] = useState({
    // 계정 정보
    email: "",
    password: "",
    password2: "",
    // 지원자 정보
    name: "",
    phone: "",
    region: "",
    // 지원 내용
    qualify: "해당 없음",
    motive: "",
    experience: "",
    agree: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // ━━ 입력 검증 ━━
    if (form.password !== form.password2) {
      setError("비밀번호가 일치하지 않습니다."); return;
    }
    if (form.password.length < 8) {
      setError("비밀번호는 8자 이상 입력해주세요."); return;
    }
    if (!form.name.trim() || !form.phone.trim() || !form.region.trim()) {
      setError("이름·전화번호·지역은 필수 입력입니다."); return;
    }
    if (form.motive.trim().length < 50) {
      setError("지원 동기는 최소 50자 이상 작성해주세요."); return;
    }
    if (!form.agree) {
      setError("이용약관 및 개인정보처리방침에 동의해주세요."); return;
    }

    setLoading(true);
    try {
      // 1. 계정 생성 (Supabase Auth)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { name: form.name } },
      });
      if (signUpError) throw signUpError;
      if (!data?.user) {
        throw new Error("계정 생성에 실패했습니다. 잠시 후 다시 시도해주세요.");
      }

      // ★ session 안전장치 — Confirm email 켜진 환경에서는 session=null
      //    이 상태로 후속 INSERT 시 RLS(authenticated) 차단 발생 → 폼 글 사라짐 방지
      if (!data.session) {
        setError(
          "이메일 인증이 필요한 환경입니다.\n" +
          "운영자에게 문의해주세요 (press@eummedia.kr).\n\n" +
          "작성하신 신청서 내용은 그대로 보존됩니다."
        );
        return;
      }

      // 2. users 테이블 INSERT (role='reader' default 유지) — 에러 체크 추가
      const { error: usersError } = await supabase.from('users').insert({
        id: data.user.id,
        nickname: form.name,
        email: form.email,
        role: 'reader',
      });
      if (usersError) {
        setError(
          `회원 정보 저장에 실패했습니다.\n` +
          `${usersError.message}\n\n` +
          `작성하신 신청서 내용은 그대로 보존됩니다.\n` +
          `잠시 후 [✍️ 시민기자 신청하기]를 다시 눌러주세요.`
        );
        return;
      }

      // 3. writer_applications INSERT — 시민기자 지원서
      const { error: appError } = await supabase.from('writer_applications').insert({
        user_id: data.user.id,
        name: form.name.trim(),
        phone: form.phone.trim(),
        region: form.region.trim(),
        qualify: form.qualify,
        motive: form.motive.trim(),
        experience: form.experience.trim() || null,
      });
      if (appError) {
        setError(
          `신청서 제출에 실패했습니다.\n` +
          `${appError.message}\n\n` +
          `작성하신 신청서 내용은 그대로 보존됩니다.\n` +
          `잠시 후 [✍️ 시민기자 신청하기]를 다시 눌러주세요.`
        );
        return;
      }

      setSuccess(true);
    } catch (err) {
      setError(
        (err?.message || "신청 처리 중 오류가 발생했습니다.") +
        "\n\n작성하신 신청서 내용은 그대로 보존됩니다."
      );
    } finally {
      setLoading(false);
    }
  }

  // ━━ 신청 완료 화면 ━━
  if (success) {
    return (
      <div style={s.page}>
        <main style={s.main}>
          <div style={s.card}>
            <div style={{ fontSize: 56, textAlign: 'center', marginBottom: 12 }}>✅</div>
            <h1 style={s.title}>시민기자 신청이<br/>접수되었습니다</h1>
            <p style={s.subtitle}>
              편집국장이 검토 후 <strong>1-3일 이내</strong>에 연락드립니다.<br /><br />
              승인되면 로그인하여<br/>기사를 작성하실 수 있습니다.
            </p>
            <Link to="/" style={s.btnLink}>홈으로</Link>
          </div>
        </main>
      </div>
    );
  }

  // ━━ 지원서 폼 ━━
  return (
    <div style={s.page}>
      <main style={s.main}>
        <div style={s.card}>
          <h1 style={s.title}>✍️ 시민기자 지원</h1>
          <div style={s.intro}>
            이음미디어 시민기자로 활동하고 싶으신가요?<br />
            아래 지원서를 작성해주세요.<br />
            <strong>편집국장 승인 후 기사를 쓰실 수 있습니다.</strong>
          </div>

          {error && <div style={s.error}>{error}</div>}

          <form onSubmit={handleSubmit} style={s.form}>
            {/* ━━ 계정 정보 ━━ */}
            <Section title="계정 정보">
              <Field label="이메일" required>
                <input name="email" type="email" value={form.email}
                  onChange={handleChange} style={s.input} required
                  placeholder="example@email.com" />
              </Field>
              <Field label="비밀번호 (8자 이상)" required>
                <div style={{ position: 'relative' }}>
                  <input name="password" type={showPassword ? 'text' : 'password'}
                    value={form.password} onChange={handleChange}
                    style={{ ...s.input, paddingRight: 56 }} required minLength={8} />
                  <button type="button" onClick={() => setShowPassword(v => !v)}
                    style={s.eyeBtn} aria-label="비밀번호 보기 전환">
                    {showPassword ? '🙈' : '👁'}
                  </button>
                </div>
              </Field>
              <Field label="비밀번호 확인" required>
                <div style={{ position: 'relative' }}>
                  <input name="password2" type={showPassword2 ? 'text' : 'password'}
                    value={form.password2} onChange={handleChange}
                    style={{ ...s.input, paddingRight: 56 }} required />
                  <button type="button" onClick={() => setShowPassword2(v => !v)}
                    style={s.eyeBtn} aria-label="비밀번호 보기 전환">
                    {showPassword2 ? '🙈' : '👁'}
                  </button>
                </div>
              </Field>
            </Section>

            {/* ━━ 지원자 정보 ━━ */}
            <Section title="지원자 정보">
              <Field label="이름 (실명)" required>
                <input name="name" value={form.name} onChange={handleChange}
                  style={s.input} required placeholder="예: 정세연" />
              </Field>
              <Field label="전화번호" required>
                <input name="phone" type="tel" value={form.phone} onChange={handleChange}
                  style={s.input} required placeholder="010-0000-0000" />
              </Field>
              <Field label="지역" required>
                <input name="region" value={form.region} onChange={handleChange}
                  style={s.input} required placeholder="예: 고양시 일산" />
              </Field>
            </Section>

            {/* ━━ 지원 내용 ━━ */}
            <Section title="지원 내용">
              <Field label="봉숭아학당문화혁신학교">
                <select name="qualify" value={form.qualify} onChange={handleChange}
                  style={s.input}>
                  <option value="해당 없음">해당 없음</option>
                  <option value="재학중">재학중</option>
                  <option value="수료">수료</option>
                </select>
              </Field>
              <Field label="지원 동기 (최소 50자)" required>
                <textarea name="motive" value={form.motive} onChange={handleChange}
                  style={{ ...s.input, minHeight: 130, lineHeight: 1.7, resize: 'vertical' }}
                  required minLength={50}
                  placeholder="왜 이음미디어 시민기자로 활동하고 싶으신가요? (50자 이상)" />
                <div style={{
                  textAlign: 'right', fontSize: 14, fontWeight: 600, marginTop: 4,
                  color: form.motive.trim().length >= 50 ? '#1a6b3c' : '#888',
                }}>
                  {form.motive.trim().length}자
                  {form.motive.trim().length < 50 ? ' (50자 이상 필요)' : ' ✓'}
                </div>
              </Field>
              <Field label="경험 (선택)">
                <textarea name="experience" value={form.experience} onChange={handleChange}
                  style={{ ...s.input, minHeight: 100, lineHeight: 1.7, resize: 'vertical' }}
                  placeholder="글쓰기·취재·블로그·SNS 활동 등 경험을 자유롭게 적어주세요" />
              </Field>
            </Section>

            {/* ━━ 약관 동의 ━━ */}
            <div style={s.agreeRow}>
              <input name="agree" type="checkbox" checked={form.agree}
                onChange={handleChange} id="agree" style={s.checkbox} />
              <label htmlFor="agree" style={s.agreeLabel}>
                <Link to="/terms" style={s.agreeLink}>이용약관</Link> 및&nbsp;
                <Link to="/privacy" style={s.agreeLink}>개인정보처리방침</Link>에 동의합니다
              </label>
            </div>

            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? "처리 중..." : "✍️ 시민기자 신청하기"}
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

// ━━ 보조 컴포넌트 ━━
function Section({ title, children }) {
  return (
    <div style={s.section}>
      <div style={s.sectionTitle}>{title}</div>
      <div style={s.sectionBody}>{children}</div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div style={s.field}>
      <label style={s.label}>
        {label} {required && <span style={{ color: '#c0392b' }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const s = {
  page:        { minHeight:"100vh", background:"#f5f7fa", fontFamily:"'Noto Sans KR',sans-serif", display:"flex", flexDirection:"column" },
  main:        { flex:1, display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"40px 24px" },
  card:        { background:"#fff", borderRadius:16, padding:"36px 32px", width:"100%", maxWidth:560, boxShadow:"0 4px 24px rgba(0,0,0,0.08)" },
  title:       { fontFamily:"'Noto Serif KR',serif", fontSize:"1.7rem", fontWeight:700, color:"#0d2d52", margin:"0 0 14px", textAlign:"center", lineHeight:1.35 },
  intro:       { color:"#333", fontSize:"15px", lineHeight:1.7, textAlign:"center", margin:"0 0 24px", padding:"14px 16px", background:"#f5f9ff", border:"1px solid #c5dbf7", borderRadius:8 },
  subtitle:    { color:"#444", fontSize:"16px", lineHeight:1.8, textAlign:"center", margin:"0 0 24px" },
  error:       { background:"#fee2e2", color:"#dc2626", padding:"12px 16px", borderRadius:8, fontSize:"15px", marginBottom:16, lineHeight:1.6, whiteSpace:"pre-wrap" },
  form:        { display:"flex", flexDirection:"column", gap:24 },
  section:     { display:"flex", flexDirection:"column", gap:12 },
  sectionTitle:{ fontFamily:"'Noto Serif KR',serif", fontSize:"1.1rem", fontWeight:700, color:"#0d2d52", paddingBottom:8, borderBottom:"2px solid #0d2d52" },
  sectionBody: { display:"flex", flexDirection:"column", gap:14 },
  field:       { display:"flex", flexDirection:"column", gap:6 },
  label:       { fontSize:"16px", fontWeight:600, color:"#222" },
  input:       { border:"1.5px solid #d0d7e2", borderRadius:8, padding:"14px 14px", fontSize:"16px", minHeight:48, outline:"none", fontFamily:"'Noto Sans KR',sans-serif", width:"100%", boxSizing:"border-box", lineHeight:1.4 },
  eyeBtn:      { position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", background:"transparent", border:"none", cursor:"pointer", fontSize:22, padding:0, lineHeight:1 },
  agreeRow:    { display:"flex", alignItems:"center", gap:10, marginTop:4 },
  checkbox:    { width:22, height:22, cursor:"pointer" },
  agreeLabel:  { fontSize:"15px", color:"#333", lineHeight:1.5 },
  agreeLink:   { color:"#0d2d52", fontWeight:600, textDecoration:"underline" },
  submitBtn:   { background:"#0d2d52", color:"#fff", border:"none", borderRadius:10, padding:"16px", fontSize:"1.05rem", fontWeight:700, cursor:"pointer", fontFamily:"'Noto Sans KR',sans-serif", marginTop:8, minHeight:56 },
  btnLink:     { display:"block", textAlign:"center", background:"#0d2d52", color:"#fff", borderRadius:10, padding:"16px", fontSize:"1.05rem", fontWeight:700, textDecoration:"none", fontFamily:"'Noto Sans KR',sans-serif", marginTop:20, minHeight:56, boxSizing:"border-box" },
  loginLink:   { textAlign:"center", marginTop:24, fontSize:"15px", color:"#666" },
  link:        { color:"#0d2d52", fontWeight:700, textDecoration:"none" },
};

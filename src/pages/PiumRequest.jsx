import { useState } from "react";
import { Link } from "react-router-dom";

const GREEN = "#166534";
const GREEN_LIGHT = "#f0fdf4";
const GREEN_BORDER = "#bbf7d0";

export default function PiumRequest() {
  const [form, setForm] = useState({ name: "", contact: "", description: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | done | error

  function handleChange(e) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.contact.trim() || !form.description.trim()) return;
    setStatus("sending");
    try {
      const res = await fetch("/api/pium-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    fontSize: 15,
    border: "1.5px solid #d1d5db",
    borderRadius: 6,
    fontFamily: "'Noto Sans KR', sans-serif",
    boxSizing: "border-box",
    outline: "none",
    color: "#1a1a1a",
    background: "#fff",
  };

  const labelStyle = {
    display: "block",
    fontSize: 14,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 6,
  };

  return (
    <div style={{
      minHeight: "70vh",
      background: GREEN_LIGHT,
      padding: "48px 20px 64px",
      fontFamily: "'Noto Sans KR', sans-serif",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto" }}>

        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <Link to="/pium" style={{ textDecoration: "none" }}>
            <img src="/pium-logo.png" alt="피움앱 로고"
                 style={{ height: 52, width: "auto", objectFit: "contain", marginBottom: 16 }} />
          </Link>
          <h1 style={{
            fontSize: 26,
            fontWeight: 900,
            color: GREEN,
            margin: "0 0 12px",
            lineHeight: 1.3,
          }}>
            필요한 앱, 만들어드려요 🌱
          </h1>
          <p style={{
            fontSize: 15,
            color: "#3d5a3e",
            lineHeight: 1.8,
            margin: 0,
          }}>
            매장·업무·취미 — 필요한 웹앱을 직접 제작해드립니다.<br />
            아래로 편하게 문의 주세요.
          </p>
        </div>

        {/* 폼 또는 완료 메시지 */}
        {status === "done" ? (
          <div style={{
            background: "#fff",
            border: `2px solid ${GREEN_BORDER}`,
            borderRadius: 10,
            padding: "36px 28px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🌱</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: GREEN, marginBottom: 10 }}>
              문의가 접수됐어요!
            </div>
            <div style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.8, marginBottom: 24 }}>
              빠르게 확인 후 연락드릴게요.<br />
              피움앱을 찾아주셔서 감사합니다.
            </div>
            <Link to="/" style={{
              display: "inline-block",
              background: GREEN,
              color: "#fff",
              textDecoration: "none",
              fontSize: 14,
              fontWeight: 700,
              padding: "10px 24px",
              borderRadius: 6,
              fontFamily: "inherit",
            }}>
              이음미디어 홈으로 →
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{
            background: "#fff",
            border: `1.5px solid ${GREEN_BORDER}`,
            borderRadius: 10,
            padding: "28px 24px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}>

            <div>
              <label style={labelStyle} htmlFor="name">이름 *</label>
              <input
                id="name"
                name="name"
                type="text"
                placeholder="홍길동"
                value={form.name}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="contact">연락처 *</label>
              <input
                id="contact"
                name="contact"
                type="text"
                placeholder="전화번호 또는 이메일"
                value={form.contact}
                onChange={handleChange}
                required
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle} htmlFor="description">어떤 앱이 필요하신가요? *</label>
              <textarea
                id="description"
                name="description"
                placeholder={"예) 우리 카페 메뉴판 앱이 필요해요.\n손님이 QR 찍으면 메뉴 보고 주문까지 할 수 있으면 좋겠어요."}
                value={form.description}
                onChange={handleChange}
                required
                rows={6}
                style={{ ...inputStyle, resize: "vertical", lineHeight: 1.7 }}
              />
            </div>

            {status === "error" && (
              <div style={{
                padding: "10px 14px",
                background: "#fef2f2",
                border: "1px solid #fca5a5",
                borderRadius: 6,
                fontSize: 13,
                color: "#dc2626",
              }}>
                전송 중 오류가 발생했어요. 잠시 후 다시 시도해 주세요.
              </div>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              style={{
                background: status === "sending" ? "#4ade80" : GREEN,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "13px",
                fontSize: 16,
                fontWeight: 800,
                cursor: status === "sending" ? "default" : "pointer",
                fontFamily: "'Noto Sans KR', sans-serif",
                transition: "background 0.2s",
              }}
            >
              {status === "sending" ? "전송 중…" : "문의 보내기"}
            </button>

            <p style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", margin: 0 }}>
              입력하신 정보는 문의 확인 목적으로만 사용됩니다.
            </p>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: 24 }}>
          <Link to="/pium" style={{ fontSize: 13, color: "#9ca3af", textDecoration: "none", fontWeight: 600 }}>
            ← 피움앱으로
          </Link>
        </div>
      </div>
    </div>
  );
}

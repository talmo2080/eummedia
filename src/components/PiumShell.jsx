import { Outlet } from "react-router-dom";
import PiumHeader from "./PiumHeader";
import PiumFooter from "./PiumFooter";

export default function PiumShell() {
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>

      {/* 고정 배경 이미지 레이어 */}
      <div style={{
        position: "fixed",
        inset: 0,
        backgroundImage: "url('/pium-hero.png')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        zIndex: 0,
      }} />

      {/* 반투명 컬러 오버레이 (회로 배경이 은은하게 비치도록) */}
      <div style={{
        position: "fixed",
        inset: 0,
        background: "rgba(236,253,245,0.58)",
        zIndex: 1,
      }} />

      {/* 콘텐츠 레이어 */}
      <div style={{
        position: "relative",
        zIndex: 2,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}>
        <PiumHeader />
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <PiumFooter />
      </div>

    </div>
  );
}

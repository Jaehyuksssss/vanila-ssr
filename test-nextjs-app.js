/**
 * Next.js App Router용 테스트 페이지
 * app/test-css/page.js 파일로 저장하여 사용하세요.
 */

"use client";

import { useEffect } from "react";

export default function CSSTestPage() {
  useEffect(() => {
    // CSS 테스트 실행
    runCSSTest();
  }, []);

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1> Vanilla SSR CSS 테스트</h1>
      <p>
        이 페이지는 vanilla-ssr의 CSS가 제대로 로드되는지 테스트합니다.
      </p>

      {/* CSS 로드 상태 확인 */}
      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
        }}
      >
        <h2>1. CSS 로드 확인</h2>
        <div
          id="css-status"
          style={{
            padding: "10px",
            background: "#f8f9fa",
            borderRadius: "4px",
          }}
        >
          CSS 로드 상태를 확인하는 중...
        </div>
      </div>

      {/* 컴포넌트 테스트 */}
      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
        }}
      >
        <h2>2. 컴포넌트 스타일 테스트</h2>

        {/* Badge 테스트 */}
        <div style={{ margin: "10px 0" }}>
          <strong>Badge 컴포넌트:</strong>
          <br />
          <span className="vanila-badge vanila-badge--success">성공</span>
          <span className="vanila-badge vanila-badge--warning">경고</span>
          <span className="vanila-badge vanila-badge--danger">위험</span>
          <span className="vanila-badge vanila-badge--info">정보</span>
        </div>

        {/* Button 테스트 */}
        <div style={{ margin: "10px 0" }}>
          <strong>Button 컴포넌트:</strong>
          <br />
          <button className="btn-primary" style={{ margin: "5px" }}>
            Primary Button
          </button>
          <button className="btn-secondary" style={{ margin: "5px" }}>
            Secondary Button
          </button>
        </div>

        {/* Modal 테스트 */}
        <div style={{ margin: "10px 0" }}>
          <strong>Modal 컴포넌트:</strong>
          <br />
          <div
            className="modal-wrapper"
            style={{ position: "relative", display: "block" }}
          >
            <div className="modal">
              <div className="modal-title">테스트 모달</div>
              <div className="modal-message">CSS가 제대로 적용되었습니다!</div>
              <div className="modal-actions">
                <button className="btn-primary">확인</button>
                <button className="btn-secondary">취소</button>
              </div>
            </div>
          </div>
        </div>

        {/* Card 테스트 */}
        <div style={{ margin: "10px 0" }}>
          <strong>Card 컴포넌트:</strong>
          <br />
          <div className="card" style={{ maxWidth: "300px" }}>
            <div className="card-content">
              <div className="card-title">테스트 카드</div>
              <div className="card-description">
                shadcn/ui 스타일이 적용되었습니다.
              </div>
              <button className="card-button">액션</button>
            </div>
          </div>
        </div>

        {/* Input 테스트 */}
        <div style={{ margin: "10px 0" }}>
          <strong>Input 컴포넌트:</strong>
          <br />
          <div className="input-field">
            <label className="input-field__label">이름</label>
            <div className="input-field__control">
              <input
                className="input-field__input"
                placeholder="이름을 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* Status Dot 테스트 */}
        <div style={{ margin: "10px 0" }}>
          <strong>Status Dot 컴포넌트:</strong>
          <br />
          <span className="vanila-status">
            <span className="vanila-status__dot vanila-status__dot--green"></span>
            <span className="vanila-status__label">온라인</span>
          </span>
          <span className="vanila-status">
            <span className="vanila-status__dot vanila-status__dot--red"></span>
            <span className="vanila-status__label">오프라인</span>
          </span>
        </div>
      </div>

      {/* 다크모드 테스트 */}
      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
        }}
      >
        <h2>3. 다크모드 테스트</h2>
        <button id="toggle-theme" className="btn-primary">
          다크모드 토글
        </button>
        <div id="theme-status" style={{ marginTop: "10px" }}></div>
      </div>

      {/* CSS 변수 값 확인 */}
      <div
        style={{
          margin: "20px 0",
          padding: "15px",
          border: "1px solid #e0e0e0",
          borderRadius: "6px",
        }}
      >
        <h2>4. CSS 변수 값 확인</h2>
        <div
          id="css-vars"
          style={{
            fontFamily: "monospace",
            fontSize: "12px",
            background: "#f8f9fa",
            padding: "10px",
            borderRadius: "4px",
          }}
        ></div>
      </div>
    </div>
  );
}

// CSS 테스트 함수
function runCSSTest() {
  if (typeof window === "undefined") return;

  // CSS 로드 확인
  function checkCSSLoaded() {
    const cssStatus = document.getElementById("css-status");
    if (!cssStatus) return;

    // CSS 파일 로드 확인
    const stylesheets = Array.from(document.styleSheets);
    const vanilaCSS = stylesheets.find(
      (sheet) => sheet.href && sheet.href.includes("vanilla-ssr")
    );

    // CSS 변수 확인
    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const primaryColor = computedStyle.getPropertyValue("--primary");
    const backgroundColor = computedStyle.getPropertyValue("--background");

    let status = "";
    if (vanilaCSS && primaryColor && backgroundColor) {
      status = "✅ CSS가 성공적으로 로드되었습니다!";
      cssStatus.style.color = "#22c55e";
    } else {
      status = "❌ CSS 로드에 실패했습니다.";
      cssStatus.style.color = "#ef4444";
    }

    cssStatus.innerHTML = status;
  }

  // CSS 변수 값 표시
  function displayCSSVars() {
    const cssVars = document.getElementById("css-vars");
    if (!cssVars) return;

    const root = document.documentElement;
    const computedStyle = getComputedStyle(root);
    const vars = [
      "--primary",
      "--background",
      "--foreground",
      "--success",
      "--warning",
      "--danger",
      "--border",
      "--radius-md",
    ];

    const varDisplay = vars
      .map((varName) => {
        const value = computedStyle.getPropertyValue(varName);
        return `${varName}: ${value || "NOT FOUND"}`;
      })
      .join("<br>");

    cssVars.innerHTML = varDisplay;
  }

  // 다크모드 토글
  function toggleTheme() {
    const root = document.documentElement;
    const currentTheme = root.getAttribute("data-vanila-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";

    root.setAttribute("data-vanila-theme", newTheme);
    const themeStatus = document.getElementById("theme-status");
    if (themeStatus) {
      themeStatus.textContent = `현재 테마: ${newTheme}`;
    }

    // CSS 변수 다시 표시
    setTimeout(displayCSSVars, 100);
  }

  // 이벤트 리스너 등록
  const toggleButton = document.getElementById("toggle-theme");
  if (toggleButton) {
    toggleButton.addEventListener("click", toggleTheme);
  }

  // 초기 실행
  checkCSSLoaded();
  displayCSSVars();

  // 초기 테마 상태 표시
  const root = document.documentElement;
  const currentTheme = root.getAttribute("data-vanila-theme") || "light";
  const themeStatus = document.getElementById("theme-status");
  if (themeStatus) {
    themeStatus.textContent = `현재 테마: ${currentTheme}`;
  }
}

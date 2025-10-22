# Next.js 사용 가이드

## 설치

```bash
npm install vanilla-ssr@latest
```

## 기본 사용법

### 1. CSS 임포트

**pages/\_app.js** (Pages Router):

```javascript
import "vanilla-ssr/styles.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

**app/layout.js** (App Router):

```javascript
import "vanilla-ssr/styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

### 2. 전역 설정(CSP/스타일/디버그)

App Router(`app/`)의 레이아웃 or Pages Router의 `_app`에서 전역 설정을 한 번 적용합니다.

```tsx
// app/layout.tsx (App Router)
import "vanilla-ssr/styles.css";
import { configure } from "vanilla-ssr";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // 예: middleware/route handler 등에서 nonce를 주입했다고 가정
  const nonce = (globalThis as any).__CSP_NONCE__;
  configure({
    defaultTarget: "#modal-root",
    styleTarget: typeof document !== "undefined" ? document : undefined,
    csp: { nonce },
    debug: process.env.NODE_ENV === "development",
  });

  return (
    <html lang="ko">
      <body>
        <div id="modal-root" />
        {children}
      </body>
    </html>
  );
}
```

### 3. 컴포넌트 사용

**서버 사이드 렌더링**:

```javascript
import { renderModalMarkup, renderBadge } from "vanilla-ssr";

export default function HomePage() {
  return (
    <div>
      {/* 서버에서 HTML 생성 */}
      <div
        dangerouslySetInnerHTML={{
          __html: renderModalMarkup({
            title: "안녕하세요",
            message: "Next.js에서 잘 작동합니다!",
            primaryButtonText: "확인",
          }),
        }}
      />

      <div
        dangerouslySetInnerHTML={{
          __html: renderBadge({
            label: "성공",
            variant: "success",
          }),
        }}
      />
    </div>
  );
}
```

**클라이언트 하이드레이션**:

```javascript
import { useEffect } from "react";
import { hydrateVanilaComponents, hydrateOnVisible, hydrateOnInteraction, hydrateOnIdle } from "vanilla-ssr/client";
import { renderBadge } from "vanilla-ssr";

export default function InteractivePage() {
  useEffect(() => {
    // SSR로 렌더된 컴포넌트 일괄 하이드레이션
    hydrateVanilaComponents();

    // 가시 영역에서만 하이드레이트
    hydrateOnVisible("[data-vanila-component='data-table']", (el) => {
      import("vanilla-ssr/components/data-table").then(({ hydrateDataTable }) => {
        hydrateDataTable(el as HTMLDivElement);
      });
    });

    // 첫 인터랙션 시 하이드레이트
    hydrateOnInteraction("[data-vanila-component='modal']", (el) => {
      import("vanilla-ssr/components/modal").then(({ hydrateModal }) => {
        hydrateModal(el as HTMLDivElement);
      });
    });

    // 아이들 시간에 저우선순위 컴포넌트 준비
    hydrateOnIdle(() => {
      // pre-hydrate or prefetch
    });

    // 배지 생성 (문자열 렌더 → DOM 삽입)
    const badgeHtml = renderBadge({
      label: "동적",
      variant: "info",
    });
    document.body.insertAdjacentHTML("beforeend", badgeHtml);
  }, []);

  return <div>인터랙티브 컴포넌트들</div>;
}
```

### 3. 테마 시스템

```javascript
import { applyThemeMode, initializeTheme } from "vanilla-ssr/theme";

// 앱 시작 시 테마 초기화
useEffect(() => {
  initializeTheme({
    target: document.documentElement,
    persist: true,
  });
}, []);

// 다크모드 토글
const toggleDarkMode = () => {
  applyThemeMode("dark");
};
```

## Next.js 설정 (선택사항)

**next.config.js**:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ES 모듈 처리
  experimental: {
    esmExternals: "loose",
  },

  // CSS 최적화
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
};

module.exports = nextConfig;
```

## TypeScript 지원

```typescript
import type { ModalOptions } from "vanilla-ssr/components/modal";
import type { BadgeOptions } from "vanilla-ssr/utilities";
import type { ThemeMode } from "vanilla-ssr/theme";

const modalOptions: ModalOptions = {
  title: "타입 안전",
  message: "완벽한 TypeScript 지원",
};
```

## 문제 해결

### CSS가 로드되지 않는 경우

1. `vanilla-ssr/styles.css` 임포트 확인
2. Next.js 버전이 12.0+ 인지 확인

### 모듈을 찾을 수 없는 경우

1. `npm install vanilla-ssr@latest` 재실행
2. `node_modules` 삭제 후 재설치

### 하이드레이션이 작동하지 않는 경우

1. `useEffect` 내에서 실행하는지 확인
2. 서버와 클라이언트 마크업이 동일한지 확인

## 예제 프로젝트

완전한 Next.js 예제는 [GitHub](https://github.com/jaehyuksssss/vanila-components)에서 확인하세요.

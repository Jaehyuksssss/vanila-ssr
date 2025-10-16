# Next.js 사용 가이드

## 설치

```bash
npm install vanila-components@latest
```

## 기본 사용법

### 1. CSS 임포트

**pages/\_app.js** (Pages Router):

```javascript
import "vanila-components/styles.css";

export default function App({ Component, pageProps }) {
  return <Component {...pageProps} />;
}
```

**app/layout.js** (App Router):

```javascript
import "vanila-components/styles.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
```

### 2. 컴포넌트 사용

**서버 사이드 렌더링**:

```javascript
import { renderModalMarkup, renderBadge } from "vanila-components";

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
import { hydrateVanilaComponents } from "vanila-components/client";
import { renderBadge } from "vanila-components";

export default function InteractivePage() {
  useEffect(() => {
    // SSR로 렌더된 컴포넌트 일괄 하이드레이션
    hydrateVanilaComponents();

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
import { applyThemeMode, initializeTheme } from "vanila-components/theme";

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
import type { ModalOptions } from "vanila-components/components/modal";
import type { BadgeOptions } from "vanila-components/utilities";
import type { ThemeMode } from "vanila-components/theme";

const modalOptions: ModalOptions = {
  title: "타입 안전",
  message: "완벽한 TypeScript 지원",
};
```

## 문제 해결

### CSS가 로드되지 않는 경우

1. `vanila-components/styles.css` 임포트 확인
2. Next.js 버전이 12.0+ 인지 확인

### 모듈을 찾을 수 없는 경우

1. `npm install vanila-components@latest` 재실행
2. `node_modules` 삭제 후 재설치

### 하이드레이션이 작동하지 않는 경우

1. `useEffect` 내에서 실행하는지 확인
2. 서버와 클라이언트 마크업이 동일한지 확인

## 예제 프로젝트

완전한 Next.js 예제는 [GitHub](https://github.com/jaehyuksssss/vanila-components)에서 확인하세요.

# Vanilla SSR (npm: vanilla-ssr)

한국어 | [English](README.md)

[![npm version](https://img.shields.io/npm/v/vanilla-ssr.svg)](https://www.npmjs.com/package/vanilla-ssr)
[![npm downloads](https://img.shields.io/npm/dm/vanilla-ssr.svg)](https://www.npmjs.com/package/vanilla-ssr)
[![bundle size](https://img.shields.io/bundlephobia/minzip/vanilla-ssr?label=bundle%20size)](https://bundlephobia.com/package/vanilla-ssr)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript)](#)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

vanilla-ssr는 서버에서 접근성 있는 마크업을 생성하고, 클라이언트에서 필요한 상호작용만 하이드레이션하는 SSR-first UI 컴포넌트 라이브러리입니다. Laravel Blade/Twig/Razor/Go/Express/Next.js 등 다양한 스택에서 프레임워크 종속 없이 사용할 수 있습니다.

**📚 [문서 & 플레이그라운드](https://docs-vanilla-ssr.vercel.app/)** | **📦 [npm 패키지](https://www.npmjs.com/package/vanilla-ssr)**

> 패키지명이 `vanila-components`에서 `vanilla-ssr`로 변경되었습니다. 대부분의 경우 임포트 경로만 바꾸면 됩니다. 자세한 내용은 `MIGRATION.md`를 참고하세요.

## 하이라이트

- SSR-first – 서버에서 `render*Markup`으로 마크업 생성, 클라이언트에서 `hydrate*`로 동작 부여
- 관리형 위젯 – 데이터 테이블, 모달/토스트/바텀시트, 카드/배지/칩/상태 점 등
- 테마 시스템 – 라이트/다크 모드, CSS 변수 토큰, 런타임 적용 함수 제공
- 접근성 우선 – 키보드 내비게이션, ARIA 속성, FocusTrap/RovingTabindex 유틸
- 스타일 옵션 – 번들 CSS 임포트 또는 런타임 주입(Shadow DOM 호환)
- 타입 지원 – 풍부한 TypeScript 정의와 엄격한 런타임 에러 메시지

## 설치

```bash
npm install vanilla-ssr
```

## 빠른 시작

```ts
import {
  hydrateAllVanilaComponents,
  showModal,
  showToast,
} from "vanilla-ssr";

// 1) 스타일 주입 + 페이지의 SSR 마크업 하이드레이션
hydrateAllVanilaComponents();

showModal({
  title: "환영합니다",
  message: "Vanilla SSR ready",
  primaryButtonText: "닫기",
});

showToast({
  message: "저장되었습니다",
  type: "success",
});
```

### 스택에 통합하는 흐름

1. `npm install vanilla-ssr`
2. CSS 번들 임포트 또는 `injectVanilaStyles()`로 런타임 주입
3. 서버: `render*Markup()`으로 HTML 생성
4. 클라이언트: `hydrate*()` 또는 `hydrateVanilaComponents()`로 동작 부여
5. 브라우저만 사용하는 경우: `create*()` 헬퍼 이용

### 스타일 로드

```ts
// 번들러 임포트
import "vanilla-ssr/styles.css";

// 런타임 주입
import { injectVanilaStyles } from "vanilla-ssr";
injectVanilaStyles();
```

## 컴포넌트 스니펫

### Modal

```ts
import { showModal } from "vanilla-ssr";

showModal({
  id: "confirm-delete-modal",
  className: "dashboard-modal",
  target: "#modal-root",
  title: "삭제 확인",
  message: "이 항목을 삭제할까요?",
  primaryButtonText: "삭제",
  secondaryButtonText: "취소",
});
```

### Toast

```ts
import { showToast } from "vanilla-ssr";

showToast({
  message: "저장되었습니다",
  type: "success",
  duration: 2500,
  dismissible: true,
  position: "top",
});
```

### Banner

```ts
import { createBanner } from "vanilla-ssr";

const banner = createBanner({
  message: "새로운 버전이 배포되었습니다.",
  variant: "success",
  dismissible: true,
  actions: [{ label: "변경 사항 보기", href: "/changelog" }],
});

document.body.prepend(banner);
```

### 파일 업로더

```ts
import { createFileUploader } from "vanilla-ssr";

const uploader = createFileUploader({
  name: "attachments",
  label: "첨부 파일",
  multiple: true,
  maxFiles: 5,
  onFilesChange: (files) => console.log(files.length, "개 선택됨"),
});

document.body.append(uploader);
```

## 🎨 테마 시스템

```ts
import { applyThemeMode, toggleTheme } from "vanilla-ssr";

applyThemeMode("dark");

document.getElementById("theme-toggle")?.addEventListener("click", () => {
  toggleTheme();
});
```

## 스크립트

| Command              | Description                                  |
| -------------------- | -------------------------------------------- |
| `npm run dev`        | Vite 개발 서버 및 플레이그라운드 실행        |
| `npm run build`      | 번들(ESM/CJS) 및 타입 선언 파일 생성         |
| `npm run preview`    | 빌드된 번들 로컬 프리뷰                      |
| `npm run test:run`   | Vitest 실행                                   |
| `npm run docs:dev`   | Next.js 문서 사이트 실행 (`docs/`)           |
| `npm run docs:build` | 문서 사이트 프로덕션 빌드                    |

## Roadmap & 채택

- 로드맵은 ROADMAP.md에서 확인할 수 있습니다. 실제 프로젝트 채택에 직결되는 DX/성능/문서 품질을 우선 강화합니다.
- 기여를 환영합니다. 버그/문서/예제/Starter 템플릿 제안은 이슈/PR로 남겨 주세요.

## 라이선스

MIT


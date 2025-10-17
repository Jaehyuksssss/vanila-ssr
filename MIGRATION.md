# Migration Guide: vanila-components → vanilla-ssr

이 가이드는 패키지명을 `vanila-components`에서 `vanilla-ssr`로 변경함에 따라 필요한 최소 변경 사항을 정리합니다. 런타임 API는 그대로이며, 대부분의 경우 임포트 경로만 바꾸면 됩니다.

## 핵심 변경 사항
- NPM 패키지명: `vanila-components` → `vanilla-ssr`
- CDN 경로: `https://unpkg.com/vanila-components/...` → `https://unpkg.com/vanilla-ssr/...`
- 번들 파일명: `vanila-components.(js|cjs|css)` → `vanilla-ssr.(js|cjs|css)`
- 내부 CSS 접두사(`data-vanila-*`, `vanila-*` 클래스)는 호환성 유지를 위해 변경하지 않았습니다.

## 해야 할 일 (프로젝트 코드)
1) 패키지 설치/업데이트

```bash
npm uninstall vanila-components || true
npm install vanilla-ssr@latest
```

2) 임포트 경로 치환

```diff
- import { hydrateAllVanilaComponents } from "vanila-components";
+ import { hydrateAllVanilaComponents } from "vanilla-ssr";

- import "vanila-components/styles.css";
+ import "vanilla-ssr/styles.css";

- import { hydrateVanilaComponents } from "vanila-components/client";
+ import { hydrateVanilaComponents } from "vanilla-ssr/client";

- import { applyThemeMode } from "vanila-components/theme";
+ import { applyThemeMode } from "vanilla-ssr/theme";

- import { hydrateModal } from "vanila-components/components/modal";
+ import { hydrateModal } from "vanilla-ssr/components/modal";
```

3) CDN 사용 시

```diff
- <link rel="stylesheet" href="https://unpkg.com/vanila-components@x.y.z/dist/vanila-components.css" />
+ <link rel="stylesheet" href="https://unpkg.com/vanilla-ssr@x.y.z/dist/vanilla-ssr.css" />
```

## 브레이킹 변경 여부
- import 경로와 CDN 경로만 변경되었습니다.
- HTML 마크업의 `data-vanila-*` 속성, `vanila-` 클래스명은 변경하지 않았기 때문에 SSR 마크업/하이드레이션은 그대로 동작합니다.

## FAQ
- CSS 접두사도 `vanilla-`로 바꾸나요?
  - 현재는 호환성을 위해 유지합니다. 접두사까지 변경 시 대규모 마이그레이션이 필요하므로, 추후 메이저 버전에서 가이드와 함께 제공할 예정입니다.
---
문제나 문의가 있으면 이슈를 생성해 주세요. 감사합니다!

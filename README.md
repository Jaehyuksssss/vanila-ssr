# Vanila Components

바닐라 자바스크립트 환경에서 바로 사용할 수 있는 UI 컴포넌트 컬렉션입니다. 모달, 토스트, 아코디언, 카드, 바텀시트 등 자주 쓰이는 패턴을 손쉽게 초기화하고 기본 스타일을 함께 제공하도록 구성했습니다.

## 주요 특징
- **라이브러리 모드 빌드**: ESM, CJS, UMD 포맷과 타입 선언을 자동으로 생성합니다.
- **SSR/템플릿 엔진 친화**: `render*Markup`·`hydrate*` API로 서버에서 HTML을 출력하고 클라이언트에서 동작을 붙일 수 있습니다.
- **접근성 강화**: 모달/바텀시트 포커스 트랩, ESC/백드롭 닫기, aria 속성을 기본 제공합니다.
- **관리자 페이지 핵심 위젯**: 필터 바, 데이터 테이블, 지표 카드 등 어드민 UI에 필요한 컴포넌트를 포함합니다.
- **스타일 옵션**: 번들된 CSS를 가져오거나 런타임에 `injectVanilaStyles()`로 자동 삽입할 수 있습니다.
- **Tree‑shaking 지원**: 사용하지 않는 컴포넌트는 번들에서 제거됩니다.
- **TypeScript 친화적**: 모든 컴포넌트에 명확한 옵션 타입을 제공합니다.
- **데모 환경 제공**: `npm run dev`로 바로 실행 가능한 예제 화면을 확인할 수 있습니다.

## 설치
```bash
npm install vanila-components
```

## 빠른 시작
```ts
import {
  injectVanilaStyles,
  showModal,
  showToast,
} from "vanila-components";

// 선택: 기본 CSS를 자동으로 주입합니다.
injectVanilaStyles();

showModal({
  title: "Welcome",
  message: "Vanila Components 준비 완료",
  primaryButtonText: "닫기",
});

showToast({
  message: "저장 성공",
  type: "success",
});
```

### 사용 흐름 요약
1. `npm install vanila-components`로 패키지를 설치합니다.
2. CSS 번들을 가져오거나 `injectVanilaStyles()`로 런타임 스타일을 주입합니다.
3. 서버에서 `render*Markup()`을 호출해 HTML 문자열을 생성하고 템플릿에 삽입합니다.
4. 클라이언트에서 `hydrate*()` 혹은 `hydrateVanilaComponents()`를 호출해 동작을 붙입니다.
5. 필요하면 `create*()` 헬퍼로 브라우저 전용 인스턴스도 만들 수 있습니다.

### SSR / 템플릿 연동
서버 템플릿 엔진(.NET Razor, PHP, Go html/template 등)에서 바로 쓸 수 있도록 마크업 생성기와 하이드레이션 유틸을 제공합니다.

```ts
// 서버 사이드: HTML 문자열 생성
import { renderModalMarkup } from "vanila-components";

const modalHtml = renderModalMarkup({
  title: "서버에서 렌더된 모달",
  message: "클라이언트에서 동작을 붙입니다.",
});
```

```ts
// 클라이언트 초기화 코드
import { hydrateVanilaComponents, injectVanilaStyles } from "vanila-components";

injectVanilaStyles();
hydrateVanilaComponents();
```

`hydrateVanilaComponents()`는 `data-vanila-component="*"` 속성을 가진 요소를 자동으로 탐색해 이벤트를 연결하고, 각 컴포넌트의 `hydrate*` 함수로 세부 콜백을 직접 지정할 수도 있습니다.

### CSS 사용 방법
- **번들된 CSS 직접 import**
  ```ts
  import "vanila-components/styles.css";
  ```
- **런타임 주입**
  ```ts
  import { injectVanilaStyles } from "vanila-components";

  injectVanilaStyles(); // Document 또는 ShadowRoot에 한 번만 삽입
  ```
- **문자열로 활용**
  ```ts
  import { getVanilaStyleText } from "vanila-components";

  const cssText = getVanilaStyleText();
  // 필요한 곳에 직접 삽입
  ```

## 컴포넌트별 예제
### Modal
```ts
import { showModal } from "vanila-components";

showModal({
  title: "삭제 확인",
  message: "정말로 삭제하시겠습니까?",
  primaryButtonText: "삭제",
  secondaryButtonText: "취소",
  onPrimaryAction: () => console.log("삭제 진행"),
  onSecondaryAction: () => console.log("취소"),
  onClose: () => console.log("모달 닫힘"),
});
```

### Toast
```ts
import { showToast } from "vanila-components";

showToast({
  message: "저장 성공",
  type: "success",
  duration: 2500,
  dismissible: true,
  position: "top",
});
```

### Accordion
```ts
import { createAccordion } from "vanila-components";

const accordion = createAccordion({
  title: "FAQ",
  content: "내용을 직접 수정할 수 있습니다.",
  onDeleteConfirm: () => console.log("삭제 완료"),
  onDeleteCancel: () => console.log("삭제 취소"),
  onContentChange: (value) => console.log("새로운 내용:", value),
});

document.getElementById("accordion-wrapper")?.appendChild(accordion);
```

삭제 확인 UI를 커스터마이즈하고 싶다면 `onDeleteRequest`로 콜백을 전달할 수 있습니다. 기본 모달을 다시 사용하고 싶을 때는 `context.defaultHandler()`를 호출하면 됩니다.

```ts
import { createAccordion, showBottomSheet } from "vanila-components";

createAccordion({
  title: "삭제 가능한 항목",
  content: "버텀시트로 확인 UI를 교체했습니다.",
  onDeleteRequest: ({ remove, cancel, defaultHandler }) => {
    showBottomSheet({
      title: "정말 삭제하시겠습니까?",
      content: "이 작업은 되돌릴 수 없습니다.",
      primaryButtonText: "삭제",
      onPrimaryAction: remove,
      onClose: cancel,
    });

    // 필요하다면 defaultHandler(); 로 기존 모달을 띄울 수 있습니다.
  },
});
```

### BottomSheet
```ts
import { showBottomSheet } from "vanila-components";

showBottomSheet({
  title: "필터",
  content: "필터 내용을 여기에 작성하세요.",
  primaryButtonText: "적용",
  onPrimaryAction: () => console.log("필터 적용"),
  onClose: () => console.log("바텀시트 닫힘"),
});
```

### Card
```ts
import { renderCards, bindCardClickEvents } from "vanila-components";

renderCards(
  [
    {
      title: "Card 1",
      description: "설명",
      imageUrl: "/images/card.png",
    },
  ],
  "#card-container"
);

bindCardClickEvents("#card-container", (title) => {
  console.log(`${title} 카드 클릭`);
});
```

### Input Field
```ts
import { createInputField } from "vanila-components";

const field = createInputField({
  name: "project-name",
  label: "프로젝트 이름",
  placeholder: "예: 정산 시스템 리팩터링",
  prefix: "#",
  helperText: "대시보드에 표시할 이름",
  onChange: (value) => console.log("입력값", value),
});

document.querySelector("#form")?.append(field);

// 값 업데이트 및 오류 표시는 메서드로 수행합니다.
field.setValue("신규 서비스 지표");
field.setError("필수 항목입니다");
```

### Select Field
```ts
import { createSelectField } from "vanila-components";

const statusSelect = createSelectField({
  name: "status",
  label: "상태",
  placeholder: "전체",
  options: [
    { label: "대기", value: "pending" },
    { label: "진행중", value: "progress" },
    { label: "완료", value: "done" },
  ],
  onChange: (value) => console.log("선택값", value),
});

document.querySelector("#form")?.append(statusSelect);
statusSelect.setValue("progress");
```

### Filter Bar
```ts
import { createFilterBar } from "vanila-components";

const filterBar = createFilterBar({
  fields: [
    { type: "search", name: "query", label: "검색어", placeholder: "프로젝트, 담당자" },
    {
      type: "select",
      name: "status",
      label: "상태",
      placeholder: "전체",
      options: [
        { label: "대기", value: "대기" },
        { label: "진행중", value: "진행중" },
        { label: "완료", value: "완료" },
      ],
    },
  ],
  autoSubmit: true,
  onSubmit: (values) => console.log(values),
  onReset: () => console.log("필터 초기화"),
});

document.querySelector("#filters")?.append(filterBar);
```

### Data Table
```ts
import { createDataTable } from "vanila-components";

const table = createDataTable({
  columns: [
    { key: "name", header: "프로젝트", width: "32%" },
    { key: "owner", header: "담당자", width: "18%" },
    { key: "status", header: "상태" },
    {
      key: "progress",
      header: "진행률",
      align: "right",
      render: (value) => `${value ?? 0}%`,
    },
  ],
  data: projectRows,
  zebra: true,
  initialSort: { columnKey: "progress", direction: "desc" },
  onRowClick: (row) => console.log("row", row),
});

document.querySelector("#table")?.append(table);

// 필터 결과나 서버 응답으로 데이터를 갱신할 수 있습니다.
table.updateData(nextRows);
```

서버사이드 렌더링 시에는 `renderDataTableMarkup`으로 `<table>` 마크업을 만들고, 클라이언트에서는 `hydrateDataTable`로 정렬/클릭 동작을 복원하면 됩니다.

### Metric Card
```ts
import { createMetricCard } from "vanila-components";

const metric = createMetricCard({
  label: "활성 프로젝트",
  value: 12,
  description: "이번 주 기준",
  variant: "success",
  size: "md",
  trend: { direction: "up", label: "+3.1%" },
});

document.querySelector("#metrics")?.append(metric);

// 데이터 변경 시 update()로 값과 추이를 갱신합니다.
metric.update({ value: 15, trend: { direction: "up", label: "+25%" } });
```

SSR로 출력된 마크업은 각 컴포넌트의 `hydrate*` 함수(예: `hydrateAccordion`, `hydrateToast`)에 콜백만 전달하면 즉시 동작을 붙일 수 있습니다.

## 스크립트
| 명령어 | 설명 |
| --- | --- |
| `npm run dev` | Vite 개발 서버를 실행하고 `src/demo` 예제를 확인합니다. |
| `npm run build` | 타입 선언을 생성하고 라이브러리 번들을 `dist`에 생성합니다. |
| `npm run preview` | 빌드 결과를 로컬 서버에서 미리봅니다. |
| `npm run docs:dev` | Next.js 기반 문서 사이트(`docs/`)를 개발 모드로 실행합니다. |
| `npm run docs:build` | 문서 사이트 프로덕션 빌드를 생성합니다. |

## 개발 가이드
1. `npm install`로 의존성을 설치합니다.
2. `src/lib`에서 컴포넌트를 수정하고 `src/demo`에서 예제를 업데이트합니다.
3. `npm run build`로 배포용 번들을 확인합니다.

## 라이선스
현재 `UNLICENSED` 상태입니다. 배포 전에 적절한 라이선스를 지정해 주세요.

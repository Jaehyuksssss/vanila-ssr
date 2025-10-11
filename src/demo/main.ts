import {
  bindCardClickEvents,
  createAccordion,
  createDataTable,
  createFilterBar,
  createInputField,
  createMetricCard,
  createSelectField,
  injectVanilaStyles,
  renderCards,
  showBottomSheet,
  showModal,
  showToast,
} from "../index";

injectVanilaStyles();

type DemoCard = {
  title: string;
  description: string;
  imageUrl: string;
};

const cards: DemoCard[] = [
  {
    title: "Card 1",
    description: "이것은 카드 내용1입니다.",
    imageUrl: "/cute.png",
  },
  {
    title: "Card 2",
    description: "이것은 카드 내용2입니다.",
    imageUrl: "/cute.png",
  },
  {
    title: "Card 3",
    description: "이것은 카드 내용3입니다.",
    imageUrl: "/cute.png",
  },
];

const byId = <T extends HTMLElement>(id: string): T => {
  const element = document.getElementById(id);
  if (!element) {
    throw new Error(`${id} element is missing in the demo markup`);
  }
  return element as T;
};

const modalButton = byId<HTMLButtonElement>("open-modal-btn");
const toastButton = byId<HTMLButtonElement>("open-toast-btn");
const accordionButton = byId<HTMLButtonElement>("open-accordion-btn");
const bottomSheetButton = byId<HTMLButtonElement>("open-bottom-sheet-btn");
const cardButton = byId<HTMLButtonElement>("open-card-btn");
const accordionWrapper = byId<HTMLDivElement>("accordion-wrapper");
const cardDemo = byId<HTMLDivElement>("card-demo");
const filterContainer = byId<HTMLDivElement>("filter-bar");
const tableContainer = byId<HTMLDivElement>("table-container");
const metricContainer = byId<HTMLDivElement>("metric-cards");
const formControls = byId<HTMLDivElement>("form-controls");

modalButton.addEventListener("click", () => {
  showModal({
    title: "이건 모달 컴포넌트 타이틀",
    message: "이건 모달에 들어갈 내용",
    primaryButtonText: "닫기",
    onClose: () => {
      console.info("모달이 닫혔습니다.");
    },
  });
});

toastButton.addEventListener("click", () => {
  showToast({
    message: "저장 성공",
    type: "success",
    duration: 2000,
  });
});

accordionButton.addEventListener("click", () => {
  const accordion = createAccordion({
    title: "새로운 아코디언",
    content: "이것은 새로 추가된 아코디언입니다.",
    onDeleteConfirm: () => {
      console.info("아코디언이 삭제되었습니다.");
    },
    onDeleteCancel: () => {
      console.info("삭제가 취소되었습니다.");
    },
  });

  accordionWrapper.appendChild(accordion);
});

bottomSheetButton.addEventListener("click", () => {
  showBottomSheet({
    title: "바텀시트 타이틀",
    content: "이것은 바텀시트 내용입니다.",
    primaryButtonText: "닫기",
    onClose: () => console.info("바텀시트 닫힘"),
  });
});

cardButton.addEventListener("click", () => {
  renderCards(cards, cardDemo);

  bindCardClickEvents(cardDemo, (title) => {
    console.info(`"${title}" 카드의 버튼이 클릭되었습니다.`);
  });
});

type ProjectRecord = {
  name: string;
  owner: string;
  status: "대기" | "진행중" | "완료" | "보류";
  progress: number;
  updatedAt: string;
  budget: number;
};

const projects: ProjectRecord[] = [
  {
    name: "정산 시스템 리팩터링",
    owner: "지수",
    status: "진행중",
    progress: 78,
    updatedAt: "2024-03-11",
    budget: 4800,
  },
  {
    name: "파트너 온보딩 개선",
    owner: "민재",
    status: "대기",
    progress: 12,
    updatedAt: "2024-03-08",
    budget: 2100,
  },
  {
    name: "결제 게이트웨이 마이그레이션",
    owner: "아라",
    status: "보류",
    progress: 34,
    updatedAt: "2024-02-26",
    budget: 9100,
  },
  {
    name: "내부 대시보드 고도화",
    owner: "태현",
    status: "진행중",
    progress: 56,
    updatedAt: "2024-03-09",
    budget: 3200,
  },
  {
    name: "인프라 비용 최적화",
    owner: "수연",
    status: "완료",
    progress: 100,
    updatedAt: "2024-02-18",
    budget: 6400,
  },
  {
    name: "알림 시스템 재설계",
    owner: "지수",
    status: "진행중",
    progress: 42,
    updatedAt: "2024-03-01",
    budget: 2700,
  },
  {
    name: "데이터 파이프라인 점검",
    owner: "민재",
    status: "완료",
    progress: 100,
    updatedAt: "2024-02-29",
    budget: 1500,
  },
  {
    name: "고객 포털 접근성 개선",
    owner: "태현",
    status: "보류",
    progress: 23,
    updatedAt: "2024-02-14",
    budget: 3800,
  },
  {
    name: "신규 결제 수단 연동",
    owner: "수연",
    status: "진행중",
    progress: 64,
    updatedAt: "2024-03-05",
    budget: 5200,
  },
  {
    name: "사내 로그인 SSO",
    owner: "아라",
    status: "대기",
    progress: 5,
    updatedAt: "2024-03-10",
    budget: 1900,
  },
];

const uniqueOwners = Array.from(
  new Set(projects.map((project) => project.owner))
);
const statusOptions = ["대기", "진행중", "완료", "보류"];

let minimumProgress = 0;
let quickStatus: string | null = null;

const averageProgress = (rows: ProjectRecord[]): number => {
  if (rows.length === 0) {
    return 0;
  }
  const sum = rows.reduce((acc, row) => acc + row.progress, 0);
  return Math.round(sum / rows.length);
};

const projectColumns = [
  { key: "name", header: "프로젝트", width: "30%" },
  { key: "owner", header: "담당자", width: "18%" },
  { key: "status", header: "상태", width: "14%" },
  {
    key: "progress",
    header: "진행률",
    align: "right" as const,
    render: (value: unknown) => `${value ?? 0}%`,
  },
  {
    key: "updatedAt",
    header: "업데이트",
    width: "18%",
    render: (value: unknown) =>
      new Date(String(value)).toLocaleDateString("ko-KR"),
  },
];

const totalMetric = createMetricCard({
  label: "전체 프로젝트",
  value: projects.length,
  description: "등록된 프로젝트 수",
  variant: "neutral",
});

const resultsMetric = createMetricCard({
  label: "필터 결과",
  value: projects.length,
  description: "현재 조건과 일치하는 프로젝트",
  variant: "primary",
});

const progressMetric = createMetricCard({
  label: "평균 진행률",
  value: `${averageProgress(projects)}%`,
  description: "필터 대상 평균 진행률",
  variant: "success",
});

metricContainer.append(totalMetric, resultsMetric, progressMetric);

const updateMetrics = (rows: ProjectRecord[]) => {
  resultsMetric.update({
    value: rows.length,
    description: `필터 결과 ${rows.length}건`,
  });

  progressMetric.update({
    value: `${averageProgress(rows)}%`,
    description: rows.length ? "필터 대상 평균 진행률" : "데이터가 없습니다",
  });
};

let filterBar: ReturnType<typeof createFilterBar>;
let table: ReturnType<typeof createDataTable<ProjectRecord>>;
let minProgressField: ReturnType<typeof createInputField>;
let quickStatusSelect: ReturnType<typeof createSelectField>;

const runFilters = () => {
  if (!filterBar || !table) {
    return;
  }
  const filtered = applyFilters(filterBar.getValues());
  table.updateData(filtered);
  updateMetrics(filtered);
};

const applyFilters = (values: Record<string, unknown>): ProjectRecord[] => {
  const queryRaw = values.query ?? "";
  const statusRaw = values.status ?? "";
  const ownerRaw = values.owner ?? "";

  const query = String(queryRaw).trim().toLowerCase();
  const status = Array.isArray(statusRaw)
    ? String(statusRaw[0] ?? "")
    : String(statusRaw);
  const owner = Array.isArray(ownerRaw)
    ? String(ownerRaw[0] ?? "")
    : String(ownerRaw);

  return projects.filter((project) => {
    const matchesQuery =
      !query ||
      project.name.toLowerCase().includes(query) ||
      project.owner.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query);
    const matchesStatus = !status || project.status === status;
    const matchesOwner = !owner || project.owner === owner;
    const meetsMinimumProgress = project.progress >= minimumProgress;
    const matchesQuickStatus = !quickStatus || project.status === quickStatus;
    return (
      matchesQuery &&
      matchesStatus &&
      matchesOwner &&
      meetsMinimumProgress &&
      matchesQuickStatus
    );
  });
};

filterBar = createFilterBar({
  fields: [
    {
      type: "search",
      name: "query",
      label: "검색어",
      placeholder: "프로젝트, 담당자, 상태",
      width: "260px",
    },
    {
      type: "select",
      name: "status",
      label: "상태",
      placeholder: "전체",
      options: [
        { label: "대기", value: "대기" },
        { label: "진행중", value: "진행중" },
        { label: "완료", value: "완료" },
        { label: "보류", value: "보류" },
      ],
      width: "180px",
    },
    {
      type: "select",
      name: "owner",
      label: "담당자",
      placeholder: "전체",
      options: uniqueOwners.map((owner) => ({ label: owner, value: owner })),
      width: "180px",
    },
  ],
  submitLabel: "검색",
  resetLabel: "초기화",
  autoSubmit: true,
  onSubmit: () => {
    runFilters();
  },
  onReset: () => {
    minimumProgress = 0;
    quickStatus = null;
    if (minProgressField) {
      minProgressField.setValue("0");
    }
    if (quickStatusSelect) {
      quickStatusSelect.setValue("");
    }
    runFilters();
  },
});

filterContainer.appendChild(filterBar);

table = createDataTable<ProjectRecord>({
  columns: projectColumns,
  data: projects,
  caption: "프로젝트 현황",
  zebra: true,
  compact: false,
  initialSort: { columnKey: "updatedAt", direction: "desc" },
  onRowClick: (row) => {
    showToast({
      message: `${row.name} 상세를 열었습니다`,
      type: "info",
      duration: 1600,
    });
  },
});

tableContainer.appendChild(table);

minProgressField = createInputField({
  name: "min-progress",
  label: "최소 진행률 (%)",
  type: "number",
  size: "sm",
  placeholder: "0",
  helperText: "0부터 100 사이의 값",
  onChange: (value) => {
    const numeric = Number(value);
    minimumProgress = Number.isFinite(numeric)
      ? Math.min(Math.max(Math.trunc(numeric), 0), 100)
      : 0;
    runFilters();
  },
});
minProgressField.setValue("0");

quickStatusSelect = createSelectField({
  name: "quick-status",
  label: "상태 바로 선택",
  placeholder: "전체",
  options: statusOptions.map((status) => ({ label: status, value: status })),
  size: "sm",
  onChange: (value) => {
    const nextValue = Array.isArray(value) ? value[0] ?? "" : value;
    quickStatus = nextValue ? nextValue : null;
    runFilters();
  },
});

formControls.append(minProgressField, quickStatusSelect);

runFilters();

"use client";

import {
  createAccordion,
  createDataTable,
  createFilterBar,
  createInputField,
  createSelectField,
  injectVanilaStyles,
  showToast,
} from "vanila-components";
import { useEffect, useRef } from "react";
import { COMPONENTS, type PreviewId } from "../lib/component-data";

const SAMPLE_ROWS = [
  { name: "쿠폰 정책 개선", owner: "지수", status: "진행중", progress: 68 },
  { name: "알림 시스템 재정비", owner: "태현", status: "진행중", progress: 34 },
  { name: "API 게이트웨이", owner: "민재", status: "대기", progress: 12 },
  { name: "내부 대시보드", owner: "수연", status: "완료", progress: 100 },
];

const SAMPLE_COLUMNS = [
  { key: "name", header: "프로젝트" },
  { key: "owner", header: "담당자" },
  { key: "status", header: "상태" },
  { key: "progress", header: "진행률", align: "right" as const, render: (value: unknown) => `${value}%` },
];

const FILTER_FIELDS = [
  { type: "search", name: "query", label: "검색어", placeholder: "API, Dashboard" },
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
] as const;

const renderers: Record<PreviewId, (container: HTMLElement) => void> = {
  "input-field": (container) => {
    const field = createInputField({
      name: "project",
      label: "프로젝트 이름",
      placeholder: "사내 대시보드",
      prefix: "#",
      helperText: "내부 식별용",
      onChange: (value) => {
        valueDisplay.textContent = value ? `현재 입력: ${value}` : "입력 대기 중";
      },
    });
    const valueDisplay = document.createElement("p");
    valueDisplay.style.marginTop = "12px";
    valueDisplay.style.color = "var(--text-secondary)";
    valueDisplay.style.fontSize = "0.85rem";
    valueDisplay.textContent = "입력 대기 중";
    container.appendChild(field);
    container.appendChild(valueDisplay);
  },
  "select-field": (container) => {
    const select = createSelectField({
      name: "status",
      label: "상태",
      placeholder: "전체",
      options: [
        { label: "대기", value: "대기" },
        { label: "진행중", value: "진행중" },
        { label: "완료", value: "완료" },
      ],
      onChange: (value) => {
        statusLabel.textContent = Array.isArray(value) ? value.join(", ") : value;
      },
    });
    const statusLabel = document.createElement("p");
    statusLabel.style.marginTop = "12px";
    statusLabel.style.fontSize = "0.85rem";
    statusLabel.style.color = "var(--text-secondary)";
    statusLabel.textContent = "선택된 상태: 전체";
    container.appendChild(select);
    container.appendChild(statusLabel);
  },
  accordion: (container) => {
    const accordion = createAccordion({
      title: "데이터 파이프라인 점검",
      content: "주간 점검 체크리스트를 작성하세요.",
      onDeleteRequest: ({ defaultHandler }) => defaultHandler(),
    });
    container.appendChild(accordion);
  },
  "filter-bar": (container) => {
    const bar = createFilterBar({
      fields: FILTER_FIELDS as unknown as any,
      autoSubmit: true,
      onSubmit: (values) => {
        result.textContent = JSON.stringify(values, null, 2);
      },
    });
    const result = document.createElement("pre");
    result.className = "code-block";
    result.style.marginTop = "16px";
    result.style.fontSize = "0.85rem";
    result.textContent = "{}";
    container.appendChild(bar);
    container.appendChild(result);
  },
  "data-table": (container) => {
    const table = createDataTable({
      columns: SAMPLE_COLUMNS,
      data: SAMPLE_ROWS,
      caption: "진행중 프로젝트",
      onRowClick: (row) => {
        toast.textContent = `"${String(row.name)}" 상세로 이동합니다...`;
      },
    });
    const toast = document.createElement("p");
    toast.style.marginTop = "12px";
    toast.style.fontSize = "0.85rem";
    toast.style.color = "var(--text-secondary)";
    toast.textContent = "행을 클릭하면 메시지가 여기에 표시됩니다.";
    container.appendChild(table);
    container.appendChild(toast);
  },
  toast: (container) => {
    const button = document.createElement("button");
    button.textContent = "토스트 보기";
    button.className = "button button--primary";
    button.style.padding = "10px 16px";
    button.addEventListener("click", () => {
      showToast({ message: "저장 완료", type: "success", duration: 2200 });
    });
    container.appendChild(button);
  },
};

type PreviewRendererProps = {
  preview: PreviewId;
};

export function PreviewRenderer({ preview }: PreviewRendererProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectVanilaStyles();
    const node = ref.current;
    if (!node) {
      return;
    }
    node.innerHTML = "";
    const render = renderers[preview];
    if (render) {
      render(node);
    }

    return () => {
      node.innerHTML = "";
    };
  }, [preview]);

  const component = COMPONENTS.find((entry) => entry.preview === preview);

  return (
    <div>
      <div className="preview-title">Live preview</div>
      <div ref={ref} className="component-preview" aria-label={component?.name ?? preview} />
    </div>
  );
}

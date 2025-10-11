"use client";

import {
  createAccordion,
  createDataTable,
  createFilterBar,
  createInputField,
  createMetricCard,
  createSelectField,
  hydrateVanilaComponents,
  injectVanilaStyles,
  showToast,
} from "vanila-components";
import { useEffect, useRef } from "react";

const PROJECTS = [
  { name: "쿠폰 정책 개선", owner: "지수", status: "진행중", progress: 68 },
  { name: "API 게이트웨이", owner: "민재", status: "대기", progress: 12 },
  { name: "내부 대시보드", owner: "수연", status: "완료", progress: 100 },
  { name: "알림 시스템 재정비", owner: "태현", status: "진행중", progress: 34 },
];

const FILTER_FIELDS = [
  {
    type: "search",
    name: "query",
    label: "검색어",
    placeholder: "프로젝트명, 담당자",
    width: "280px",
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
    ],
    width: "200px",
  },
] as const;

const TABLE_COLUMNS = [
  { key: "name", header: "프로젝트", width: "34%" },
  { key: "owner", header: "담당자", width: "18%" },
  { key: "status", header: "상태", width: "16%" },
  { key: "progress", header: "진행률", align: "right" as const, render: (value: unknown) => `${value}%` },
];

export function PlaygroundDashboard() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    injectVanilaStyles();

    const container = containerRef.current;
    if (!container) {
      return;
    }

    container.innerHTML = "";

    const metricsWrapper = document.createElement("div");
    metricsWrapper.style.display = "grid";
    metricsWrapper.style.gridTemplateColumns = "repeat(auto-fit, minmax(220px, 1fr))";
    metricsWrapper.style.gap = "16px";

    const total = createMetricCard({
      label: "전체 프로젝트",
      value: PROJECTS.length,
      description: "데이터베이스 기준",
      variant: "neutral",
    });

    const complete = createMetricCard({
      label: "완료",
      value: PROJECTS.filter((project) => project.status === "완료").length,
      description: "완료된 작업",
      variant: "success",
    });

    const inProgress = createMetricCard({
      label: "진행중",
      value: PROJECTS.filter((project) => project.status === "진행중").length,
      description: "현재 처리 중",
      variant: "primary",
    });

    metricsWrapper.append(total, complete, inProgress);

    const filterWrapper = document.createElement("div");
    const resultsWrapper = document.createElement("div");
    const tableWrapper = document.createElement("div");

    const filter = createFilterBar({
      fields: FILTER_FIELDS as unknown as any,
      autoSubmit: true,
      onSubmit: (values) => {
        const filtered = applyFilters(values.query as string, values.status as string);
        dataTable.updateData(filtered);
        inProgress.update({
          value: filtered.filter((project) => project.status === "진행중").length,
          description: filtered.length ? "필터 결과" : "데이터 없음",
        });
      },
    });

    const statusQuickSelect = createSelectField({
      name: "status-quick",
      label: "바로보기",
      placeholder: "상태 선택",
      size: "sm",
      options: [
        { label: "전체", value: "" },
        { label: "진행중", value: "진행중" },
        { label: "완료", value: "완료" },
      ],
      onChange: (value) => {
        const next = Array.isArray(value) ? value[0] ?? "" : value;
        const filtered = applyFilters("", next ?? "");
        dataTable.updateData(filtered);
      },
    });

    filterWrapper.append(filter, statusQuickSelect);

    const dataTable = createDataTable({
      columns: TABLE_COLUMNS,
      data: PROJECTS,
      caption: "프로젝트 현황",
      onRowClick: (row) => {
        showToast({
          message: `${String(row.name)} 상세 화면으로 이동합니다`,
          type: "info",
          duration: 2000,
        });
      },
    });

    tableWrapper.append(dataTable);

    const accordion = createAccordion({
      title: "프로젝트 알림",
      content: "팀에게 공유할 메모를 작성하세요.",
      onDeleteRequest: ({ defaultHandler }) => defaultHandler(),
    });

    container.append(metricsWrapper, filterWrapper, tableWrapper, accordion);

    hydrateVanilaComponents({ root: container });
  }, []);

  return <div ref={containerRef} className="playground" />;
}

function applyFilters(queryRaw: unknown, statusRaw: unknown) {
  const query = typeof queryRaw === "string" ? queryRaw.toLowerCase().trim() : "";
  const status = typeof statusRaw === "string" ? statusRaw : "";

  return PROJECTS.filter((project) => {
    const matchesQuery =
      !query ||
      project.name.toLowerCase().includes(query) ||
      project.owner.toLowerCase().includes(query) ||
      project.status.toLowerCase().includes(query);
    const matchesStatus = !status || project.status === status;
    return matchesQuery && matchesStatus;
  });
}

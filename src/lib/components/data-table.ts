import {
  createElementFromMarkup,
  createId,
  isBrowser,
  setComponentAttr,
} from "../utils/dom";

const COMPONENT_NAME = "data-table";
const ROW_DATA_ATTRIBUTE = "data-vanila-row";

export type TableAlignment = "left" | "center" | "right";
export type SortDirection = "asc" | "desc";

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: TableAlignment;
  sortable?: boolean;
  render?: (value: unknown, row: T) => string;
}

export interface DataTableAppearanceOptions {
  zebra?: boolean;
  compact?: boolean;
  caption?: string;
}

export interface DataTableBehaviorOptions<T = Record<string, unknown>> {
  onRowClick?: (row: T, index: number, event: MouseEvent) => void;
  onSortChange?: (columnKey: string, direction: SortDirection) => void;
  initialSort?: { columnKey: string; direction?: SortDirection };
}

export type DataTableOptions<T = Record<string, unknown>> = {
  columns: TableColumn<T>[];
  data: T[];
} & DataTableAppearanceOptions &
  DataTableBehaviorOptions<T>;

export interface DataTableMarkupOptions<T = Record<string, unknown>>
  extends DataTableAppearanceOptions {
  columns: TableColumn<T>[];
  data: T[];
  idPrefix?: string;
  includeDataAttributes?: boolean;
}

export type DataTableHydrationOptions<T = Record<string, unknown>> =
  DataTableBehaviorOptions<T> &
    DataTableAppearanceOptions & {
      columns?: TableColumn<T>[];
    };

export interface DataTableElement<T = Record<string, unknown>>
  extends HTMLDivElement {
  updateData: (rows: T[]) => void;
  sortBy: (columnKey: string, direction?: SortDirection) => void;
}

type RowRecord = Record<string, unknown>;

const tableStates = new WeakMap<HTMLDivElement, DataTableState<RowRecord>>();

interface DataTableState<T> {
  columns: TableColumn<T>[];
  data: T[];
  zebra: boolean;
  compact: boolean;
  onRowClick?: (row: T, index: number, event: MouseEvent) => void;
  onSortChange?: (columnKey: string, direction: SortDirection) => void;
  currentSort?: { columnKey: string; direction: SortDirection };
}

const toRowRecord = <T>(row: T): RowRecord => ({ ...(row as RowRecord) });

const serializeRow = (row: RowRecord): string =>
  encodeURIComponent(JSON.stringify(row));

const deserializeRow = <T>(element: HTMLElement): T => {
  const encoded = element.getAttribute(ROW_DATA_ATTRIBUTE);
  if (!encoded) {
    return {} as T;
  }

  try {
    return JSON.parse(decodeURIComponent(encoded)) as T;
  } catch (error) {
    console.warn("Failed to parse table row data", error);
    return {} as T;
  }
};

const resolveValue = (row: RowRecord, key: string): unknown => {
  if (key in row) {
    return row[key];
  }

  const segments = key.split(".");
  let current: unknown = row;
  for (const segment of segments) {
    if (
      current &&
      typeof current === "object" &&
      segment in (current as Record<string, unknown>)
    ) {
      current = (current as Record<string, unknown>)[segment];
    } else {
      return undefined;
    }
  }

  return current;
};

const formatCell = <T>(
  column: TableColumn<T>,
  row: RowRecord,
  original: T
): string => {
  const value = resolveValue(row, String(column.key));
  if (column.render) {
    return column.render(value, original);
  }

  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number") {
    return String(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return String(value);
};

const createTableRowMarkup = <T>(
  columns: TableColumn<T>[],
  row: T,
  index: number
): string => {
  const record = toRowRecord(row);
  const cells = columns
    .map((column) => {
      const alignAttr = column.align ? ` data-align="${column.align}"` : "";
      return `<td${alignAttr}>${formatCell(column, record, row)}</td>`;
    })
    .join("");

  return `<tr ${ROW_DATA_ATTRIBUTE}="${serializeRow(
    record
  )}" data-row-index="${index}">${cells}</tr>`;
};

const createTableBodyMarkup = <T>(
  columns: TableColumn<T>[],
  data: T[]
): string => {
  return data
    .map((row, index) => createTableRowMarkup(columns, row, index))
    .join("");
};

const createColGroupMarkup = <T>(columns: TableColumn<T>[]): string => {
  const cols = columns
    .map((column) => {
      if (!column.width) {
        return "<col />";
      }
      return `<col style="width: ${column.width}" />`;
    })
    .join("");
  return `<colgroup>${cols}</colgroup>`;
};

const createHeaderMarkup = <T>(
  columns: TableColumn<T>[],
  sortable?: boolean,
  idPrefix?: string
): string => {
  const headerCells = columns
    .map((column) => {
      const key = String(column.key);
      const columnId = idPrefix
        ? `${idPrefix}-${key}`
        : createId("vanila-table-col");
      const alignAttr = column.align ? ` data-align="${column.align}"` : "";
      const sortableAttr =
        sortable && column.sortable !== false ? ' data-sortable="true"' : "";
      return `<th scope="col" id="${columnId}" data-column-key="${key}"${alignAttr}${sortableAttr}>${column.header}</th>`;
    })
    .join("");

  return `<thead><tr>${headerCells}</tr></thead>`;
};

export const renderDataTableMarkup = <T>({
  columns,
  data,
  zebra = false,
  compact = false,
  caption,
  idPrefix,
  includeDataAttributes = true,
}: DataTableMarkupOptions<T>): string => {
  const dataAttr = includeDataAttributes
    ? ` data-vanila-component="${COMPONENT_NAME}"`
    : "";
  const captionMarkup = caption ? `<caption>${caption}</caption>` : "";
  const tableClasses = [
    "vanila-table",
    zebra ? "vanila-table--zebra" : "",
    compact ? "vanila-table--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const hasSortable = columns.some((column) => column.sortable !== false);

  return `
  <div class="table-container"${dataAttr}>
    <table class="${tableClasses}">
      ${captionMarkup}
      ${createColGroupMarkup(columns)}
      ${createHeaderMarkup(columns, hasSortable, idPrefix)}
      <tbody>
        ${createTableBodyMarkup(columns, data)}
      </tbody>
    </table>
  </div>
  `;
};

const repaintTable = <T>(wrapper: HTMLDivElement, state: DataTableState<T>) => {
  const table = wrapper.querySelector("table");
  const tbody = table?.querySelector("tbody");
  if (!table || !tbody) {
    return;
  }

  const classes = [
    "vanila-table",
    state.zebra ? "vanila-table--zebra" : "",
    state.compact ? "vanila-table--compact" : "",
  ]
    .filter(Boolean)
    .join(" ");
  table.className = classes;
  tbody.innerHTML = createTableBodyMarkup(state.columns, state.data);
};

const updateSortIndicators = (
  wrapper: HTMLDivElement,
  state: DataTableState<RowRecord>
) => {
  const headers = wrapper.querySelectorAll<HTMLTableCellElement>(
    "th[data-column-key]"
  );
  headers.forEach((header) => {
    const key = header.getAttribute("data-column-key");
    if (state.currentSort && key === state.currentSort.columnKey) {
      header.setAttribute(
        "aria-sort",
        state.currentSort.direction === "asc" ? "ascending" : "descending"
      );
      header.dataset.sortDirection = state.currentSort.direction;
    } else {
      header.removeAttribute("aria-sort");
      delete header.dataset.sortDirection;
    }
  });
};

const getSortableColumns = <T>(
  columns: TableColumn<T>[],
  sortable?: boolean
): TableColumn<T>[] => {
  if (!sortable) {
    return [];
  }
  return columns.filter((column) => column.sortable !== false);
};

const sortData = <T>(
  state: DataTableState<T>,
  columnKey: string,
  direction: SortDirection
): void => {
  const column = state.columns.find((col) => String(col.key) === columnKey);
  if (!column) {
    return;
  }

  const compare = (a: T, b: T): number => {
    const aValue = resolveValue(toRowRecord(a), columnKey);
    const bValue = resolveValue(toRowRecord(b), columnKey);

    if (aValue === bValue) {
      return 0;
    }

    if (aValue === undefined || aValue === null) {
      return -1;
    }

    if (bValue === undefined || bValue === null) {
      return 1;
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return aValue - bValue;
    }

    return String(aValue).localeCompare(String(bValue));
  };

  state.data = [...state.data].sort((a, b) => {
    const result = compare(a, b);
    return direction === "asc" ? result : -result;
  });

  state.currentSort = { columnKey, direction };
};

const attachBehavior = <T>(
  wrapper: HTMLDivElement,
  options: DataTableBehaviorOptions<T>,
  columns: TableColumn<T>[],
  data: T[],
  appearance: DataTableAppearanceOptions
) => {
  setComponentAttr(wrapper, COMPONENT_NAME);

  const state: DataTableState<T> = {
    columns,
    data,
    zebra: Boolean(appearance.zebra),
    compact: Boolean(appearance.compact),
    onRowClick: options.onRowClick,
    onSortChange: options.onSortChange,
  };

  tableStates.set(wrapper, state as DataTableState<RowRecord>);

  const table = wrapper.querySelector("table");
  const tbody = table?.querySelector("tbody");

  const handleRowClick = (event: Event) => {
    const rowElement = (
      event.target as HTMLElement
    ).closest<HTMLTableRowElement>("tr");
    if (!rowElement || !state.onRowClick) {
      return;
    }

    const indexAttr = rowElement.getAttribute("data-row-index");
    const rowIndex = indexAttr ? Number(indexAttr) : -1;
    const rowData = deserializeRow<T>(rowElement);

    state.onRowClick(rowData, rowIndex, event as MouseEvent);
  };

  tbody?.addEventListener("click", handleRowClick);

  const sortableColumns = getSortableColumns(columns, true);

  const handleHeaderClick = (event: MouseEvent) => {
    const header = (event.target as HTMLElement).closest<HTMLTableCellElement>(
      "th[data-sortable]"
    );
    if (!header) {
      return;
    }

    const columnKey = header.getAttribute("data-column-key");
    if (!columnKey) {
      return;
    }

    const currentDirection = header.dataset.sortDirection as
      | SortDirection
      | undefined;
    const nextDirection: SortDirection =
      currentDirection === "asc" ? "desc" : "asc";

    sortData(state, columnKey, nextDirection);
    repaintTable(wrapper, state);
    updateSortIndicators(wrapper, state as DataTableState<RowRecord>);
    state.onSortChange?.(columnKey, nextDirection);
  };

  if (sortableColumns.length > 0) {
    wrapper.addEventListener("click", handleHeaderClick);
  }

  if (options.initialSort) {
    sortData(
      state,
      options.initialSort.columnKey,
      options.initialSort.direction ?? "asc"
    );
    repaintTable(wrapper, state);
  }

  updateSortIndicators(wrapper, state as DataTableState<RowRecord>);

  const updateData = (rows: T[]) => {
    state.data = rows;
    repaintTable(wrapper, state);
    updateSortIndicators(wrapper, state as DataTableState<RowRecord>);
  };

  const sortBy = (columnKey: string, direction: SortDirection = "asc") => {
    sortData(state, columnKey, direction);
    repaintTable(wrapper, state);
    updateSortIndicators(wrapper, state as DataTableState<RowRecord>);
  };

  Object.defineProperties(wrapper, {
    updateData: {
      value: updateData,
      writable: false,
      enumerable: false,
    },
    sortBy: {
      value: sortBy,
      writable: false,
      enumerable: false,
    },
  });
};

export const createDataTable = <T>(
  options: DataTableOptions<T>
): DataTableElement<T> => {
  if (!isBrowser) {
    throw new Error("createDataTable requires a browser environment.");
  }

  const markup = renderDataTableMarkup<T>({
    columns: options.columns,
    data: options.data,
    zebra: options.zebra,
    compact: options.compact,
    caption: options.caption,
  });

  const wrapper = createElementFromMarkup<HTMLDivElement>(
    markup
  ) as DataTableElement<T>;

  attachBehavior(wrapper, options, options.columns, options.data, {
    zebra: options.zebra,
    compact: options.compact,
  });

  return wrapper;
};

export const hydrateDataTable = <T>(
  wrapper: HTMLDivElement,
  options: DataTableHydrationOptions<T> = {}
): DataTableElement<T> => {
  const table = wrapper.querySelector("table");
  const headers = Array.from(
    wrapper.querySelectorAll<HTMLTableCellElement>("th[data-column-key]")
  );
  const columns: TableColumn<T>[] = (options.columns ??
    headers.map<TableColumn<T>>((header) => ({
      key: header.getAttribute("data-column-key") ?? "",
      header: header.textContent ?? "",
      sortable: header.hasAttribute("data-sortable"),
      align: (header.dataset.align as TableAlignment | undefined) ?? undefined,
    }))) as TableColumn<T>[];

  const rows = Array.from(
    table?.querySelectorAll<HTMLTableRowElement>("tbody tr") ?? []
  ).map((row) => deserializeRow<T>(row));

  attachBehavior(wrapper, options, columns, rows, {
    zebra: options.zebra,
    compact: options.compact,
  });

  return wrapper as DataTableElement<T>;
};

export type PreviewId =
  | "input-field"
  | "select-field"
  | "accordion"
  | "filter-bar"
  | "data-table"
  | "toast";

export interface ComponentDocEntry {
  slug: string;
  name: string;
  description: string;
  category: "form" | "data" | "feedback" | "layout" | "overlay";
  features: string[];
  ssrExample: string;
  clientExample: string;
  preview: PreviewId;
  api: ComponentApiField[];
}

export interface ComponentApiField {
  name: string;
  type: string;
  description: string;
  defaultValue?: string;
}

export const COMPONENTS: ComponentDocEntry[] = [
  {
    slug: "input-field",
    name: "Input Field",
    category: "form",
    description: "Accessible text input with sizing, helper text, affixes, validation state, and programmatic APIs.",
    features: [
      "SSR markup helper and hydration",
      "Prefix/suffix affixes",
      "setValue / setError runtime helpers",
    ],
    ssrExample: `renderInputFieldMarkup({\n  name: \"project\",\n  label: \"Project name\",\n  helperText: \"Internal only\"\n});`,
    clientExample: `hydrateInputField(element, {\n  onChange: (value) => console.log(value),\n});`,
    preview: "input-field",
    api: [
      { name: "name", type: "string", description: "Form field name attribute" },
      { name: "label", type: "string", description: "Visible label rendered above the input" },
      { name: "placeholder", type: "string", description: "Optional hint rendered inside the input", defaultValue: "undefined" },
      { name: "size", type: '"sm" | "md" | "lg"', description: "Controls padding and font size", defaultValue: '"md"' },
      { name: "helperText", type: "string", description: "Small helper text rendered below the field", defaultValue: "undefined" },
      { name: "onChange", type: "(value: string, event: Event) => void", description: "Fired when value changes" },
      { name: "setValue", type: "method", description: "Imperative method on hydrated element" },
    ],
  },
  {
    slug: "select-field",
    name: "Select Field",
    category: "form",
    description: "Single or multi-select dropdown with placeholder support and dynamic option updates.",
    features: [
      "Placeholder and helper text",
      "Dynamic setOptions + setValue",
      "Custom change/blur hooks",
    ],
    ssrExample: `renderSelectFieldMarkup({\n  name: \"status\",\n  label: \"상태\",\n  options: STATUS_OPTIONS\n});`,
    clientExample: `hydrateSelectField(element, {\n  onChange: (value) => console.log(value),\n});`,
    preview: "select-field",
    api: [
      { name: "options", type: "{ label: string; value: string; disabled?: boolean }[]", description: "Options rendered in the dropdown" },
      { name: "multiple", type: "boolean", description: "Enable multi selection", defaultValue: "false" },
      { name: "placeholder", type: "string", description: "Placeholder option rendered for single selects", defaultValue: "undefined" },
      { name: "value", type: "string | string[]", description: "Preselected value(s)", defaultValue: "undefined" },
      { name: "onChange", type: "(value: string | string[], event: Event) => void", description: "Invoked whenever selection changes" },
      { name: "setOptions", type: "method", description: "Replace options after hydration" },
    ],
  },
  {
    slug: "accordion",
    name: "Accordion",
    category: "layout",
    description: "Editable accordion item with delete confirmation hooks and inline content editing.",
    features: [
      "Editable content areas",
      "Custom delete request flow",
      "Toggle programmatically via .toggle()",
    ],
    ssrExample: `renderAccordionMarkup({\n  title: \"FAQ\",\n  content: \"서버에서 생성한 마크업\"\n});`,
    clientExample: `hydrateAccordion(element, {\n  onDeleteRequest: (ctx) => ctx.defaultHandler(),\n});`,
    preview: "accordion",
    api: [
      { name: "title", type: "string", description: "Heading text displayed in the accordion header" },
      { name: "content", type: "string", description: "Initial body content (can be edited inline)" },
      { name: "editable", type: "boolean", description: "Toggle inline editing", defaultValue: "true" },
      { name: "onContentChange", type: "(value: string) => void", description: "Called when edited content is committed" },
      { name: "onDeleteRequest", type: "(ctx: AccordionDeleteRequestContext) => void", description: "Intercept delete action and provide custom UI" },
    ],
  },
  {
    slug: "filter-bar",
    name: "Filter Bar",
    category: "data",
    description: "Composable form layout for search, filters, and preset selections in admin dashboards.",
    features: [
      "Inline or stacked layout",
      "autoSubmit + getValues helpers",
      "Multi-select and number inputs",
    ],
    ssrExample: `renderFilterBarMarkup({\n  fields: [\n    { type: \"search\", name: \"query\", label: \"검색어\" }\n  ]\n});`,
    clientExample: `hydrateFilterBar(element, {\n  autoSubmit: true,\n  onSubmit: console.log,\n});`,
    preview: "filter-bar",
    api: [
      { name: "fields", type: "FilterField[]", description: "Configuration for each filter control" },
      { name: "layout", type: '"inline" | "stacked"', description: "Flex layout variant", defaultValue: '"inline"' },
      { name: "gap", type: "string", description: "CSS gap value between fields", defaultValue: "16px" },
      { name: "autoSubmit", type: "boolean", description: "Automatically submit on change", defaultValue: "false" },
      { name: "onSubmit", type: "(values: Record<string, unknown>) => void", description: "Submit handler returning current values" },
      { name: "getValues", type: "method", description: "Imperative helper to read form state" },
    ],
  },
  {
    slug: "data-table",
    name: "Data Table",
    category: "data",
    description: "Sortable, accessible data table tuned for list/detail admin flows with SSR-first rendering.",
    features: [
      "Column renderers",
      "Sort + updateData helpers",
      "Row click callbacks",
    ],
    ssrExample: `renderDataTableMarkup({\n  columns: COLUMNS,\n  data: ROWS\n});`,
    clientExample: `hydrateDataTable(element, {\n  onSortChange: console.log,\n});`,
    preview: "data-table",
    api: [
      { name: "columns", type: "TableColumn[]", description: "Column definitions including keys, headers, renderers" },
      { name: "data", type: "Record<string, unknown>[]", description: "Rows rendered into the table body" },
      { name: "caption", type: "string", description: "Accessible caption text", defaultValue: "undefined" },
      { name: "zebra", type: "boolean", description: "Enable zebra striping", defaultValue: "false" },
      { name: "initialSort", type: "{ columnKey: string; direction?: 'asc' | 'desc' }", description: "Initial sort state" },
      { name: "updateData", type: "method", description: "Replace data after hydration" },
    ],
  },
  {
    slug: "toast",
    name: "Toast",
    category: "feedback",
    description: "Stackable toast notifications with queues, dismiss controls, and multiple positions.",
    features: [
      "Dismissible + auto close",
      "Container targeting",
      "Info / success / error variants",
    ],
    ssrExample: `createToast({\n  message: \"Saved!\",\n  type: \"success\"\n});`,
    clientExample: `showToast({\n  message: \"성공\",\n  type: \"success\"\n});`,
    preview: "toast",
    api: [
      { name: "message", type: "string", description: "Toast body text" },
      { name: "type", type: '"info" | "success" | "error"', description: "Visual variant", defaultValue: '"info"' },
      { name: "duration", type: "number", description: "Auto-dismiss in ms (0 disables)", defaultValue: "3000" },
      { name: "container", type: "string | HTMLElement", description: "Custom container element or selector", defaultValue: "document.body" },
      { name: "dismissible", type: "boolean", description: "Show close button", defaultValue: "false" },
    ],
  },
];

export const COMPONENT_CATEGORIES: Record<string, string> = {
  form: "Form Controls",
  data: "Data Display",
  feedback: "Feedback",
  layout: "Layout",
  overlay: "Overlay",
};

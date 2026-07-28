import { ADMIN_SESSION_STORAGE, adminSections } from "./adminConstants";

export const loadStoredSession = () => {
  try {
    const rawSession = sessionStorage.getItem(ADMIN_SESSION_STORAGE);
    return rawSession ? JSON.parse(rawSession) : null;
  } catch {
    return null;
  }
};

export const getActiveAdminSection = () => {
  const path = window.location.pathname.replace(/\/$/, "") || "/admin";
  const section = adminSections.find((item) => item.path === path);

  return section?.id || "overview";
};

export const countBy = (items, field) =>
  items.reduce((counts, item) => {
    const key = item[field] || "unknown";
    counts[key] = (counts[key] || 0) + 1;
    return counts;
  }, {});

export const includesSearch = (values, search) =>
  values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .includes(search.trim().toLowerCase());

export const formatDate = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatDateTime = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatMoney = (amount, currency = "NGN") =>
  new Intl.NumberFormat(undefined, {
    currency,
    maximumFractionDigits: 0,
    style: "currency",
  }).format(Number(amount) || 0);

const toCsvValue = (value) => {
  const normalized = value === undefined || value === null ? "" : String(value);
  return `"${normalized.replaceAll('"', '""')}"`;
};

export const downloadCsv = ({ filename, headers, rows }) => {
  const csv = [headers, ...rows]
    .map((row) => row.map(toCsvValue).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

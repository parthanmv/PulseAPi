const LOCALE = "en-IN";
const TIMEZONE = "Asia/Kolkata";

const DATE_OPTS = { timeZone: TIMEZONE, day: "2-digit", month: "short", year: "numeric" };
const FULL_OPTS = { ...DATE_OPTS, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
const SHORT_OPTS = { timeZone: TIMEZONE, day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true };
const TIME_OPTS = { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true };
const CHART_OPTS = { timeZone: TIMEZONE, hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false };

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

export function formatIST(dateString) {
  const d = toDate(dateString);
  if (!d) return "Never";
  return d.toLocaleString(LOCALE, FULL_OPTS);
}

export function formatISTShort(dateString) {
  const d = toDate(dateString);
  if (!d) return "\u2014";
  return d.toLocaleString(LOCALE, SHORT_OPTS);
}

export function formatDate(dateString) {
  const d = toDate(dateString);
  if (!d) return "N/A";
  return d.toLocaleDateString(LOCALE, DATE_OPTS);
}

export function formatTime(dateString) {
  const d = toDate(dateString);
  if (!d) return "\u2014";
  return d.toLocaleTimeString(LOCALE, TIME_OPTS);
}

export function formatChartTime(dateString) {
  const d = toDate(dateString);
  if (!d) return "";
  return d.toLocaleTimeString(LOCALE, CHART_OPTS);
}

export function getNextCheckTime(lastChecked, intervalSeconds) {
  if (!lastChecked) return null;
  const last = toDate(lastChecked);
  return last ? new Date(last.getTime() + intervalSeconds * 1000) : null;
}

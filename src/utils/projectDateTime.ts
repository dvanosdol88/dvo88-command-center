const DATE_ONLY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export function parseProjectTimestamp(timestamp: string): Date | null {
  if (DATE_ONLY_PATTERN.test(timestamp)) {
    const [year, month, day] = timestamp.split("-").map(Number);
    const parsedDateOnly = new Date(year, month - 1, day);
    return Number.isNaN(parsedDateOnly.getTime()) ? null : parsedDateOnly;
  }

  const parsed = new Date(timestamp);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function formatProjectTimestamp(timestamp: string, withYear = true): string {
  const parsed = parseProjectTimestamp(timestamp);
  if (!parsed) {
    return timestamp;
  }

  return parsed.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

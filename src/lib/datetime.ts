export function formatDateTimeForTimezone(value: string, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}`;
}

export function parseDateTimeForTimezone(value: string, timezone: string): string | null {
  const [datePart, timePart] = value.split("T");
  if (!datePart || !timePart) return null;
  const [year, month, day] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  if (![year, month, day, hour, minute].every(Number.isFinite)) return null;
  const target = Date.UTC(year, month - 1, day, hour, minute);
  let timestamp = target;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: timezone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date(timestamp));
    const get = (type: string) => Number(parts.find((part) => part.type === type)?.value);
    timestamp += target - Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"));
  }
  const resolved = formatDateTimeForTimezone(new Date(timestamp).toISOString(), timezone);
  return resolved === value ? new Date(timestamp).toISOString() : null;
}

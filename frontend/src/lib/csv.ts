/**
 * Converts an array of objects into a CSV string and triggers a download.
 * @param data        Array of row objects
 * @param filename    Downloaded file name (without extension)
 * @param columns     Optional column map: { key: "Display Label" }
 */
export function exportCSV<T extends Record<string, unknown>>(
  data: T[],
  filename: string,
  columns?: Partial<Record<keyof T, string>>
): void {
  if (!data.length) return;

  const keys = columns ? (Object.keys(columns) as (keyof T)[]) : (Object.keys(data[0]) as (keyof T)[]);
  const headers = keys.map((k) => columns?.[k] ?? String(k));

  const escape = (val: unknown): string => {
    const str = val == null ? "" : String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = data.map((row) => keys.map((k) => escape(row[k])).join(","));
  const csv = [headers.map(escape).join(","), ...rows].join("\r\n");

  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

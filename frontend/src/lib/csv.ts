/**
 * Export an array of objects to a downloadable CSV file.
 */
export function exportCSV<T extends Record<string, unknown>>(
  rows: T[],
  filename: string,
  headers?: Partial<Record<keyof T, string>>
): void {
  if (!rows.length) return;

  const keys = Object.keys(rows[0]) as (keyof T)[];
  const headerRow = keys.map((k) => headers?.[k] ?? String(k)).join(",");
  const dataRows = rows.map((row) =>
    keys
      .map((k) => {
        const val = String(row[k] ?? "");
        // Escape commas and quotes
        return val.includes(",") || val.includes('"')
          ? `"${val.replace(/"/g, '""')}"`
          : val;
      })
      .join(",")
  );

  const csv = [headerRow, ...dataRows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

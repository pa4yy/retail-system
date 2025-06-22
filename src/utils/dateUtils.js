export function getDefaultDate(type) {
  const now = new Date();
  if (type === "day" || type === "week") {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    const d = String(now.getDate()).padStart(2, "0");
    return [`${y}-${m}-01`, `${y}-${m}-${d}`];
  }
  if (type === "month") {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    return [`${y}-01`, `${y}-${m}`];
  }
  if (type === "year") {
    const y = now.getFullYear();
    return [String(y), String(y)];
  }
  return ["", ""];
}

export function getMonthRange(start, end) {
  const result = [];
  let current = new Date(start + "-01");
  const last = new Date(end + "-01");
  while (current <= last) {
    result.push(
      `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`
    );
    current.setMonth(current.getMonth() + 1);
  }
  return result;
}

export function getYearRange(start, end) {
  const result = [];
  let s = parseInt(start, 10);
  let e = parseInt(end, 10);
  for (let y = s; y <= e; y++) {
    result.push(String(y));
  }
  return result;
}

export function formatDateThai(dateStr) {
  if (!dateStr) return "";
  const months = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];
  const d = new Date(dateStr);
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
} 
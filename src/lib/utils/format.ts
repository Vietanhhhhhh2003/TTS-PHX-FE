// lib/utils/format.ts
// Các hàm format hiển thị (display) - dùng ở bảng list và form.
// Quy ước: trong data/state luôn lưu ISO yyyy-mm-dd; chỉ convert sang dd-mm-yyyy khi HIỂN THỊ.

// ISO (yyyy-mm-dd) -> hiển thị (dd-mm-yyyy)
export function formatDate(isoDate?: string): string {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Hiển thị (dd-mm-yyyy) -> ISO (yyyy-mm-dd). Dùng khi nhận input từ form rồi lưu lại.
export function parseDisplayDate(displayDate: string): string {
  const parts = displayDate.split("-");
  if (parts.length !== 3) return displayDate;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// SĐT -> nhóm "0387 682 097" cho dễ đọc. Chỉ format khi đủ 10 số, không thì trả nguyên.
export function formatPhone(phone: string): string {
  if (!phone) return "";
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

// Map value (id/mã lưu trong data) -> label hiển thị. Không tìm thấy thì trả về chính value.
export function getOptionLabel(
  options: { value: string; label: string }[],
  value?: string,
): string {
  if (!value) return "";
  return options.find((o) => o.value === value)?.label ?? value;
}

// Giới tính: enum -> tiếng Việt
export function getGenderLabel(gender?: string): string {
  const map: Record<string, string> = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };
  return gender ? (map[gender] ?? gender) : "";
}

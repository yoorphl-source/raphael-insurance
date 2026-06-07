// ── Name ────────────────────────────────────────────────────────────

const NAME_PREFIX_RE = /^(제\s*이름은|이름은|저는|나는|전|저|나|그냥)\s*/;
const NAME_SUFFIX_RE =
  /\s*(이라고\s*합니다|라고\s*합니다|이라고\s*해요|라고\s*해요|이에요|이예요|예요|입니다|이야|야|요)[\s!.~,]*$/;
const PUNCT_TRIM_RE = /^[\s!.~,\-_]+|[\s!.~,\-_]+$/g;

export function normalizeName(raw: string): string {
  let s = raw.trim();
  s = s.replace(NAME_PREFIX_RE, '');
  s = s.replace(NAME_SUFFIX_RE, '');
  s = s.replace(PUNCT_TRIM_RE, '');
  return s || raw.trim();
}

// ── DOB ─────────────────────────────────────────────────────────────

function twoDigitYear(yy: number): number {
  const currentYY = new Date().getFullYear() % 100;
  return yy <= currentYY ? 2000 + yy : 1900 + yy;
}

function isValidDate(year: number, month: number, day: number): boolean {
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  const d = new Date(year, month - 1, day);
  return (
    d.getFullYear() === year &&
    d.getMonth() === month - 1 &&
    d.getDate() === day
  );
}

function toISO(year: number, month: number, day: number): string | null {
  if (!isValidDate(year, month, day)) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function normalizeDOB(raw: string): string | null {
  const s = raw.trim();
  if (!s) return null;

  // Korean: 1990년 1월 1일, 90년 1월 1일
  const kor = s.match(/^(\d{2,4})\s*년\s*(\d{1,2})\s*월\s*(\d{1,2})\s*일?$/);
  if (kor) {
    const y = parseInt(kor[1]);
    return toISO(y < 100 ? twoDigitYear(y) : y, parseInt(kor[2]), parseInt(kor[3]));
  }

  // Separator: 1990-01-01, 1990.01.01, 1990/1/1, 90.01.01
  const sep = s.match(/^(\d{2,4})[.\-/](\d{1,2})[.\-/](\d{1,2})$/);
  if (sep) {
    const y = parseInt(sep[1]);
    return toISO(y < 100 ? twoDigitYear(y) : y, parseInt(sep[2]), parseInt(sep[3]));
  }

  // Pure digits: 19900101 (8) or 900101 (6)
  const digits = s.replace(/\D/g, '');
  if (digits.length === 8) {
    return toISO(
      parseInt(digits.slice(0, 4)),
      parseInt(digits.slice(4, 6)),
      parseInt(digits.slice(6, 8)),
    );
  }
  if (digits.length === 6) {
    return toISO(
      twoDigitYear(parseInt(digits.slice(0, 2))),
      parseInt(digits.slice(2, 4)),
      parseInt(digits.slice(4, 6)),
    );
  }

  return null;
}

// ── Phone ────────────────────────────────────────────────────────────

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length !== 11 || !digits.startsWith('010')) return null;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

// ── Number extraction (평수, 연식 등) ────────────────────────────────

export function extractNumber(raw: string): number | null {
  const match = raw.replace(/,/g, '').match(/\d+/);
  return match ? parseInt(match[0]) : null;
}

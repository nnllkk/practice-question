const ENTRY_KEY_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const MAINLAND_ID_CARD_PATTERN = /^\d{17}[\dX]$/;
const ID_CARD_WEIGHTS = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2];
const ID_CARD_CHECK_CODES = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2'];

export function generateEntryKey(length = 6): string {
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * ENTRY_KEY_CHARS.length);
    return ENTRY_KEY_CHARS[index];
  }).join('');
}

function isValidDateSegment(segment: string): boolean {
  const year = Number(segment.slice(0, 4));
  const month = Number(segment.slice(4, 6));
  const day = Number(segment.slice(6, 8));

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

export function isValidMainlandChinaIdCard(value: string): boolean {
  const normalized = value.trim().toUpperCase();
  if (!MAINLAND_ID_CARD_PATTERN.test(normalized)) {
    return false;
  }

  const dateSegment = normalized.slice(6, 14);
  if (!isValidDateSegment(dateSegment)) {
    return false;
  }

  const checksum = normalized
    .slice(0, 17)
    .split('')
    .reduce((sum, digit, index) => sum + Number(digit) * ID_CARD_WEIGHTS[index], 0);

  const expectedCheckCode = ID_CARD_CHECK_CODES[checksum % 11];
  return normalized[17] === expectedCheckCode;
}

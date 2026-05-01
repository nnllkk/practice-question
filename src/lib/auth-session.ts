const MAINLAND_ID_CARD_STORAGE_PATTERN = /^\d{17}[\dX]$/;

export function parseStoredIdCard(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.trim().toUpperCase();
  return MAINLAND_ID_CARD_STORAGE_PATTERN.test(normalized) ? normalized : null;
}

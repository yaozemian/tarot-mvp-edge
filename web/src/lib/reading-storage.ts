import type { PendingReading, ReadingRecord } from "../types/tarot";

const PENDING_KEY = "luna-arcana-pending";
const HISTORY_KEY = "luna-arcana-history";

export function savePendingReading(reading: PendingReading) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(reading));
}

export function getPendingReading(): PendingReading | null {
  const raw = localStorage.getItem(PENDING_KEY);
  return raw ? (JSON.parse(raw) as PendingReading) : null;
}

export function clearPendingReading() {
  localStorage.removeItem(PENDING_KEY);
}

export function saveReadingRecord(record: ReadingRecord) {
  const records = getReadingRecords();
  const next = [record, ...records.filter((item) => item.id !== record.id)];
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next.slice(0, 50)));
}

export function getReadingRecords(): ReadingRecord[] {
  const raw = localStorage.getItem(HISTORY_KEY);

  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as ReadingRecord[];
  } catch {
    return [];
  }
}

export function getReadingRecord(id: string) {
  return getReadingRecords().find((record) => record.id === id) ?? null;
}

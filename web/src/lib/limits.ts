import type { ReadingMode } from "../types/tarot";

const LIMITS: Record<ReadingMode, number> = {
  question: 3,
  daily: 1,
};

type UsageState = {
  date: string;
  question: number;
  daily: number;
};

const KEY = "luna-arcana-usage";

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getState(): UsageState {
  const fallback: UsageState = { daily: 0, date: todayKey(), question: 0 };
  const raw = localStorage.getItem(KEY);

  if (!raw) {
    return fallback;
  }

  try {
    const parsed = JSON.parse(raw) as UsageState;
    return parsed.date === todayKey() ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function setState(state: UsageState) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function getRemaining(mode: ReadingMode) {
  const state = getState();
  return Math.max(0, LIMITS[mode] - state[mode]);
}

export function consumeReading(mode: ReadingMode) {
  const state = getState();

  if (state[mode] >= LIMITS[mode]) {
    return false;
  }

  setState({ ...state, [mode]: state[mode] + 1 });
  return true;
}

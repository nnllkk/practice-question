export interface QuizSettings {
  questionCount: number;
  timeLimitMinutes: number;
}

export const DEFAULT_QUIZ_SETTINGS: QuizSettings = {
  questionCount: 50,
  timeLimitMinutes: 30,
};

export function clampQuestionCount(requestedCount: number, availableCount: number): number {
  return Math.max(1, Math.min(requestedCount, availableCount));
}

export function formatRemainingTime(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

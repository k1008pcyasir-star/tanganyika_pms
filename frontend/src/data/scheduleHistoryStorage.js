const STORAGE_KEY = "tpms_schedule_history";

export function getStoredScheduleHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read schedule history from localStorage:", error);
    return [];
  }
}

export function saveStoredScheduleHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (error) {
    console.error("Failed to save schedule history to localStorage:", error);
  }
}
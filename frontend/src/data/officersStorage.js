const STORAGE_KEY = "tpms_officers";

export function getStoredOfficers() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read officers from localStorage:", error);
    return [];
  }
}

export function saveStoredOfficers(officers) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(officers));
  } catch (error) {
    console.error("Failed to save officers to localStorage:", error);
  }
}
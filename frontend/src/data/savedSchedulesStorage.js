const STORAGE_KEY = "tpms_saved_schedules";

export function getSavedSchedules() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error("Failed to read saved schedules:", error);
    return [];
  }
}

export function saveSchedules(schedules) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
  } catch (error) {
    console.error("Failed to save schedules:", error);
  }
}

export function addSavedSchedule(schedule) {
  const current = getSavedSchedules();
  const updated = [schedule, ...current];
  saveSchedules(updated);
  return updated;
}

export function deleteSavedSchedule(scheduleId) {
  const current = getSavedSchedules();
  const updated = current.filter((item) => item.id !== scheduleId);
  saveSchedules(updated);
  return updated;
}
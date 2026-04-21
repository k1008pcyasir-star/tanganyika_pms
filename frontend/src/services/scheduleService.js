const API_URL = "https://tanganyika-pms-backend.onrender.com/api/schedules";

export async function fetchSchedules() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch schedules");
  }

  return response.json();
}

export async function createSchedule(scheduleData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(scheduleData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create schedule");
  }

  return response.json();
}

export async function deleteSchedule(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete schedule");
  }

  return response.json();
}
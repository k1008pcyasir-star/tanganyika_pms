const API_URL = "http://localhost:5000/api/officers";

export async function fetchOfficers() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch officers");
  }

  return response.json();
}

export async function fetchOfficerStats() {
  const response = await fetch(`${API_URL}/stats`);

  if (!response.ok) {
    throw new Error("Failed to fetch officer stats");
  }

  return response.json();
}

export async function createOfficer(officerData) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(officerData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create officer");
  }

  return response.json();
}

export async function updateOfficer(id, officerData) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(officerData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to update officer");
  }

  return response.json();
}

export async function deleteOfficer(id) {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to delete officer");
  }

  return response.json();
}
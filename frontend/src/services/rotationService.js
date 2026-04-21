const API_URL = "http://localhost:5000/api/rotations";

export async function fetchLatestRotations() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Failed to fetch rotation history");
  }

  return response.json();
}

export async function createRotationHistory(entries) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ entries }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to save rotation history");
  }

  return response.json();
}
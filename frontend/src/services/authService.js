const API_URL = "https://tanganyika-pms-backend.onrender.com/api/auth";

export async function loginAdmin(loginData) {
  const response = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(loginData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  return data;
}

export function saveAuth(authData) {
  localStorage.setItem("tpms_token", authData.token);
  localStorage.setItem("tpms_admin", JSON.stringify(authData.admin));
}

export function getToken() {
  return localStorage.getItem("tpms_token");
}

export function getAdmin() {
  const raw = localStorage.getItem("tpms_admin");
  return raw ? JSON.parse(raw) : null;
}

export function logoutAdmin() {
  localStorage.removeItem("tpms_token");
  localStorage.removeItem("tpms_admin");
}

export function isAuthenticated() {
  return !!getToken();
}
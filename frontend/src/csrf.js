import { API_BASE_URL } from "./apiConfig";

let csrfToken = null;

export async function fetchCsrfToken() {
  if (csrfToken) return csrfToken;

  try {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      csrfToken = data.csrf_token;
    }
  } catch {
    // Backend unreachable; continue without CSRF token
  }

  return csrfToken;
}

export function getCsrfToken() {
  return csrfToken;
}

export function csrfHeaders() {
  const token = csrfToken;
  return token ? { "X-CSRFToken": token } : {};
}

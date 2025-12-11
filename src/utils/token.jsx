const ACCESS_KEY = "accessToken";
const REFRESH_KEY = "refreshToken";

export function saveToken(token) {
  localStorage.setItem(ACCESS_KEY, token);
}

export function saveRefreshToken(token) {
  localStorage.setItem(REFRESH_KEY, token);
}

export function getToken() {
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

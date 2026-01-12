const KEY = "accessToken";

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(KEY);
}

export function setAccessToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, token);
}

export function clearAccessToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

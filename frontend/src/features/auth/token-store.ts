const ACCESS_TOKEN_KEY = "ecommerce.analytics.accessToken";

let accessToken: string | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export function hydrateAccessToken(): void {
  if (!isBrowser()) {
    return;
  }

  accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  accessToken = null;

  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
}

const STORAGE_KEYS = {
  token: "token",
  email: "email",
  role: "role",
};

export const AUTH_REDIRECT_REASONS = {
  expired: "session-expired",
  forbidden: "forbidden",
  invalid: "invalid-session",
};

function decodeBase64Url(value) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4;
  const base64 = padding ? normalized.padEnd(normalized.length + (4 - padding), "=") : normalized;

  return atob(base64);
}

export function getAuthSession() {
  return {
    token: localStorage.getItem(STORAGE_KEYS.token),
    email: localStorage.getItem(STORAGE_KEYS.email),
    role: localStorage.getItem(STORAGE_KEYS.role),
  };
}

export function saveAuthSession({ token, email, role }) {
  localStorage.setItem(STORAGE_KEYS.token, token);
  localStorage.setItem(STORAGE_KEYS.email, email);
  localStorage.setItem(STORAGE_KEYS.role, role);
}

export function clearAuthSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.email);
  localStorage.removeItem(STORAGE_KEYS.role);
}

export function getTokenPayload(token) {
  if (!token || token.split(".").length !== 3) {
    return null;
  }

  try {
    return JSON.parse(decodeBase64Url(token.split(".")[1]));
  } catch {
    return null;
  }
}

export function getSessionValidation() {
  const { token } = getAuthSession();

  if (!token) {
    return { isValid: false, reason: AUTH_REDIRECT_REASONS.invalid };
  }

  const payload = getTokenPayload(token);
  if (!payload) {
    return { isValid: false, reason: AUTH_REDIRECT_REASONS.invalid };
  }

  if (typeof payload.exp === "number" && payload.exp * 1000 <= Date.now()) {
    return { isValid: false, reason: AUTH_REDIRECT_REASONS.expired };
  }

  return { isValid: true, reason: null, payload };
}

export function hasValidAuthSession() {
  return getSessionValidation().isValid;
}

export function isProtectedPath(pathname) {
  return pathname === "/" || pathname.startsWith("/admin");
}

export function buildLoginPath(reason) {
  if (!reason) {
    return "/login";
  }

  const params = new URLSearchParams({ reason });
  return `/login?${params.toString()}`;
}

export function redirectToLogin(reason) {
  const target = buildLoginPath(reason);
  const current = `${window.location.pathname}${window.location.search}`;

  if (current !== target) {
    window.location.replace(target);
  }
}


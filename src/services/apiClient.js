const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);

const normalizeBaseUrl = (value) =>
  String(value || "")
    .trim()
    .replace(/\/+$/, "");

const normalizeApiPath = (path = "") => {
  const value = String(path || "").trim();

  if (!value) {
    return "";
  }

  return value.startsWith("/") ? value : `/${value}`;
};

const normalizeAssetPath = (assetPath) => {
  const normalizedAssetPath = String(assetPath).replace(/\\/g, "/");
  const uploadsIndex = normalizedAssetPath.toLowerCase().lastIndexOf("/uploads/");

  if (uploadsIndex >= 0) {
    return normalizedAssetPath.slice(uploadsIndex);
  }

  return normalizedAssetPath.startsWith("/")
    ? normalizedAssetPath
    : `/${normalizedAssetPath}`;
};

const REMOTE_API_BASE_URL = normalizeBaseUrl(
  import.meta?.env?.VITE_REMOTE_API_BASE_URL ||
    "https://e-comerce-backend-cfkk.onrender.com"
);

export const API_BASE_URL = normalizeBaseUrl(
  import.meta?.env?.VITE_API_BASE_URL ||
    (LOCAL_HOSTS.has(window.location.hostname)
      ? "http://localhost:5000"
      : REMOTE_API_BASE_URL)
);

const API_PREFIX = `${API_BASE_URL}/api`;

export const getApiUrl = (path = "") => {
  const normalizedPath = normalizeApiPath(path);

  if (!normalizedPath) {
    return API_PREFIX;
  }

  return normalizedPath === "/api" || normalizedPath.startsWith("/api/")
    ? `${API_BASE_URL}${normalizedPath}`
    : `${API_PREFIX}${normalizedPath}`;
};

const isAuthRoute = (url) =>
  url.startsWith("/auth/login") ||
  url.startsWith("/auth/register") ||
  url.startsWith("/auth/verify") ||
  url.startsWith("/auth/request-login-otp") ||
  url.startsWith("/auth/refresh");

export const getAssetUrl = (assetPath) => {
  if (!assetPath) {
    return "/placeholder.png";
  }

  if (/^(?:https?:|blob:|data:)/i.test(assetPath)) {
    return assetPath;
  }

  return `${API_BASE_URL}${normalizeAssetPath(assetPath)}`;
};

export const getAssetCandidates = (assetPath, fallbackAsset = "/placeholder.png") => {
  if (!assetPath) {
    return [fallbackAsset];
  }

  if (/^(?:https?:|blob:|data:)/i.test(assetPath)) {
    return [assetPath, fallbackAsset].filter(Boolean);
  }

  const normalizedPath = normalizeAssetPath(assetPath);

  const candidates = [`${API_BASE_URL}${normalizedPath}`];

  if (
    normalizedPath.toLowerCase().startsWith("/uploads/") &&
    API_BASE_URL !== REMOTE_API_BASE_URL
  ) {
    candidates.push(`${REMOTE_API_BASE_URL}${normalizedPath}`);
  }

  candidates.push(fallbackAsset);

  return [...new Set(candidates.filter(Boolean))];
};

const parseResponseBody = async (response) => {
  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  try {
    const text = await response.text();
    return text ? { message: text } : {};
  } catch {
    return {};
  }
};

export const request = async (url, method = "GET", body = null) => {
  const isFormData = body instanceof FormData;

  const makeRequest = async () => {
    const response = await fetch(getApiUrl(url), {
      method,
      credentials: "include",
      headers: isFormData ? undefined : { "Content-Type": "application/json" },
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : null,
    });

    const data = await parseResponseBody(response);
    return { response, data };
  };

  let result;

  try {
    result = await makeRequest();
  } catch {
    throw new Error("Unable to reach the server. Please try again.");
  }

  if (result.response.status === 401 && !isAuthRoute(url)) {
    try {
      const refreshResponse = await fetch(getApiUrl("/auth/refresh"), {
        method: "POST",
        credentials: "include",
      });

      if (refreshResponse.ok) {
        result = await makeRequest();
      }
    } catch {
      // Ignore refresh failures and fall through to the original error.
    }
  }

  if (!result.response.ok) {
    throw new Error(result.data?.message || "Request failed");
  }

  return result.data;
};

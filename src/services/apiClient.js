const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

export const API_BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL ||
  (LOCAL_HOSTS.has(window.location.hostname)
    ? "http://localhost:5000"
    : "https://e-comerce-backend-cfkk.onrender.com");

const API_PREFIX = `${API_BASE_URL}/api`;

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

  if (/^https?:\/\//i.test(assetPath)) {
    return assetPath;
  }

  const normalizedAssetPath = String(assetPath).replace(/\\/g, "/");
  const uploadsIndex = normalizedAssetPath.toLowerCase().lastIndexOf("/uploads/");

  const normalizedPath = uploadsIndex >= 0
    ? normalizedAssetPath.slice(uploadsIndex)
    : normalizedAssetPath.startsWith("/")
      ? normalizedAssetPath
      : `/${normalizedAssetPath}`;

  return `${API_BASE_URL}${normalizedPath}`;
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
    const response = await fetch(`${API_PREFIX}${url}`, {
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
      const refreshResponse = await fetch(`${API_PREFIX}/auth/refresh`, {
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

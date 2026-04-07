const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL ||
  (["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://e-comerce-backend-cfkk.onrender.com");

// #region agent log
fetch('http://127.0.0.1:7753/ingest/1bdc5a7f-c22b-4f4c-82ba-0fa20a1c6c66', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ccfac5' },
  body: JSON.stringify({
    sessionId: 'ccfac5',
    runId: 'initial',
    hypothesisId: 'H-fe-start',
    location: 'api.js:module',
    message: 'api.js loaded',
    data: {
      baseUrl: BASE_URL,
      hostname: typeof window !== 'undefined' ? window.location.hostname : null,
      hasEnv: Boolean(import.meta?.env?.VITE_API_BASE_URL),
    },
    timestamp: Date.now(),
  }),
}).catch(() => {});
// #endregion
export const request = async (url, method = "GET", body = null) => {
  const isFormData = body instanceof FormData;

  const makeRequest = async () => {
    // #region agent log
    if (url.startsWith("/products")) {
      fetch('http://127.0.0.1:7753/ingest/1bdc5a7f-c22b-4f4c-82ba-0fa20a1c6c66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ccfac5' },
        body: JSON.stringify({
          sessionId: 'ccfac5',
          runId: 'initial',
          hypothesisId: 'H-fe-1',
          location: 'api.js:makeRequest',
          message: 'Requesting API',
          data: { baseUrl: BASE_URL, url, method },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion

    const res = await fetch(`${BASE_URL}/api${url}`, {
      method,
      credentials: "include",
      headers: isFormData
        ? undefined
        : { "Content-Type": "application/json" },
      body: body
        ? isFormData
          ? body
          : JSON.stringify(body)
        : null,
    });

    let data;
    try {
      data = await res.json();
    } catch {
      data = {};
    }

    // #region agent log
    if (url.startsWith("/products")) {
      fetch('http://127.0.0.1:7753/ingest/1bdc5a7f-c22b-4f4c-82ba-0fa20a1c6c66', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'ccfac5' },
        body: JSON.stringify({
          sessionId: 'ccfac5',
          runId: 'initial',
          hypothesisId: 'H-fe-2',
          location: 'api.js:makeRequest',
          message: 'API response for products',
          data: {
            baseUrl: BASE_URL,
            url,
            status: res.status,
            ok: res.ok,
            keys: data && typeof data === 'object' ? Object.keys(data) : null,
            productsCount: Array.isArray(data?.products) ? data.products.length : null,
            totalproducts: typeof data?.totalproducts === 'number' ? data.totalproducts : null,
          },
          timestamp: Date.now(),
        }),
      }).catch(() => {});
    }
    // #endregion

    return { res, data };
  };

  // 🔹 First request
  let { res, data } = await makeRequest();

  // 🔹 If unauthorized → try refresh
  if (
    res.status === 401 &&
    !url.includes("/login") &&
    !url.includes("/register") &&
    !url.includes("/verify")
  ) {
    const refresh = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refresh.ok) {
      ({ res, data } = await makeRequest());
    }
  }

  // 🔴 Final error handling
  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
};
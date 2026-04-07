const BASE_URL =
  import.meta?.env?.VITE_API_BASE_URL ||
  (["localhost", "127.0.0.1", "0.0.0.0"].includes(window.location.hostname)
    ? "http://localhost:5000"
    : "https://e-comerce-backend-cfkk.onrender.com");

export const request = async (url, method = "GET", body = null) => {
  const isFormData = body instanceof FormData;

  const makeRequest = async () => {
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

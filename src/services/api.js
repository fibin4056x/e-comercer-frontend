export const request = async (url, method = "GET", body = null) => {
  const isFormData = body instanceof FormData;

  const response = await fetch(`https://e-comerce-backend-cfkk.onrender.com/api${url}`, {
    method,
    credentials: "include",
    headers: isFormData
      ? undefined
      : {
          "Content-Type": "application/json",
        },
    body: body
      ? isFormData
        ? body
        : JSON.stringify(body)
      : null,
  });

  if (
    response.status === 401 &&
    !url.includes("/login") &&
    !url.includes("/register") &&
    !url.includes("/verify")
  ) {
    const refreshResponse = await fetch(
      "https://e-comerce-backend-cfkk.onrender.com/api/auth/refresh",
      {
        method: "POST",
        credentials: "include",
      }
    );

    if (refreshResponse.ok) {
      const retryResponse = await fetch(
        `https://e-comerce-backend-cfkk.onrender.com/api${url}`,
        {
          method,
          credentials: "include",
          headers: isFormData
            ? undefined
            : {
                "Content-Type": "application/json",
              },
          body: body
            ? isFormData
              ? body
              : JSON.stringify(body)
            : null,
        }
      );

      if (!retryResponse.ok) {
        const errData = await retryResponse.json();
        throw new Error(errData.message);
      }

      return await retryResponse.json();
    }
  }

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.message);
  }

  return await response.json();
};
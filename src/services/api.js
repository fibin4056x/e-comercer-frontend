export const request = async (url, method = "GET", body = null, token = null) => {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`http://localhost:5000/api${url}`, options);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const errorMessage =
      data.message ||
      (data.errors && data.errors[0]?.msg) ||
      "Request failed";

    throw new Error(errorMessage);
  }

  return data;
};
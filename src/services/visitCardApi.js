const API_BASE_URL =
  import.meta.env.VITE_API_URL || "";

const getHeaders = () => {
  const accessToken = localStorage.getItem("accessToken");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(accessToken && {
      Authorization: `Bearer ${accessToken}`,
    }),
  };
};

const readResponseBody = async (response) => {
  const responseText = await response.text();

  if (!responseText) {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  });

  const responseBody = await readResponseBody(response);

  if (!response.ok) {
    const serverMessage =
      typeof responseBody === "string"
        ? responseBody
        : responseBody?.message;

    throw new Error(
      serverMessage || `API 요청에 실패했습니다. (${response.status})`
    );
  }

  return responseBody;
};

export const getStores = () => request("/api/stores");

export const createVisitCard = (requestBody) =>
  request("/api/visitcards", {
    method: "POST",
    body: JSON.stringify(requestBody),
  });


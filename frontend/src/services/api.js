const BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.trim() ||
  "http://localhost:5000/api/tasks";

const request = async (path = "", options = {}) => {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    try {
      const errorData = await response.json();
      if (errorData?.message) {
        message = errorData.message;
      }
    } catch {
      // Ignore non-JSON error payloads and keep the generic message.
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const getTasks = async () => request("/");

export const createTask = async (task) =>
  request("/", {
    method: "POST",
    body: JSON.stringify(task),
  });

export const updateTask = async (id, task) =>
  request(`/${id}`, {
    method: "PUT",
    body: JSON.stringify(task),
  });

export const deleteTask = async (id) =>
  request(`/${id}`, {
    method: "DELETE",
  });


const BASE_URL = "http://172.25.0.10:8081/api";

export async function loginRequest(username, password) {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(err || "Login failed");
  }

  return await response.json();
}

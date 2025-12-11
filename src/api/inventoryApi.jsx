import { getToken } from "../utils/token";

const BASE_URL = "http://172.25.0.10:8081/api/inventory";

export async function getInventories() {
  const response = await fetch(BASE_URL, {
    headers: {
      Authorization: `Bearer ${getToken()}`
    }
  });

  if (!response.ok) throw new Error("Liste alınamadı");

  return await response.json();
}

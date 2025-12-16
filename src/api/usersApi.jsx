import { apiFetch } from "./apiClient";

// 🔹 GET USERS
export const getUsers = (filter = "active") =>
  apiFetch(`/User?filter=${filter}`);

// 🔹 CREATE USER
export const createUser = (dto) =>
  apiFetch(`/User/register`, {
    method: "POST",
    body: JSON.stringify(dto),
  });

// 🔹 UPDATE USER
export const updateUser = (id, dto) =>
  apiFetch(`/User/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });

// 🔹 PASSIVE USER
export const passiveUser = (id) =>
  apiFetch(`/User/${id}`, { method: "DELETE" });

// 🔹 RESTORE USER
export const restoreUser = (id) =>
  apiFetch(`/User/${id}/restore`, { method: "PATCH" });

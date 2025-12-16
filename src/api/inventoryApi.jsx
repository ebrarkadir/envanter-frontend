// src/api/inventoryApi.js
import { apiFetch } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL;

/* =========================
   INVENTORY LIST
========================= */
export function getInventories(filter = "active") {
  let query = "";

  if (filter === "inactive" || filter === "all") {
    query = "?includeInactive=true";
  }

  return apiFetch(`/inventory${query}`);
}

/* =========================
   DEACTIVATE / RESTORE
========================= */
export function deactivateInventory(id) {
  if (!id) throw new Error("ID boş olamaz");

  return apiFetch(`/inventory/${id}`, {
    method: "DELETE",
  });
}

export function restoreInventory(id) {
  if (!id) throw new Error("ID boş olamaz");

  return apiFetch(`/inventory/${id}/restore`, {
    method: "PATCH",
  });
}

/* =========================
   EXCEL IMPORT
========================= */
export async function importInventoryExcel(file) {
  if (!file) throw new Error("Dosya yok");

  const token = localStorage.getItem("token");
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_URL}/inventory/import`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "IMPORT_FAILED");
  }

  return await res.json();
}

/* =========================
   EXCEL EXPORT
========================= */
export async function exportInventoryExcel(filter = "active") {
  let query = "";

  if (filter === "inactive") {
    query = "?filter=inactive";
  } else if (filter === "all") {
    query = "?filter=all";
  } else {
    query = "?filter=active";
  }

  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/Inventory/export-file${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    throw new Error("EXPORT_FAILED");
  }

  return await res.blob();
}


/* =========================
   INVENTORY HISTORY
========================= */
export async function getInventoryHistory(inventoryId) {
  if (!inventoryId) throw new Error("ENVANTER_ID_YOK");

  const token = localStorage.getItem("token");

  const res = await fetch(
    `${API_URL}/inventory/${inventoryId}/history`,
    {
      method: "GET",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }
  );

  if (res.status === 401) {
    localStorage.clear();
    window.location.href = "/login";
    throw new Error("UNAUTHORIZED");
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "HISTORY_FETCH_FAILED");
  }

  return await res.json();
}

import { getToken } from "../utils/token";

const BASE_URL = "http://172.25.0.10:8081/api/inventory";

/**
 * filter:
 *  - "active"   → sadece aktifler  (includeInactive paramı yok)
 *  - "inactive" → aktif+pasif gelir (sonra frontend pasifi ayırır)
 *  - "all"      → aktif+pasif gelir
 */
export async function getInventories(filter = "active") {
  let url = BASE_URL;

  // ✅ eski çalışan davranış: sadece gerektiğinde includeInactive=true ekle
  if (filter === "inactive" || filter === "all") {
    url += "?includeInactive=true";
  }

  const token = getToken();
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Liste alınamadı (${res.status}) ${errText}`);
  }

  return await res.json();
}

// ✅ Aktif kaydı pasife alma (silme yok)
export async function deactivateInventory(id) {
  if (!id) throw new Error("ID boş olamaz");

  const token = getToken();
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Kayıt pasife alınamadı (${res.status}) ${errText}`);
  }

  // backend body dönmüyor → problem yok
  return true;
}

// ✅ Pasif kaydı geri yükleme
export async function restoreInventory(id) {
  if (!id) throw new Error("ID boş olamaz");

  const token = getToken();
  const res = await fetch(`${BASE_URL}/${id}/restore`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Kayıt geri yüklenemedi (${res.status}) ${errText}`);
  }

  return true;
}

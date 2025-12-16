// src/api/logApi.js
import { apiFetch } from "./apiClient";

/* 📄 Tüm logları getir */
export const getLogs = () =>
  apiFetch("/Logs");

/* 🧹 Logları temizle */
export const clearLogs = () =>
  apiFetch("/Logs/clear", {
    method: "DELETE",
  });

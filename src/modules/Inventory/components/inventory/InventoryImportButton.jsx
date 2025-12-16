import { useRef, useState } from "react";
import { importInventoryExcel } from "../../../../api/inventoryApi";

export default function InventoryImportButton({ onImported }) {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".xlsx")) {
      alert("Sadece .xlsx dosyaları desteklenir");
      e.target.value = "";
      return;
    }

    try {
      setLoading(true);
      const result = await importInventoryExcel(file);

      alert(result.message || "Excel içe aktarıldı");

      // 🔥 Parent’a haber ver (listeyi yenile)
      onImported?.();
    } catch (err) {
      console.error(err);
      alert(err.message || "Excel içe aktarılamadı");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />

      <button
        className="outline-btn"
        onClick={handleClick}
        disabled={loading}
      >
        {loading ? "İçe Aktarılıyor..." : "İçe Al"}
      </button>
    </>
  );
}

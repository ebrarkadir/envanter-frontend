import { exportInventoryExcel } from "../../../../api/inventoryApi";

export default function InventoryExportButton({ activeFilter }) {
  const handleExport = async () => {
    try {
      const blob = await exportInventoryExcel(activeFilter);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Envanter_${activeFilter}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(a);
      a.click();
      a.remove();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Excel export error:", err);
      alert("Excel indirilemedi");
    }
  };

  return (
    <button className="outline-btn" onClick={handleExport}>
      Dışa Aktar
    </button>
  );
}

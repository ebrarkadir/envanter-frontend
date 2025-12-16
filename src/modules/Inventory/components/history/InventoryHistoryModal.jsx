import { useEffect, useState } from "react";
import { getInventoryHistory } from "../../../../api/inventoryApi";
import "./InventoryHistoryModal.css";

export default function InventoryHistoryModal({ inventoryId, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!inventoryId) return;

    (async () => {
      try {
        const data = await getInventoryHistory(inventoryId);
        setHistory(data);
      } catch (err) {
        alert(err.message || "Tarihçe alınamadı");
        onClose();
      } finally {
        setLoading(false);
      }
    })();
  }, [inventoryId, onClose]);

  const formatDate = (v) => {
    if (!v) return "";
    const d = new Date(v);
    return isNaN(d) ? "" : d.toLocaleDateString("tr-TR");
  };

  return (
    <div className="history-overlay">
      <div className="history-modal">
        <div className="history-header">
          <h2>Envanter Tarihçesi</h2>
          <button className="outline-btn" onClick={onClose}>
            Kapat
          </button>
        </div>

        {loading ? (
          <div className="history-loading">Yükleniyor...</div>
        ) : history.length === 0 ? (
          <div className="history-empty">
            Bu envanter için tarihçe bulunamadı.
          </div>
        ) : (
          <div className="history-table-wrapper">
            <table className="history-table">
              <thead>
                <tr>
                  <th>İşlem</th>
                  <th>Kullanıcı</th>
                  <th>Tarih</th>
                  <th>Seri No</th>
                  <th>Marka</th>
                  <th>Malzeme</th>
                  <th>Grup</th>
                  <th>Model</th>
                  <th>Durum</th>
                  <th>Stok Giriş</th>
                  <th>Stok Çıkış</th>
                  <th>Açıklama</th>
                  <th>Tahsis Edilen Proje</th>
                  <th>Tahsis Edilen Kişi</th>
                </tr>
              </thead>

              <tbody>
                {history.map((h) => (
                  <tr key={h.id}>
                    <td>{h.actionType}</td>
                    <td>{h.changedBy || "-"}</td>
                    <td>{new Date(h.changedAt).toLocaleString("tr-TR")}</td>
                    <td>{h.serialNumber || ""}</td>
                    <td>{h.brand || ""}</td>
                    <td>{h.itemName || ""}</td>
                    <td>{h.itemGroup || ""}</td>
                    <td>{h.model || ""}</td>
                    <td>{h.status || ""}</td>
                    <td>{formatDate(h.stockInDate)}</td>
                    <td>{formatDate(h.stockOutDate)}</td>
                    <td>{h.description || ""}</td>
                    <td>{h.assignedProject || ""}</td>
                    <td>{h.assignedPerson || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

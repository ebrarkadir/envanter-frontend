import { useEffect, useMemo, useState } from "react";
import ColumnFilter from "./ColumnFilter";
import "../../styles/table.css";
import {
  deactivateInventory,
  restoreInventory,
} from "../../../../api/inventoryApi";
import DescriptionModal from "../../../../components/DescriptionModal";

export default function InventoryTable({
  data = [],
  activeFilter,
  onActiveFilterChange,
  onDataChange,
}) {
  const [openFilter, setOpenFilter] = useState(null);
  // 🔥 DÜZELTME 1: Tıklanan butonun referansını tutmak için state eklendi
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [search, setSearch] = useState("");

  const statusMap = {
    0: "Depoda",
    1: "Projede",
    2: "Arızalı - Onarım",
    3: "Arızalı - Kullanım Dışı",
    4: "Stoktan Çıkarıldı",
  };

  const columns = [
    { key: "serialNumber", label: "Seri No" },
    { key: "brand", label: "Marka" },
    { key: "itemName", label: "Malzeme Adı" },
    { key: "itemGroup", label: "Malzeme Grubu" },
    { key: "model", label: "Model" },
    { key: "stockInDate", label: "Giriş Tarihi" },
    { key: "stockOutDate", label: "Çıkış Tarihi" },
    { key: "description", label: "Açıklama" },
    { key: "assignedProject", label: "Tahsis Edilen Proje" },
    { key: "assignedPerson", label: "Tahsis Edilen Kişi" },
    { key: "status", label: "Durum" },
    { key: "lastActionDate", label: "Son İşlem Tarihi" },
  ];

  const [filters, setFilters] = useState(
    Object.fromEntries(columns.map((c) => [c.key, []]))
  );

  const [openDescription, setOpenDescription] = useState(null);

  const pageSize = 15;
  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [search, filters, activeFilter]);

  const normalizeCell = (key, value) => {
    if (value === null || value === undefined) return "";

    if (key === "status") return statusMap[value] || "";

    if (key.toLowerCase().includes("date")) {
      const s = value.toString();
      return s.includes("T") ? s.split("T")[0] : s;
    }

    return value.toString();
  };

  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 🔥 1) SEARCH → AND mantığında
      if (search.trim()) {
        const q = search.toLowerCase();

        const match = Object.keys(row).some((k) => {
          let v = row[k];
          if (v == null) return false;

          if (k === "status") v = statusMap[v] || "";
          if (k.toLowerCase().includes("date") && v) v = v.split("T")[0];

          return v.toString().toLowerCase().includes(q);
        });

        if (!match) return false; // 🔥 AND kırılır, search'e uymayanı geç
      }

      // 🔥 2) COLUMN FILTERS → AND mantığında
      return columns.every((col) => {
        const selected = filters[col.key];
        if (!selected.length) return true; // Eğer filtrelenmemişse, geç

        let value = row[col.key] ?? "";
        if (col.key === "status") value = statusMap[value] || "";
        if (col.key.toLowerCase().includes("date") && value)
          value = value.split("T")[0];

        return selected.includes(value.toString()); // Seçili değeri içeriyorsa geç
      });
    });
  }, [data, search, filters]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, page]);

  const getOptions = (key) => {
    const set = new Set();
    data.forEach((row) => {
      // 👈 DİKKAT
      const v = normalizeCell(key, row[key]);
      if (v) set.add(v);
    });
    return Array.from(set);
  };

  const applyFilter = (key, values) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setOpenFilter(null);
    setFilterAnchor(null);
  };

  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: [] }));
    setOpenFilter(null);
    setFilterAnchor(null);
  };
  const clearAllFilters = () => {
    setFilters(Object.fromEntries(columns.map((c) => [c.key, []])));
    setOpenFilter(null);
    setFilterAnchor(null);
  };

  // Menüyü kapatma fonksiyonu
  const handleCloseFilter = () => {
    setOpenFilter(null);
    setFilterAnchor(null);
  };

  /* =========================
      DELETE / RESTORE HANDLERS
     ========================= */
  const handleDeactivate = async (id) => {
    if (!window.confirm("Bu kayıt pasif hale getirilsin mi?")) return;

    try {
      await deactivateInventory(id);

      onDataChange((prev) => {
        // 🔥 AKTİF KAYITLAR → LİSTEDEN AT
        if (activeFilter === "active") {
          return prev.filter((x) => x.id !== id);
        }

        // 🔥 TÜM KAYITLAR → SADECE FLAG DEĞİŞTİR
        return prev.map((x) => (x.id === id ? { ...x, isActive: false } : x));
      });
    } catch (err) {
      alert(err.message || "Pasife alma başarısız");
    }
  };

  const handleRestore = async (id) => {
    if (!window.confirm("Bu kayıt tekrar aktif edilsin mi?")) return;

    try {
      await restoreInventory(id);

      onDataChange((prev) => {
        // 🔥 PASİF KAYITLAR → LİSTEDEN AT
        if (activeFilter === "inactive") {
          return prev.filter((x) => x.id !== id);
        }

        // 🔥 TÜM KAYITLAR → SADECE FLAG DEĞİŞTİR
        return prev.map((x) => (x.id === id ? { ...x, isActive: true } : x));
      });
    } catch (err) {
      alert(err.message || "Geri yükleme başarısız");
    }
  };

  return (
    <div className="inventory-table-wrapper">
      <div className="inventory-header">
        {/* SOL */}
        <div className="inventory-title">
          <h2>Envanter Listesi</h2>
          <span className="inventory-count">{filteredData.length}</span>
        </div>

        <div className="inventory-right">
          {/* ÜST: AKSİYONLAR */}
          <div className="inventory-actions">
            <button className="outline-btn">Dışa Aktar</button>
            <button className="outline-btn">İçe Al</button>
            <button className="primary-btn">Çoklu Seçim</button>
          </div>

          {/* ALT: SEARCH + FILTER */}
          <div className="inventory-filters">
            <input
              className="global-search"
              type="text"
              placeholder="Ara (Seri / Marka / Model ...)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="active-filter"
              value={activeFilter}
              onChange={(e) => onActiveFilterChange(e.target.value)}
            >
              <option value="active">Aktif Kayıtlar</option>
              <option value="inactive">Silinmiş Kayıtlar</option>
              <option value="all">Tümü Kayıtlar</option>
            </select>
          </div>
        </div>
      </div>

      <table className="inventory-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                <div className="col-header">
                  <span>{col.label}</span>
                  <button
                    className="filter-btn"
                    onClick={(e) => {
                      // 🔥 DÜZELTME 2: Anchor element (buton) referansını set ediyoruz
                      if (openFilter === col.key) {
                        handleCloseFilter();
                      } else {
                        setOpenFilter(col.key);
                        setFilterAnchor(e.currentTarget); // <-- ÖNEMLİ: Butonu kaydet
                      }
                    }}
                  >
                    ▼
                  </button>
                  {openFilter === col.key && (
                    <ColumnFilter
                      title={col.label}
                      options={getOptions(col.key)}
                      selected={filters[col.key]}
                      // 🔥 DÜZELTME 3: Anchor prop'unu pass ediyoruz
                      anchorRef={filterAnchor}
                      onChange={(v) => applyFilter(col.key, v)}
                      onClear={() => clearFilter(col.key)}
                      onClose={handleCloseFilter}
                    />
                  )}
                </div>
              </th>
            ))}
            <th>
              <div
                className="col-header"
                style={{ flexDirection: "column", gap: 6 }}
              >
                <span>İşlem</span>

                <button
                  className="clear-filters-btn"
                  onClick={clearAllFilters}
                  title="Tüm filtreleri temizle"
                >
                  Filtreleri Temizle
                </button>
              </div>
            </th>
          </tr>
        </thead>

        <tbody>
          {paginated.map((row) => (
            <tr key={row.id} className={!row.isActive ? "inactive-row" : ""}>
              {columns.map((c) => {
                const value = normalizeCell(c.key, row[c.key]);

                if (c.key === "description" && value.length > 20) {
                  return (
                    <td key={c.key}>
                      {value.slice(0, 10)}…
                      <span
                        style={{
                          color: "#2563eb",
                          cursor: "pointer",
                          marginLeft: 6,
                          fontSize: 12,
                        }}
                        onClick={() => setOpenDescription(value)}
                      >
                        Devamını Gör
                      </span>
                    </td>
                  );
                }

                return <td key={c.key}>{value}</td>;
              })}

              <td className="action-cell">
                {row.isActive && (
                  <>
                    <button className="icon-btn edit" data-tooltip="Düzenle">
                      <img src="/src/assets/icons/edit.png" alt="edit" />
                    </button>

                    <button
                      className="icon-btn delete"
                      data-tooltip="Pasife Al"
                      onClick={() => handleDeactivate(row.id)}
                    >
                      <img src="/src/assets/icons/trash.png" alt="delete" />
                    </button>
                  </>
                )}

                {!row.isActive && (
                  <button
                    className="icon-btn restore"
                    data-tooltip="Geri Yükle"
                    onClick={() => handleRestore(row.id)}
                  >
                    <img src="/src/assets/icons/reset.png" alt="restore" />
                  </button>
                )}

                <button className="icon-btn history" data-tooltip="Tarihçe">
                  <img src="/src/assets/icons/history.png" alt="history" />
                </button>
              </td>
            </tr>
          ))}

          {paginated.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + 1}
                style={{ textAlign: "center", padding: 24 }}
              >
                Kayıt bulunamadı.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="pagination-wrapper">
        {/* ORTA: SAYFALAMA */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
            ← Önceki
          </button>

          <span>
            Sayfa {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki →
          </button>
        </div>

        <div className="pagination-info">
          {filteredData.length === 0 ? (
            "0 kayıttan 0–0 arası görüntüleniyor"
          ) : (
            <>
              <strong>{filteredData.length}</strong> kayıttan{" "}
              <strong>{(page - 1) * pageSize + 1}</strong>–{" "}
              <strong>{Math.min(page * pageSize, filteredData.length)}</strong>{" "}
              arası görüntüleniyor
            </>
          )}
        </div>
      </div>
      {openDescription && (
        <DescriptionModal
          text={openDescription}
          onClose={() => setOpenDescription(null)}
        />
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import ColumnFilter from "./ColumnFilter";
import "../../styles/table.css";
import InventoryExportButton from "../inventory/InventoryExportButton";
import InventoryImportButton from "../inventory/InventoryImportButton";
import {
  deactivateInventory,
  restoreInventory,
  getInventories,
} from "../../../../api/inventoryApi";
import DescriptionModal from "../../../../components/DescriptionModal";
import TableLoader from "../../../../components/Loading/TableLoader";
import ButtonLoader from "../../../../components/Loading/ButtonLoader";

import InventoryHistoryModal from "../history/InventoryHistoryModal";
import ConfirmModal from "../../../../components/Modal/ConfirmModal";

export default function InventoryTable({
  data = [],
  loading = false,
  activeFilter,
  onActiveFilterChange,
  onDataChange,
  onEdit,
  permissions,
}) {
  const [openFilter, setOpenFilter] = useState(null);
  const [filterAnchor, setFilterAnchor] = useState(null);
  const [search, setSearch] = useState("");
  const [openHistoryId, setOpenHistoryId] = useState(null);
  const [multiSelectMode, setMultiSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());

  // 🔥 İşlem yapılıyor mu? (Toplu silme/geri yükleme için loader kontrolü)
  const [isProcessing, setIsProcessing] = useState(false);

  const [sort, setSort] = useState({
    key: null,
    direction: null,
  });

  useEffect(() => {
    setOpenFilter(null);
    setFilterAnchor(null);
  }, [sort]);

  const [confirm, setConfirm] = useState({
    open: false,
    title: "",
    message: "",
    onConfirm: null,
  });

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
  const [pageInput, setPageInput] = useState(page.toString());

  useEffect(() => {
    setPageInput(page.toString());
  }, [page]);

  useEffect(() => {
    setPage(1);
  }, [search, filters, activeFilter, sort]);

  const getDistinct = (key) => {
    return Array.from(
      new Set(data.map((x) => x[key]).filter((v) => v && v.trim()))
    ).sort((a, b) => a.localeCompare(b, "tr", { sensitivity: "base" }));
  };

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
      if (search.trim()) {
        const q = search.toLowerCase();
        const match = Object.keys(row).some((k) => {
          let v = row[k];
          if (v == null) return false;
          if (k === "status") v = statusMap[v] || "";
          if (k.toLowerCase().includes("date") && v) v = v.split("T")[0];
          return v.toString().toLowerCase().includes(q);
        });
        if (!match) return false;
      }

      return columns.every((col) => {
        const selected = filters[col.key];
        if (!selected.length) return true;
        let value = row[col.key] ?? "";
        if (col.key === "status") value = statusMap[value] || "";
        if (col.key.toLowerCase().includes("date") && value)
          value = value.split("T")[0];
        return selected.includes(value.toString());
      });
    });
  }, [data, search, filters]);

  const sortedData = useMemo(() => {
    if (!sort.key || !sort.direction) return filteredData;
    return [...filteredData].sort((a, b) => {
      let va = normalizeCell(sort.key, a[sort.key]).trim();
      let vb = normalizeCell(sort.key, b[sort.key]).trim();
      const aEmpty = va === "";
      const bEmpty = vb === "";
      if (aEmpty && bEmpty) return 0;
      if (aEmpty) return 1;
      if (bEmpty) return -1;
      if (!isNaN(Date.parse(va)) && !isNaN(Date.parse(vb))) {
        return sort.direction === "asc"
          ? new Date(va) - new Date(vb)
          : new Date(vb) - new Date(va);
      }
      return sort.direction === "asc"
        ? va.localeCompare(vb, "tr", { sensitivity: "base" })
        : vb.localeCompare(va, "tr", { sensitivity: "base" });
    });
  }, [filteredData, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [page, totalPages]);

  const paginated = useMemo(() => {
    const start = (page - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, page]);

  const getOptions = (targetKey) => {
    const set = new Set();
    data.forEach((row) => {
      const isValid = columns.every((col) => {
        if (col.key === targetKey) return true;
        const selected = filters[col.key];
        if (!selected.length) return true;
        let value = row[col.key] ?? "";
        if (col.key === "status") value = statusMap[value] || "";
        if (col.key.toLowerCase().includes("date") && value)
          value = value.split("T")[0];
        return selected.includes(value.toString());
      });
      if (!isValid) return;
      const v = normalizeCell(targetKey, row[targetKey]);
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

  const handleCloseFilter = () => {
    setOpenFilter(null);
    setFilterAnchor(null);
  };

  /* =========================
     DELETE / RESTORE HANDLERS
     ========================= */
  const handleDeactivate = (id) => {
    setConfirm({
      open: true,
      title: "Kayıt Pasifleştirilecek",
      message: "Bu kayıt pasif hale getirilecek. Devam edilsin mi?",
      onConfirm: async () => {
        try {
          await deactivateInventory(id);
          onDataChange((prev) => {
            if (activeFilter === "active") {
              return prev.filter((x) => x.id !== id);
            }
            return prev.map((x) =>
              x.id === id ? { ...x, isActive: false } : x
            );
          });
        } catch (err) {
          alert(err.message || "Pasife alma başarısız");
        } finally {
          setConfirm({ open: false });
        }
      },
    });
  };

  const handleRestore = (id) => {
    setConfirm({
      open: true,
      title: "Kayıt Geri Yüklenecek",
      message: "Bu kayıt tekrar aktif hale getirilecek. Devam edilsin mi?",
      onConfirm: async () => {
        try {
          await restoreInventory(id);
          onDataChange((prev) => {
            if (activeFilter === "inactive") {
              return prev.filter((x) => x.id !== id);
            }
            return prev.map((x) =>
              x.id === id ? { ...x, isActive: true } : x
            );
          });
        } catch (err) {
          alert(err.message || "Geri yükleme başarısız");
        } finally {
          setConfirm({ open: false });
        }
      },
    });
  };

  return (
    <div className="inventory-table-wrapper">
      <div className="inventory-header">
        {/* SOL */}
        <div className="inventory-title">
          <h2>Envanter Listesi</h2>
          <span className="inventory-count">{sortedData.length}</span>
        </div>

        <div className="inventory-right">
          <div className="inventory-actions">
            {/* NORMAL MOD */}
            {!multiSelectMode && (
              <>
                <InventoryExportButton activeFilter={activeFilter} />

                {permissions.canEdit && (
                  <InventoryImportButton
                    onImported={async () => {
                      const freshData = await getInventories(activeFilter);
                      onDataChange(() => freshData);
                    }}
                  />
                )}

                {permissions.canDelete && (
                  <button
                    className="multiple-btn"
                    onClick={() => setMultiSelectMode(true)}
                  >
                    Çoklu Seçim
                  </button>
                )}
              </>
            )}

            {/* MULTI SELECT MOD */}
            {multiSelectMode && (
              <>
                {(activeFilter === "active" || activeFilter === "all") && (
                  <>
                    <button
                      className="danger-btn"
                      // isProcessing true ise butonu disable et
                      disabled={selectedIds.size === 0 || isProcessing}
                      onClick={() =>
                        setConfirm({
                          open: true,
                          title: "Toplu Silme",
                          message: `${selectedIds.size} kayıt pasif hale getirilecek. Emin misin?`,
                          onConfirm: async () => {
                            // 🔥 Loader Başlat
                            setIsProcessing(true);
                            try {
                              for (const id of selectedIds) {
                                await deactivateInventory(id);
                              }

                              onDataChange((prev) =>
                                activeFilter === "active"
                                  ? prev.filter((x) => !selectedIds.has(x.id))
                                  : prev.map((x) =>
                                      selectedIds.has(x.id)
                                        ? { ...x, isActive: false }
                                        : x
                                    )
                              );
                              setSelectedIds(new Set());
                            } finally {
                              // 🔥 Loader Durdur
                              setIsProcessing(false);
                              setConfirm({ open: false });
                            }
                          },
                        })
                      }
                    >
                      {/* 🔥 ButtonLoader Eklendi */}
                      {isProcessing ? <ButtonLoader /> : "Seçilenleri Sil"}
                    </button>

                    <button
                      className="danger-btn"
                      disabled={isProcessing}
                      onClick={() => {
                        const idsToDelete = data
                          .filter((x) => x.isActive)
                          .map((x) => x.id);
                        if (!idsToDelete.length) return;

                        setConfirm({
                          open: true,
                          title: "Tüm Kayıtlar Silinecek",
                          message: `${idsToDelete.length} aktif kayıt pasif hale getirilecek. Emin misin?`,
                          onConfirm: async () => {
                            setIsProcessing(true);
                            try {
                              for (const id of idsToDelete) {
                                await deactivateInventory(id);
                              }
                              onDataChange((prev) =>
                                activeFilter === "active"
                                  ? []
                                  : prev.map((x) =>
                                      x.isActive ? { ...x, isActive: false } : x
                                    )
                              );
                              setSelectedIds(new Set());
                            } catch (err) {
                              alert(err.message || "Toplu silme başarısız");
                            } finally {
                              setIsProcessing(false);
                              setConfirm({ open: false });
                            }
                          },
                        });
                      }}
                    >
                      {isProcessing ? <ButtonLoader /> : "Tüm Kayıtları Sil"}
                    </button>
                  </>
                )}

                {(activeFilter === "inactive" || activeFilter === "all") && (
                  <>
                    <button
                      className="success-btn"
                      disabled={selectedIds.size === 0 || isProcessing}
                      onClick={() =>
                        setConfirm({
                          open: true,
                          title: "Toplu Geri Yükleme",
                          message: `${selectedIds.size} kayıt tekrar aktif edilecek. Emin misin?`,
                          onConfirm: async () => {
                            setIsProcessing(true);
                            try {
                              for (const id of selectedIds) {
                                await restoreInventory(id);
                              }
                              onDataChange((prev) =>
                                activeFilter === "inactive"
                                  ? prev.filter((x) => !selectedIds.has(x.id))
                                  : prev.map((x) =>
                                      selectedIds.has(x.id)
                                        ? { ...x, isActive: true }
                                        : x
                                    )
                              );
                              setSelectedIds(new Set());
                            } catch (err) {
                              alert(
                                err.message || "Toplu geri yükleme başarısız"
                              );
                            } finally {
                              setIsProcessing(false);
                              setConfirm({ open: false });
                            }
                          },
                        })
                      }
                    >
                      {isProcessing ? (
                        <ButtonLoader />
                      ) : (
                        "Seçilenleri Geri Yükle"
                      )}
                    </button>

                    <button
                      className="success-btn"
                      disabled={isProcessing}
                      onClick={() => {
                        const inactiveIds = data
                          .filter((x) => !x.isActive)
                          .map((x) => x.id);
                        if (!inactiveIds.length) return;

                        setConfirm({
                          open: true,
                          title: "Tüm Pasifler Geri Yüklenecek",
                          message: `${inactiveIds.length} kayıt tekrar aktif edilecek. Emin misin?`,
                          onConfirm: async () => {
                            setIsProcessing(true);
                            try {
                              for (const id of inactiveIds) {
                                await restoreInventory(id);
                              }
                              onDataChange((prev) =>
                                activeFilter === "inactive"
                                  ? []
                                  : prev.map((x) =>
                                      !x.isActive ? { ...x, isActive: true } : x
                                    )
                              );
                            } catch (err) {
                              alert(
                                err.message || "Toplu geri yükleme başarısız"
                              );
                            } finally {
                              setIsProcessing(false);
                              setConfirm({ open: false });
                            }
                          },
                        });
                      }}
                    >
                      {isProcessing ? (
                        <ButtonLoader />
                      ) : (
                        "Tüm Pasifleri Geri Yükle"
                      )}
                    </button>
                  </>
                )}

                <button
                  className="outline-btn"
                  disabled={isProcessing}
                  onClick={() => {
                    setMultiSelectMode(false);
                    setSelectedIds(new Set());
                  }}
                >
                  İptal
                </button>
              </>
            )}
          </div>

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
                {multiSelectMode && (
                  <th style={{ width: 40 }}>
                    <input
                      type="checkbox"
                      checked={
                        paginated.length > 0 &&
                        paginated.every((r) => selectedIds.has(r.id))
                      }
                      onChange={(e) => {
                        const copy = new Set(selectedIds);
                        if (e.target.checked) {
                          paginated.forEach((r) => copy.add(r.id));
                        } else {
                          paginated.forEach((r) => copy.delete(r.id));
                        }
                        setSelectedIds(copy);
                      }}
                    />
                  </th>
                )}

                {columns.map((col) => (
                  <th key={col.key}>
                    <div className="col-header">
                      <span
                        className="sortable-header"
                        title="Sıralamak için tıkla"
                        onClick={() => {
                          setSort((prev) => {
                            if (prev.key !== col.key)
                              return { key: col.key, direction: "asc" };
                            if (prev.direction === "asc")
                              return { key: col.key, direction: "desc" };
                            return { key: null, direction: null };
                          });
                        }}
                      >
                        {col.label}
                        {sort.key === col.key && (
                          <span className="sort-indicator">
                            {sort.direction === "asc" ? " ▲" : " ▼"}
                          </span>
                        )}
                      </span>

                      <button
                        className="filter-btn"
                        onClick={(e) => {
                          if (openFilter === col.key) {
                            handleCloseFilter();
                          } else {
                            setOpenFilter(col.key);
                            setFilterAnchor(e.currentTarget);
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
              {/* 🔄 LOADING DURUMU */}
              {loading && (
                <tr>
                  <td colSpan={columns.length + (multiSelectMode ? 1 : 0) + 1}>
                    <TableLoader />
                  </td>
                </tr>
              )}

              {/* 📦 DATA */}
              {!loading &&
                paginated.map((row) => (
                  <tr
                    key={row.id}
                    className={!row.isActive ? "inactive-row" : ""}
                  >
                    {multiSelectMode && (
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(row.id)}
                          onChange={(e) => {
                            const copy = new Set(selectedIds);
                            e.target.checked
                              ? copy.add(row.id)
                              : copy.delete(row.id);
                            setSelectedIds(copy);
                          }}
                        />
                      </td>
                    )}

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
                      {row.isActive && permissions.canEdit && (
                        <button
                          className="icon-btn edit"
                          data-tooltip="Düzenle"
                          onClick={() => onEdit(row)}
                        >
                          <img src="/src/assets/icons/edit.png" alt="edit" />
                        </button>
                      )}

                      {row.isActive && permissions.canDelete && (
                        <button
                          className="icon-btn delete"
                          data-tooltip="Pasife Al"
                          onClick={() => handleDeactivate(row.id)}
                        >
                          <img src="/src/assets/icons/trash.png" alt="delete" />
                        </button>
                      )}

                      {!row.isActive && permissions.canRestore && (
                        <button
                          className="icon-btn restore"
                          data-tooltip="Geri Yükle"
                          onClick={() => handleRestore(row.id)}
                        >
                          <img
                            src="/src/assets/icons/reset.png"
                            alt="restore"
                          />
                        </button>
                      )}

                      <button
                        className="icon-btn history"
                        data-tooltip="Tarihçe"
                        onClick={() => setOpenHistoryId(row.id)}
                      >
                        <img
                          src="/src/assets/icons/history.png"
                          alt="history"
                        />
                      </button>
                    </td>
                  </tr>
                ))}

              {/* ❌ BOŞ DATA */}
              {!loading && paginated.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length + (multiSelectMode ? 1 : 0) + 1}
                    style={{ textAlign: "center", padding: 24 }}
                  >
                    Kayıt bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination sadece tablo yüklüyken görünsün */}
          <div className="pagination-wrapper">
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ← Önceki
              </button>

              <div className="page-jump">
                <span>Sayfa</span>
                <input
                  type="number"
                  min={1}
                  max={totalPages}
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      let target = Number(pageInput);
                      if (isNaN(target)) {
                        setPageInput(page.toString());
                        return;
                      }
                      if (target < 1) target = 1;
                      if (target > totalPages) target = totalPages;
                      setPage(target);
                    }
                  }}
                  onBlur={() => setPageInput(page.toString())}
                  className="page-input"
                />
                <span>/ {totalPages}</span>
              </div>

              <button
                className="page-btn"
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
                  <strong>
                    {Math.min(page * pageSize, filteredData.length)}
                  </strong>{" "}
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
      {openHistoryId && (
        <InventoryHistoryModal
          inventoryId={openHistoryId}
          onClose={() => setOpenHistoryId(null)}
        />
      )}
      {confirm.open && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          onCancel={() => setConfirm({ open: false })}
          onConfirm={confirm.onConfirm}
        />
      )}
    </div>
  );
}

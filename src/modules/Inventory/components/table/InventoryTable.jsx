import { useState, useMemo } from "react";
import ColumnFilter from "./ColumnFilter";
import "../../styles/table.css";

export default function InventoryTable({ data }) {
  const [openFilter, setOpenFilter] = useState(null);

  // 🔎 GLOBAL SEARCH
  const [search, setSearch] = useState("");

  // 🔥 Aktif / Pasif filtre
  const [activeFilter, setActiveFilter] = useState("active");
  // active | passive | all

  const statusMap = {
    0: "Depoda",
    1: "Projede",
    2: "Arızalı - Onarım",
    3: "Arızalı - Kullanım Dışı",
    4: "Stoktan Çıkarıldı",
  };

  // 🔥 Backend kolonları
  const columns = [
    { key: "serialNumber", label: "SERİ NO" },
    { key: "brand", label: "MARKA" },
    { key: "itemName", label: "MALZEME ADI" },
    { key: "itemGroup", label: "MALZEME GRUBU" },
    { key: "model", label: "MODEL" },
    { key: "stockInDate", label: "GİRİŞ TARİHİ" },
    { key: "stockOutDate", label: "ÇIKIŞ TARİHİ" },
    { key: "description", label: "AÇIKLAMA" },
    { key: "assignedProject", label: "TAHSİS EDİLEN PROJE" },
    { key: "assignedPerson", label: "TAHSİS EDİLEN KİŞİ" },
    { key: "status", label: "DURUM" },
    { key: "lastActionDate", label: "SON İŞLEM TARİHİ" },
  ];

  // 🔥 Kolon bazlı filtre state
  const [filters, setFilters] = useState(
    Object.fromEntries(columns.map((c) => [c.key, []]))
  );

  // 🔢 PAGINATION
  const [page, setPage] = useState(1);
  const pageSize = 15;

  // ✔ Tüm filtreler + global search burada birleşiyor
  const filteredData = useMemo(() => {
    return data
      .filter((row) => {
        // 🔥 AKTİF/PASİF FİLTRE
        if (activeFilter === "active" && row.isActive !== true) return false;
        if (activeFilter === "passive" && row.isActive !== false) return false;
        return true;
      })
      .filter((row) => {
        // 🔥 GLOBAL SEARCH (tüm kolonlarda)
        if (!search.trim()) return true;

        const lower = search.toLowerCase();

        return Object.keys(row).some((key) => {
          let v = row[key];
          if (v === null || v === undefined) return false;

          // status → string çevir
          if (key === "status") v = statusMap[v] || "";

          // tarih → "YYYY-MM-DD"
          if (key.toLowerCase().includes("date") && v) v = v.split("T")[0];

          return v.toString().toLowerCase().includes(lower);
        });
      })
      .filter((row) =>
        columns.every((col) => {
          const selected = filters[col.key];
          if (!selected.length) return true;

          let value = row[col.key];
          if (value === null || value === undefined) value = "";

          if (col.key === "status") value = statusMap[value] || "";
          if (col.key.includes("Date") && value) value = value.split("T")[0];

          return selected.includes(value.toString());
        })
      );
  }, [data, search, activeFilter, filters]);

  // 🔢 Pagination slice
  const totalPages = Math.ceil(filteredData.length / pageSize);
  const paginated = filteredData.slice((page - 1) * pageSize, page * pageSize);

  // ✔ Kolon filtre seçenekleri
  const getOptions = (key) => {
    const list = new Set();

    data.forEach((item) => {
      let v = item[key];
      if (v === null || v === undefined) return;

      if (key === "status") v = statusMap[v] || "";
      if (key.includes("Date") && v) v = v.split("T")[0];

      list.add(v.toString());
    });

    return Array.from(list).filter((x) => x !== "");
  };

  const applyFilter = (key, values) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setOpenFilter(null);
    setPage(1);
  };

  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: [] }));
    setOpenFilter(null);
    setPage(1);
  };

  return (
    <div className="inventory-table-wrapper">
      {/* 🔎 GLOBAL SEARCH BAR + Aktif/Pasif Dropdown */}
      <div className="table-top-bar">
        <input
          className="global-search"
          type="text"
          placeholder="Ara (Seri / Marka / Model / Açıklama / Kişi ...)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="active-filter"
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="active">Aktif Kayıtlar</option>
          <option value="passive">Pasif Kayıtlar</option>
          <option value="all">Tüm Kayıtlar</option>
        </select>
      </div>

      {/* TABLO */}
      <table className="inventory-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key}>
                <div className="col-header">
                  <span>{col.label}</span>

                  <button
                    className="filter-btn"
                    onClick={() =>
                      setOpenFilter(openFilter === col.key ? null : col.key)
                    }
                  >
                    ▼
                  </button>

                  {openFilter === col.key && (
                    <ColumnFilter
                      title={col.label}
                      options={getOptions(col.key)}
                      selected={filters[col.key]}
                      onChange={(v) => applyFilter(col.key, v)}
                      onClear={() => clearFilter(col.key)}
                      onClose={() => setOpenFilter(null)}
                    />
                  )}
                </div>
              </th>
            ))}
            <th>İŞLEM</th>
          </tr>
        </thead>

        <tbody>
          {paginated.map((row) => (
            <tr key={row.id}>
              {columns.map((c) => {
                let value = row[c.key];

                if (c.key === "status") value = statusMap[value] || "";
                if (c.key.includes("Date") && value)
                  value = value.split("T")[0];

                return <td key={c.key}>{value}</td>;
              })}

              <td className="action-cell">
                <button className="icon-btn edit" data-tooltip="Düzenle">
                  <img src="/src/assets/icons/edit.png" alt="edit" />
                </button>

                <button className="icon-btn delete" data-tooltip="Sil">
                  <img src="/src/assets/icons/trash.png" alt="delete" />
                </button>

                <button className="icon-btn history" data-tooltip="Tarihçe">
                  <img src="/src/assets/icons/history.png" alt="history" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 🔢 PAGINATION */}
      <div className="pagination">
        <button disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Önceki
        </button>

        <span>
          Sayfa {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(page + 1)}
        >
          Sonraki →
        </button>
      </div>
    </div>
  );
}

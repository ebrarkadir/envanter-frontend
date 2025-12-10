import { useState, useMemo } from "react";
import ColumnFilter from "./ColumnFilter";
import "../../styles/table.css";

export default function InventoryTable({ data }) {
  const [openFilter, setOpenFilter] = useState(null);

  const [filters, setFilters] = useState({
    SerialNumber: [],
    Brand: [],
    ItemName: [],
    ItemGroup: [],
    Model: [],
    StockInDate: [],
    StockOutDate: [],
    Status: [],
  });

  const columns = [
    { key: "SerialNumber", label: "SERİ NO" },
    { key: "Brand", label: "MARKA" },
    { key: "ItemName", label: "MALZEME ADI" },
    { key: "ItemGroup", label: "MALZEME GRUBU" },
    { key: "Model", label: "MODEL" },
    { key: "StockInDate", label: "GİRİŞ TARİHİ" },
    { key: "StockOutDate", label: "ÇIKIŞ TARİHİ" },
    { key: "Status", label: "DURUM" },
  ];

  const filteredData = useMemo(() => {
    return data.filter((row) =>
      columns.every((col) => {
        const active = filters[col.key];
        if (!active.length) return true;

        const cellValue = row[col.key];

        return active.includes(
          cellValue === null ? "" : cellValue.toString()
        );
      })
    );
  }, [data, filters]);

  const getOptions = (key) => {
    return [...new Set(data.map((x) => x[key]).filter((x) => x !== null))];
  };

  const applyFilter = (key, values) => {
    setFilters((prev) => ({ ...prev, [key]: values }));
    setOpenFilter(null);
  };

  const clearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: [] }));
    setOpenFilter(null);
  };

  return (
    <div className="inventory-table-wrapper">
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
          {filteredData.map((row) => (
            <tr key={row.Id}>
              {columns.map((c) => (
                <td key={c.key}>
                  {c.key.includes("Date") && row[c.key]
                    ? row[c.key].split("T")[0]
                    : row[c.key]}
                </td>
              ))}

              <td>
                <button className="row-btn edit">Düzenle</button>
                <button className="row-btn delete">Sil</button>
                <button className="row-btn history">Tarihçe</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

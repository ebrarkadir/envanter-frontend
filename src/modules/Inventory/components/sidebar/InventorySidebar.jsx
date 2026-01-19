import { useEffect, useState } from "react";
import "./InventorySidebar.css";
import DropdownInput from "../../../../components/form/Dropdown.Input";

/* =========================
   STATUS ENUM OPTIONS
========================= */
const STATUS_OPTIONS = [
  { value: 5, label: "İçeri Aktarılmış" },
  { value: 0, label: "Depoda" },
  { value: 1, label: "Projede" },
  { value: 2, label: "Arızalı - Onarım" },
  { value: 3, label: "Arızalı - Kullanım Dışı" },
  { value: 4, label: "Stoktan Çıkarıldı" },
];

/* =========================
   EMPTY FORM
========================= */
const EMPTY_FORM = {
  serialNumber: "",
  brand: "",
  itemName: "",
  itemGroup: "",
  model: "",
  stockInDate: "",
  stockOutDate: null,
  description: "",
  assignedProject: "",
  assignedPerson: "",
  status: 5, // İçeri Aktarılmış
};

export default function InventorySidebar({
  open,
  editingItem,
  onToggle,
  onSave,
  onClearEdit,
  options,
}) {
  const [form, setForm] = useState(EMPTY_FORM);

  /* =========================
     FORM DOLDUR (EDIT MODE)
  ========================= */
  useEffect(() => {
    if (editingItem) {
      setForm({
        serialNumber: editingItem.serialNumber ?? "",
        brand: editingItem.brand ?? "",
        itemName: editingItem.itemName ?? "",
        itemGroup: editingItem.itemGroup ?? "",
        model: editingItem.model ?? "",
        stockInDate: editingItem.stockInDate?.split("T")[0] ?? "",
        stockOutDate: editingItem.stockOutDate
          ? editingItem.stockOutDate.split("T")[0]
          : null,
        description: editingItem.description ?? "",
        assignedProject: editingItem.assignedProject ?? "",
        assignedPerson: editingItem.assignedPerson ?? "",
        status: typeof editingItem.status === "number" ? editingItem.status : 5, // 🔥 BURASI
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [editingItem]);

  /* =========================
     INPUT HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((p) => ({
      ...p,
      [name]: value === "" ? null : value,
    }));
  };

  const handleStatusChange = (e) => {
    setForm((p) => ({
      ...p,
      status: Number(e.target.value), // 🔥 STRING → INT
    }));
  };

  /* =========================
     SAVE
  ========================= */
  const handleSave = () => {
    if (!form.serialNumber.trim()) {
      alert("Seri Numarası zorunludur");
      return;
    }

    onSave({
      ...form,
      id: editingItem?.id ?? null,
      lastActionDate: new Date().toISOString(), // 🔥 OTOMATİK
    });
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
    onClearEdit(); // 🔥 editingItem = null
  };

  return (
    <aside className={`inventory-sidebar ${open ? "open" : ""}`}>
      <button className="sidebar-toggle" onClick={onToggle}>
        {open ? "←" : "→"}
      </button>

      <div className="sidebar-header">
        <h3>{editingItem ? "Envanter Güncelle" : "Yeni Envanter Kaydı"}</h3>
      </div>

      <div className="sidebar-body">
        {/* SERİ NO */}
        <div className="form-group">
          <label>Seri Numarası *</label>
          <input
            name="serialNumber"
            value={form.serialNumber}
            onChange={handleChange}
            placeholder="Örn: SN-2024-001"
          />
        </div>

        <div className="form-group">
          <DropdownInput
            label="Marka"
            value={form.brand}
            options={options?.brands ?? []}
            placeholder="Marka seç veya yaz"
            onChange={(v) => setForm((p) => ({ ...p, brand: v }))}
          />
        </div>

        <div className="form-group">
          <label>Malzeme Adı</label>
          <input
            name="itemName"
            value={form.itemName}
            onChange={handleChange}
            placeholder="Örn: Laptop"
          />
        </div>

        <div className="form-group">
          <DropdownInput
            label="Malzeme Grubu"
            value={form.itemGroup}
            options={options?.itemGroups ?? []}
            placeholder="Grup seç veya yaz"
            onChange={(v) => setForm((p) => ({ ...p, itemGroup: v }))}
          />
        </div>

        <div className="form-group">
          <DropdownInput
            label="Model"
            value={form.model}
            options={options?.models ?? []}
            placeholder="Model seç veya yaz"
            onChange={(v) => setForm((p) => ({ ...p, model: v }))}
          />
        </div>

        {/* STATUS – SADECE EDIT MODE */}
        {editingItem && (
          <div className="form-group">
            <label>Durum *</label>
            <select value={form.status} onChange={handleStatusChange}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-group">
          <label>Stok Giriş Tarihi</label>
          <input
            type="date"
            name="stockInDate"
            value={form.stockInDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Stok Çıkış Tarihi</label>
          <input
            type="date"
            name="stockOutDate"
            value={form.stockOutDate ?? ""}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <DropdownInput
            label="Tahsis Edilen Proje"
            value={form.assignedProject}
            options={options?.projects ?? []}
            placeholder="Proje seç veya yaz"
            onChange={(v) => setForm((p) => ({ ...p, assignedProject: v }))}
          />
        </div>

        <div className="form-group">
          <DropdownInput
            label="Tahsis Edilen Kişi"
            value={form.assignedPerson}
            options={options?.persons ?? []}
            placeholder="Kişi seç veya yaz"
            onChange={(v) => setForm((p) => ({ ...p, assignedPerson: v }))}
          />
        </div>

        <div className="form-group">
          <label>Açıklama</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Ek açıklamalar..."
          />
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="primary-btn" onClick={handleSave}>
          Kaydet
        </button>
        <button className="secondary-btn" onClick={handleClear}>
          Temizle
        </button>
      </div>
    </aside>
  );
}

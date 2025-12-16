import { useEffect, useState } from "react";
import "./InventorySidebar.css";

const EMPTY_FORM = {
  serialNumber: "",
  brand: "",
  itemName: "",
  itemGroup: "",
  model: "",
  stockInDate: "",
  stockOutDate: "",
  description: "",
  assignedProject: "",
  assignedPerson: "",
  status: "",
};

export default function InventorySidebar({ open, editingItem, onToggle, onSave }) {
  const [form, setForm] = useState(EMPTY_FORM);

  /* FORM DOLDUR */
  useEffect(() => {
    if (editingItem) {
      setForm({
        serialNumber: editingItem.serialNumber ?? "",
        brand: editingItem.brand ?? "",
        itemName: editingItem.itemName ?? "",
        itemGroup: editingItem.itemGroup ?? "",
        model: editingItem.model ?? "",
        stockInDate: editingItem.stockInDate?.split("T")[0] ?? "",
        stockOutDate: editingItem.stockOutDate?.split("T")[0] ?? "",
        description: editingItem.description ?? "",
        assignedProject: editingItem.assignedProject ?? "",
        assignedPerson: editingItem.assignedPerson ?? "",
        status: editingItem.status ?? "",
      });
    }
  }, [editingItem]);

  const handleChange = (e) =>
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = () => {
    if (!form.serialNumber.trim()) {
      alert("Seri No zorunlu");
      return;
    }

    onSave({
      ...form,
      id: editingItem?.id ?? null,
    });
  };

  const handleClear = () => {
    setForm(EMPTY_FORM);
  };

  return (
    <aside className={`inventory-sidebar ${open ? "open" : ""}`}>
      <button className="sidebar-toggle" onClick={onToggle}>
        {open ? "←" : "→"}
      </button>

      <div className="sidebar-header">
        <h3>Envanter Kaydı</h3>
      </div>

      <div className="sidebar-body">
        {Object.entries(form).map(([key, value]) => (
          <input
            key={key}
            name={key}
            value={value}
            placeholder={key}
            onChange={handleChange}
          />
        ))}
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

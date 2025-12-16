// Dashboard.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InventoryTable from "../modules/Inventory/components/table/InventoryTable";
import InventorySidebar from "../modules/Inventory/components/sidebar/InventorySidebar";
import { getInventories } from "../api/inventoryApi";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [list, setList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("active");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  /* =============================
     DATA LOAD
  ============================== */
  useEffect(() => {
    loadData();
  }, [activeFilter]);

  async function loadData() {
    const data = await getInventories(activeFilter);
    if (activeFilter === "inactive") setList(data.filter((x) => !x.isActive));
    else if (activeFilter === "all") setList(data);
    else setList(data.filter((x) => x.isActive));
  }

  /* =============================
     TABLE → EDIT
  ============================== */
  const handleEdit = (row) => {
    setEditingItem(row); // 🔥 FORM DOLACAK
    setIsSidebarOpen(true); // 🔥 SIDEBAR AÇILACAK
  };

  /* =============================
     SAVE (ADD / UPDATE)
  ============================== */
  const handleSave = (payload) => {
    if (payload.id) {
      console.log("UPDATE:", payload);
      // updateInventory(payload)
    } else {
      console.log("ADD:", payload);
      // addInventory(payload)
    }

    loadData();
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-content">
        <InventorySidebar
          open={isSidebarOpen}
          editingItem={editingItem}
          onToggle={() => setIsSidebarOpen((p) => !p)}
          onSave={handleSave}
        />

        <div className="table-box">
          <InventoryTable
            data={list}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
            onDataChange={setList}
            onEdit={handleEdit} // 🔥 BURASI ŞART
          />
        </div>
      </div>
    </div>
  );
}

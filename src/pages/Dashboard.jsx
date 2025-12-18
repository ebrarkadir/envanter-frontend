// Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import InventoryTable from "../modules/Inventory/components/table/InventoryTable";
import InventorySidebar from "../modules/Inventory/components/sidebar/InventorySidebar";
import PageLoader from "../components/Loading/PageLoader";

import {
  getInventories,
  addInventory,
  updateInventory,
} from "../api/inventoryApi";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [list, setList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("active");

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);

  /* =============================
     USER & PERMISSIONS
  ============================== */
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // rol bazen: role, bazen: roles[0], bazen: type... hepsini toparla
  const rawRole =
    user?.role ??
    user?.Role ??
    (Array.isArray(user?.roles) ? user.roles[0] : undefined) ??
    (Array.isArray(user?.Roles) ? user.Roles[0] : undefined) ??
    "";

  // normalize: trim + lower
  const role = String(rawRole).trim().toLowerCase();

  // DEBUG (1 kere bak, sonra kaldır)
  console.log("USER OBJ:", user);
  console.log("RAW ROLE:", rawRole);
  console.log("NORMALIZED ROLE:", role);

  const permissions = {
    // contracter/contractor + senin yazım hataların dahil
    canEdit: [
      "admin",
      "contracter",
      "contractor",
      "constracter",
      "constructor",
    ].includes(role),
    canDelete: role === "admin",
    canRestore: role === "admin",
    canUseSidebar: role !== "viewer",
  };

  /* =============================
     DATA LOAD
  ============================== */
  useEffect(() => {
    loadData();
  }, [activeFilter]);

  async function loadData({ silent = false } = {}) {
    try {
      if (!silent) setLoading(true);

      const data = await getInventories(activeFilter);

      if (activeFilter === "inactive") {
        setList(data.filter((x) => !x.isActive));
      } else if (activeFilter === "all") {
        setList(data);
      } else {
        setList(data.filter((x) => x.isActive));
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }

  /* =============================
     DISTINCT HELPERS (SIDEBAR DROPDOWNS)
  ============================== */
  const getDistinct = (key) => {
    return Array.from(
      new Set(list.map((x) => x[key]).filter((v) => v && v.toString().trim()))
    ).sort((a, b) => a.localeCompare(b, "tr", { sensitivity: "base" }));
  };

  const sidebarOptions = useMemo(
    () => ({
      brands: getDistinct("brand"),
      itemGroups: getDistinct("itemGroup"),
      models: getDistinct("model"),
      projects: getDistinct("assignedProject"),
      persons: getDistinct("assignedPerson"),
    }),
    [list]
  );

  /* =============================
     TABLE → EDIT
  ============================== */
  const handleEdit = (row) => {
    if (!permissions.canEdit) return;

    setEditingItem(row);
    setIsSidebarOpen(true);
  };

  /* =============================
     SAVE (ADD / UPDATE)
  ============================== */
  const handleSave = async (payload) => {
    try {
      if (payload.id) {
        await updateInventory(payload.id, payload);
      } else {
        await addInventory(payload);
      }

      setEditingItem(null);
      setTimeout(() => {
        setIsSidebarOpen(false);
      }, 280);
      await loadData({ silent: true });
    } catch (err) {
      alert(err.message || "Kayıt işlemi başarısız");
    }
  };

  return (
    <div className="dashboard-page">
      <Navbar />

      {loading && <PageLoader />}

      {!loading && (
        <div className="dashboard-content">
          {permissions.canUseSidebar && (
            <InventorySidebar
              open={isSidebarOpen}
              editingItem={editingItem}
              onToggle={() => setIsSidebarOpen((p) => !p)}
              onSave={handleSave}
              onClearEdit={() => setEditingItem(null)}
              options={sidebarOptions}
            />
          )}

          <div className="table-box">
            <InventoryTable
              data={list}
              loading={loading}
              activeFilter={activeFilter}
              onActiveFilterChange={setActiveFilter}
              onDataChange={setList}
              onEdit={handleEdit}
              permissions={permissions}
            />
          </div>
        </div>
      )}
    </div>
  );
}

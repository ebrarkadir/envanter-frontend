// Dashboard.jsx
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InventoryTable from "../modules/Inventory/components/table/InventoryTable";
import { getInventories } from "../api/inventoryApi";
import "../styles/dashboard.css";

export default function Dashboard() {
  const [list, setList] = useState([]);
  const [activeFilter, setActiveFilter] = useState("active"); // active | inactive | all

  useEffect(() => {
    loadData();
  }, [activeFilter]);

  async function loadData() {
    try {
      const data = await getInventories(activeFilter);
      if (activeFilter === "inactive") setList(data.filter((x) => !x.isActive));
      else if (activeFilter === "all") setList(data);
      else setList(data.filter((x) => x.isActive));
    } catch (err) {
      console.error("ENVANTER ÇEKME HATASI:", err);
      setList([]);
    }
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-content">
        <div className="table-box">
          <InventoryTable
            data={list}
            activeFilter={activeFilter}
            onActiveFilterChange={setActiveFilter}
            onDataChange={setList}
          />
        </div>
      </div>
    </div>
  );
}

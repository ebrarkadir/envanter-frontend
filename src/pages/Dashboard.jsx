import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import InventoryTable from "../modules/Inventory/components/table/InventoryTable";
import { getInventories } from "../api/inventoryApi";
import "../styles/dashboard.css"; // Stil dosyamız

export default function Dashboard() {
  const [list, setList] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const data = await getInventories();
      setList(data);
    } catch (err) {
      console.error("ENVANTER ÇEKME HATASI:", err);
    }
  }

  return (
    <div className="dashboard-page">
      <Navbar />

      <div className="dashboard-content">
        <div className="table-box">
          <InventoryTable data={list} />
        </div>
      </div>
    </div>
  );
}

import Navbar from "../components/Navbar";
import InventoryTable from "../modules/Inventory/components/table/InventoryTable";

export default function Dashboard() {
  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* NAVBAR */}
      <Navbar />

      {/* TABLO ALANI */}
      <div style={{ padding: "20px", flex: 1, overflow: "auto" }}>
        <InventoryTable />
      </div>

    </div>
  );
}

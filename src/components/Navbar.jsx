import { useState } from "react";
import LogsModal from "./Logs/LogsModal";
import UsersModal from "../modules/Users/componentes/UsersModal";
import logo from "../assets/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const [openMenu, setOpenMenu] = useState(false);
  const [openLogs, setOpenLogs] = useState(false);
  const [openUsers, setOpenUsers] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const openUsersSafe = () => {
    setOpenMenu(false);

    if (!user?.canUsers) {
      alert("Bu alana erişim yetkin yok.");
      return;
    }

    setOpenUsers(true);
  };

  const openLogsSafe = () => {
    setOpenMenu(false);

    if (!user?.canLogs) {
      alert("Bu alana erişim yetkin yok.");
      return;
    }

    setOpenLogs(true);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-left">
          <img src={logo} className="nav-logo" alt="ULAK Logo" />
          <span className="app-title">Envanter Takip Sistemi</span>
        </div>

        <div className="navbar-right">
          {/* 🔐 Kullanıcı Yönetimi */}
          {user?.canUsers && (
            <button className="nav-btn" onClick={openUsersSafe}>
              Kullanıcı Yönetimi
            </button>
          )}

          {/* 📜 Loglar */}
          {user?.canLogs && (
            <button className="nav-btn" onClick={openLogsSafe}>
              Loglar
            </button>
          )}

          {/* 👤 USER DROPDOWN */}
          <div className="user-box-wrapper">
            <div className="user-box" onClick={() => setOpenMenu((p) => !p)}>
              <span>{user?.username || "-"}</span>
              <span className="role-badge">{user?.role || "-"}</span>
            </div>

            {openMenu && (
              <div className="user-dropdown">
                <button onClick={logout}>Çıkış Yap</button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* 🔽 MODALLAR */}
      {openLogs && <LogsModal onClose={() => setOpenLogs(false)} />}

      {openUsers && (
        <UsersModal open={openUsers} onClose={() => setOpenUsers(false)} />
      )}
    </>
  );
}

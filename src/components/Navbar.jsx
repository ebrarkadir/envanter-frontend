import { useState } from "react";
import logo from "../assets/logo.png";
import "./Navbar.css";

export default function Navbar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [openMenu, setOpenMenu] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <img src={logo} className="nav-logo" alt="ULAK Logo" />
        <span className="app-title">Envanter Takip Sistemi</span>
      </div>

      <div className="navbar-right">

        {/* Yetki kontrollü butonlar */}
        {user?.canUsers && (
          <button className="nav-btn">Kullanıcı Yönetimi</button>
        )}

        {user?.canLogs && (
          <button className="nav-btn">Loglar</button>
        )}

        {/* USER DROPDOWN */}
        <div className="user-box-wrapper">
          <div
            className="user-box"
            onClick={() => setOpenMenu(!openMenu)}
          >
            <span>{user?.username}</span>
            <span className="role-badge">{user?.role}</span>
          </div>

          {openMenu && (
            <div className="user-dropdown">
              <button onClick={logout}>Çıkış Yap</button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

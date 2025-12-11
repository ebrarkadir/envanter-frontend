import { useState } from "react";
import { loginRequest } from "../api/authApi";
import { saveToken, saveRefreshToken } from "../utils/token";
import logo from "../assets/logo.png";
import wallpaper from "../assets/wallpaper.jpg";
import "../styles/login.css";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");

  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isPasswordFilled, setIsPasswordFilled] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("Login çalıştı:", username, password);
    try {
      const data = await loginRequest(username, password);

      saveToken(data.token);
      saveRefreshToken(data.refreshToken);

      localStorage.setItem(
        "user",
        JSON.stringify({
          id: data.id,
          username: data.username,
          role: data.role,
          canInventory: data.canInventory,
          canUsers: data.canUsers,
          canLogs: data.canLogs,
        })
      );

      window.location.href = "/";
    } catch (err) {
      setError("Kullanıcı adı veya şifre hatalı!");
    }
  };

  return (
    <div className="login-bg" style={{ backgroundImage: `url(${wallpaper})` }}>
      <div className="login-card">
        <div className="login-header">
          <img src={logo} alt="ULAK Logo" className="login-logo" />
        </div>
        <button className="company-btn">ULAK HABERLEŞME A.Ş.</button>

        <h2 className="login-title">Kullanıcı Girişi</h2>

        <form onSubmit={handleLogin} className="login-form">
          <label>
            KULLANICI ADI
            <input
              type="text"
              placeholder="Kullanıcı Adı"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label>
            ŞİFRE
            <div className="password-wrapper">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Şifre"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setIsPasswordFilled(e.target.value.length > 0);
                }}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                className={
                  isPasswordFocused || isPasswordFilled
                    ? "input-focused"
                    : "input-empty"
                }
              />

              <button
                type="button"
                className={`show-btn ${
                  isPasswordFocused || isPasswordFilled
                    ? "input-focused"
                    : "input-empty"
                }`}
                onClick={() => setShowPass(!showPass)}
              >
                {showPass ? "Gizle" : "Göster"}
              </button>
            </div>
          </label>

          {error && <div className="error">{error}</div>}

          <button type="submit" className="login-btn">
            Giriş Yap
          </button>
        </form>
      </div>

      <div className="theme-btn">🌗 Tema</div>
    </div>
  );
}

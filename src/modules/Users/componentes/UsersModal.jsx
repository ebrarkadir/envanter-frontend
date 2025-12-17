import { useEffect, useState } from "react";
import {
  getUsers,
  createUser,
  updateUser,
  passiveUser,
  restoreUser,
} from "../../../api/usersApi";
import "./UsersModal.css";
import editIcon from "../../../assets/icons/edit.png";
import trashIcon from "../../../assets/icons/trash.png";
import resetIcon from "../../../assets/icons/reset.png";

// 🔥 Loader Importları
import TableLoader from "../../../components/Loading/TableLoader";
import ButtonLoader from "../../../components/Loading/ButtonLoader";

const ROLE_LABEL = {
  Admin: "Admin",
  Constructor: "Constructor",
  Viewer: "Viewer",
  1: "Admin",
  2: "Constructor",
  3: "Viewer",
};

export default function UsersModal({ open, onClose }) {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("active");
  const [editingId, setEditingId] = useState(null);
  
  // 🔥 Genel sayfa/tablo yükleniyor mu?
  const [loading, setLoading] = useState(false);
  
  // 🔥 Form kaydediliyor mu?
  const [isSaving, setIsSaving] = useState(false);

  // 🔥 Silme/Geri yükleme işlemi sürüyor mu?
  const [isConfirming, setIsConfirming] = useState(false);

  const [confirm, setConfirm] = useState({
    open: false,
    action: null, // "delete" | "restore"
    user: null,
  });

  const [form, setForm] = useState({
    username: "",
    password: "",
    role: 3,
    canInventory: false,
    canLogs: false,
    canUsers: false,
  });

  /* =========================
      KULLANICI LİSTESİ YÜKLE
      ========================= */
  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await getUsers(filter);
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message === "FORBIDDEN") {
        alert("Kullanıcı yönetimi yetkin yok.");
        onClose();
        return;
      }
      console.error("User load error:", err);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadUsers();
  }, [open, filter]);

  /* =========================
      FORM
      ========================= */
  const resetForm = () => {
    setEditingId(null);
    setForm({
      username: "",
      password: "",
      role: 3,
      canInventory: false,
      canLogs: false,
      canUsers: false,
    });
  };

  const handleSave = async () => {
    if (!form.username.trim()) {
      alert("Kullanıcı adı zorunlu");
      return;
    }

    // 🔥 Loader Başlat
    setIsSaving(true);
    try {
      if (editingId) {
        await updateUser(editingId, form);
      } else {
        await createUser(form);
      }
      resetForm();
      await loadUsers();
    } catch (err) {
      console.error(err);
      alert("İşlem başarısız");
    } finally {
      // 🔥 Loader Durdur
      setIsSaving(false);
    }
  };

  const handleEdit = (u) => {
    setEditingId(u.id);
    setForm({
      username: u.username,
      password: "",
      role: u.role === "Admin" ? 1 : u.role === "Constructor" ? 2 : 3,
      canInventory: u.canInventory,
      canLogs: u.canLogs,
      canUsers: u.canUsers,
    });
  };

  const handleRoleChange = (role) => {
    if (role === 1) {
      setForm({
        ...form,
        role,
        canInventory: true,
        canLogs: true,
        canUsers: true,
      });
    } else {
      setForm({ ...form, role });
    }
  };

  if (!open) return null;

  return (
    <div className="users-modal-backdrop">
      <div className="users-modal">
        {/* HEADER */}
        <div className="modal-header">
          <h2>Kullanıcı Yönetimi</h2>
          <button onClick={onClose}>Kapat</button>
        </div>

        {/* FORM */}
        <div className="user-form">
          {/* SOL */}
          <div className="form-left">
            <input
              placeholder="Kullanıcı adı girin"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />

            <input
              placeholder="Şifre girin"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />

            <div className="permissions">
              <label>
                <input
                  type="checkbox"
                  checked={form.canInventory}
                  disabled={form.role === 1}
                  onChange={(e) =>
                    setForm({ ...form, canInventory: e.target.checked })
                  }
                />
                Envanter
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.canLogs}
                  disabled={form.role === 1}
                  onChange={(e) =>
                    setForm({ ...form, canLogs: e.target.checked })
                  }
                />
                Loglar
              </label>

              <label>
                <input
                  type="checkbox"
                  checked={form.canUsers}
                  disabled={form.role === 1}
                  onChange={(e) =>
                    setForm({ ...form, canUsers: e.target.checked })
                  }
                />
                Kullanıcı Yönetimi
              </label>
            </div>
          </div>

          {/* SAĞ */}
          <div className="form-right">
            <select
              value={form.role}
              onChange={(e) => handleRoleChange(Number(e.target.value))}
            >
              <option value={1}>Admin</option>
              <option value={2}>Constructor</option>
              <option value={3}>Viewer</option>
            </select>

            <button 
              className="primary" 
              onClick={handleSave}
              disabled={isSaving} // İşlem sürerken tıklanmasın
            >
              {/* 🔥 ButtonLoader Entegrasyonu */}
              {isSaving ? (
                <ButtonLoader />
              ) : editingId ? (
                "Kullanıcı Güncelle"
              ) : (
                "Kullanıcı Kaydet"
              )}
            </button>

            <button 
              className="outline" 
              onClick={resetForm}
              disabled={isSaving}
            >
              Form Temizle
            </button>
          </div>
        </div>

        <h3 className="list-title">Kullanıcı Listesi</h3>

        <select
          className="list-filter"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={loading}
        >
          <option value="active">Aktif Kullanıcılar</option>
          <option value="inactive">Silinmiş Kullanıcılar</option>
          <option value="all">Tümü</option>
        </select>

        <div className="users-list-card">
          {/* TABLO */}
          {loading ? (
             // 🔥 TableLoader Entegrasyonu (4 kolon, 5 satır örnek)
            <TableLoader columns={4} rows={5} />
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th>Kullanıcı</th>
                  <th>Rol</th>
                  <th>Yetkiler</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className={!u.isActive ? "inactive-row" : ""}>
                    <td>{u.username}</td>
                    <td>{ROLE_LABEL[u.role]}</td>
                    <td>
                      {u.canInventory && "Envanter "}
                      {u.canLogs && "Loglar "}
                      {u.canUsers && "Kullanıcı "}
                    </td>
                    <td>
                      <div className="user-actions">
                        {u.isActive ? (
                          <>
                            <button
                              className="icon-btn edit"
                              onClick={() => handleEdit(u)}
                              data-tooltip="Düzenle"
                            >
                              <img src={editIcon} alt="Düzenle" />
                            </button>

                            <button
                              className="icon-btn delete"
                              data-tooltip="Sil"
                              onClick={() =>
                                setConfirm({
                                  open: true,
                                  action: "delete",
                                  user: u,
                                })
                              }
                            >
                              <img src={trashIcon} alt="Sil" />
                            </button>
                          </>
                        ) : (
                          <button
                            className="icon-btn restore"
                            data-tooltip="Geri Yükle"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                action: "restore",
                                user: u,
                              })
                            }
                          >
                            <img src={resetIcon} alt="Geri Yükle" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 20 }}>
                      Kullanıcı bulunamadı.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
      
      {/* ONAY MODALI */}
      {confirm.open && (
        <div className="confirm-backdrop">
          <div className="confirm-modal">
            <h3>Onay Gerekli</h3>

            <p>
              <strong>{confirm.user.username}</strong> kullanıcısı{" "}
              {confirm.action === "delete"
                ? "pasif hale getirilecek"
                : "tekrar aktif edilecek"}
              .
            </p>

            <p className="confirm-warning">Bu işlem geri alınamaz.</p>

            <div className="confirm-actions">
              <button
                className="outline"
                disabled={isConfirming}
                onClick={() =>
                  setConfirm({ open: false, action: null, user: null })
                }
              >
                Vazgeç
              </button>

              <button
                className="danger"
                disabled={isConfirming}
                onClick={async () => {
                  // 🔥 Loader Başlat
                  setIsConfirming(true);
                  try {
                    if (confirm.action === "delete") {
                      await passiveUser(confirm.user.id);
                    } else {
                      await restoreUser(confirm.user.id);
                    }

                    setConfirm({ open: false, action: null, user: null });
                    loadUsers();
                  } catch(e) {
                      alert("İşlem sırasında hata oluştu.")
                  } finally {
                    // 🔥 Loader Durdur
                    setIsConfirming(false);
                  }
                }}
              >
                {/* 🔥 ButtonLoader Entegrasyonu */}
                {isConfirming ? <ButtonLoader /> : "Evet, Onaylıyorum"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
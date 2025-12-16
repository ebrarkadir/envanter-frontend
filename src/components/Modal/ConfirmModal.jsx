import "./ConfirmModal.css"
export default function ConfirmModal({ title, message, onConfirm, onCancel }) {
  return (
    <div className="confirm-overlay">
      <div className="confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>

        <div className="confirm-actions">
          <button className="outline-btn" onClick={onCancel}>
            Vazgeç
          </button>
          <button className="danger-btn" onClick={onConfirm}>
            Onayla
          </button>
        </div>
      </div>
    </div>
  );
}

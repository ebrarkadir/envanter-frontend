import "../styles/DescriptionModal.css";

export default function DescriptionModal({ text, onClose }) {
  if (!text) return null;

  return (
    <div className="desc-modal-backdrop" onClick={onClose}>
      <div className="desc-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Açıklama</h3>
        <div className="desc-content">{text}</div>

        <button className="desc-close-btn" onClick={onClose}>
          Kapat
        </button>
      </div>
    </div>
  );
}

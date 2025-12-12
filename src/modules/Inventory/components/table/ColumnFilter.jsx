import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/table.css";

export default function ColumnFilter({
  title,
  options = [],
  selected = [],
  anchorRef,
  onChange,
  onClear,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [localSelection, setLocalSelection] = useState([...selected]);
  const dropdownRef = useRef(null);
  
  // Başlangıçta null (render etme)
  const [pos, setPos] = useState(null);

  /* 🔥 EKRAN BOYANMADAN ÖNCE POZİSYON HESAPLA (Animasyonu engeller) */
  useLayoutEffect(() => {
    if (!anchorRef) return;

    const rect = anchorRef.getBoundingClientRect();
    const dropdownWidth = 220;

    let left = rect.right - dropdownWidth;
    if (left < 8) left = rect.left;

    setPos({
      top: rect.bottom + window.scrollY + 6,
      left: left + window.scrollX,
    });
  }, [anchorRef]);

  /* 🔥 DIŞARI TIKLAMA KONTROLÜ (useEffect burada lazım) */
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !anchorRef.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

  // Pozisyon hesaplanana kadar hiçbir şey gösterme
  if (!pos) return null;

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const toggleItem = (item) => {
    setLocalSelection((prev) =>
      prev.includes(item)
        ? prev.filter((x) => x !== item)
        : [...prev, item]
    );
  };

  const toggleAll = () => {
    setLocalSelection(
      localSelection.length === options.length ? [] : [...options]
    );
  };

  return createPortal(
    <div
      ref={dropdownRef}
      className="filter-dropdown"
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        zIndex: 9999,
        // 🔥 CSS transition varsa bile bunu eziyoruz ki animasyon olmasın
        transition: "none", 
      }}
    >
      <div className="filter-title">{title} Filtrele</div>

      <input
        className="filter-search"
        placeholder="Ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter-option" onClick={toggleAll}>
        <input
          type="checkbox"
          readOnly
          checked={localSelection.length === options.length}
        />
        <span>(Tümü)</span>
      </div>

      <div className="filter-list">
        {filteredOptions.map((item) => (
          <div
            key={item}
            className="filter-option"
            onClick={() => toggleItem(item)}
          >
            <input
              type="checkbox"
              readOnly
              checked={localSelection.includes(item)}
            />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="filter-actions">
        <button
          className="filter-ok"
          onClick={() => onChange(localSelection)}
        >
          OK
        </button>
        <button className="filter-clear" onClick={onClear}>
          Temizle
        </button>
      </div>
    </div>,
    document.body
  );
}
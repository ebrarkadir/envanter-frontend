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
  const [localSelection, setLocalSelection] = useState([]);
  const dropdownRef = useRef(null);
  const [pos, setPos] = useState(null);

  /* =========================
     🔥 SEÇİM SENKRONİZASYONU
     ========================= */

  // Parent’tan gelen selected değişirse → sync et
  useEffect(() => {
    setLocalSelection(selected.filter((x) => options.includes(x)));
  }, [selected, options]);

  // Options daralırsa → geçersiz seçimleri at
  useEffect(() => {
    setLocalSelection((prev) => prev.filter((x) => options.includes(x)));
  }, [options]);

  /* =========================
     🔥 POZİSYON HESABI
     ========================= */
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

  /* =========================
     🔥 DIŞARI TIKLAMA
     ========================= */
  useEffect(() => {
    const handler = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        anchorRef &&
        !anchorRef.contains(e.target)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose, anchorRef]);

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

      {localSelection.length > 0 && (
        <div className="filter-selected-preview">
          <span className="label">Seçilenler:</span>
          <span className="values">
            {localSelection.slice(0, 2).join(", ")}
            {localSelection.length > 2 &&
              `, +${localSelection.length - 2}`}
          </span>
        </div>
      )}

      <div className="filter-option" onClick={toggleAll}>
        <input
          type="checkbox"
          readOnly
          checked={
            options.length > 0 &&
            localSelection.length === options.length
          }
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
        <button
          className="filter-clear"
          onClick={() => {
            setLocalSelection([]);
            onClear();
          }}
        >
          Temizle
        </button>
      </div>
    </div>,
    document.body
  );
}

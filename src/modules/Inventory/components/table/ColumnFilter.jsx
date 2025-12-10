import { useEffect, useRef, useState } from "react";
import "./../../styles/table.css";

export default function ColumnFilter({
  title,
  options = [],
  selected = [],
  onChange,
  onClear,
  onClose,
}) {
  const [search, setSearch] = useState("");
  const [localSelection, setLocalSelection] = useState([...selected]);
  const ref = useRef();

  // Dışarı tıklayınca kapanma
  useEffect(() => {
    const clickHandler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", clickHandler);
    return () => document.removeEventListener("mousedown", clickHandler);
  }, []);

  const filteredOptions = options.filter((o) =>
    o.toLowerCase().includes(search.toLowerCase())
  );

  const toggleItem = (item) => {
    if (localSelection.includes(item)) {
      setLocalSelection(localSelection.filter((x) => x !== item));
    } else {
      setLocalSelection([...localSelection, item]);
    }
  };

  const toggleAll = () => {
    if (localSelection.length === options.length) {
      setLocalSelection([]);
    } else {
      setLocalSelection([...options]);
    }
  };

  return (
    <div className="filter-dropdown" ref={ref}>
      <div className="filter-title">{title} Filtrele</div>

      <input
        type="text"
        placeholder="Ara..."
        className="filter-search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="filter-option" onClick={toggleAll}>
        <input
          type="checkbox"
          checked={localSelection.length === options.length}
          readOnly
        />
        <span>(Tümü)</span>
      </div>

      <div className="filter-list">
        {filteredOptions.map((item) => (
          <div key={item} className="filter-option" onClick={() => toggleItem(item)}>
            <input
              type="checkbox"
              checked={localSelection.includes(item)}
              readOnly
            />
            <span>{item}</span>
          </div>
        ))}
      </div>

      <div className="filter-actions">
        <button className="filter-ok" onClick={() => onChange(localSelection)}>
          OK
        </button>
        <button className="filter-clear" onClick={onClear}>
          Temizle
        </button>
      </div>
    </div>
  );
}

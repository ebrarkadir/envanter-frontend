import { useState } from "react";
import "./DropdownInput.css";

export default function DropdownInput({
  label,
  name,
  value,
  options = [],
  onChange,
  placeholder,
}) {
  const [open, setOpen] = useState(false);

  const filtered = options
    .map(String)
    .filter((o) => o.toLowerCase().includes((value ?? "").toLowerCase()));

  return (
    <div className="form-group dropdown-input">
      <label>{label}</label>

      <div className="dropdown-wrapper">
        <input
          name={name}
          value={value ?? ""}
          placeholder={placeholder}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
        />

        <button
          type="button"
          className="dropdown-arrow"
          onMouseDown={() => setOpen((p) => !p)}
        >
          ▼
        </button>
      </div>

      {open && filtered.length > 0 && (
        <div className="dropdown-list">
          {filtered.map((opt) => (
            <div
              key={opt}
              className="dropdown-item"
              onMouseDown={() => onChange(opt)}
            >
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

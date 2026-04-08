import { useEffect, useRef, useState } from "react";
import "./Tooltip.css";

export default function Tooltip({ text = "", ariaLabel = "More info", icon = "i" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    function onKey(e) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className={`tooltip ${open ? "open" : ""}`} ref={ref}>
      <button
        type="button"
        className="flex items-center justify-center cursor-pointer transition-colors duration-200 text-[#c6c6cc] hover:text-[#e0e2ed] focus:outline-none"
        aria-label={ariaLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="material-symbols-outlined text-base">{icon}</span>
      </button>

      {text ? (
        <div
          role="dialog"
          aria-hidden={!open}
          className={`tooltip-bubble ${open ? "visible" : ""}`}
        >
          {text}
        </div>
      ) : null}
    </div>
  );
}

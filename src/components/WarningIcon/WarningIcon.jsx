import React from "react";
import "./WarningIcon.css";

const WarningIcon = ({ color, size = 20, className = "", onClick }) => {
  
  const warningColor = color ? (() => {
    switch (color) {
      case "YELLOW":
        return "#ffdd57";
      case "RED":
        return "#ff3300";
      case "ORANGE":
        return "#ff9900";
      default:
        return color;
    }
  })() : "currentColor";

  const style = {
    "--warning-color": warningColor,
    width: size,
    height: size,
  };
  const glowClass = color ? "glow" : "";
  return (
    <span
      className={`warning-icon ${glowClass} ${className}`}
      style={style}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") onClick(e);
      }}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path
          d="M12 3.2 L2.4 20h19.2L12 3.2z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <rect x="11" y="8.2" width="2" height="5.6" rx="1" fill="currentColor" />
        <circle cx="12" cy="15.9" r="1" fill="currentColor" />
      </svg>
    </span>
  );
};

export default WarningIcon;

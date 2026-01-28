import React from "react";
import "./WarningIcon.css";

const WarningIcon = ({ color, size = 20, className = "" }) => {
  
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
    <span className={`warning-icon ${glowClass} ${className}`} style={style}>
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <path d="M1 21h22L12 2 1 21z" />
        <rect x="11" y="10" width="2" height="5" rx="1" />
        <rect x="11" y="17" width="2" height="2" rx="1" />
      </svg>
    </span>
  );
};

export default WarningIcon;

import "./WarningModal.css";

const WarningModal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="warning-modal-overlay" role="dialog" aria-modal="true">
      <div className="warning-modal-backdrop" onClick={onClose} />
      <div className="warning-modal-content">
        <button className="warning-modal-close" onClick={onClose} aria-label="Close">×</button>
        <div className="warning-modal-body">{children}</div>
      </div>
    </div>
  );
};

export default WarningModal;

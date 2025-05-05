function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div style={{ marginTop: 20 }}>
          <button onClick={onConfirm} style={confirmBtn}>
            ยืนยัน
          </button>
          <button onClick={onCancel} style={cancelBtn}>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: "rgba(0, 0, 0, 0.4)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 2000,
};

const modalStyle = {
  backgroundColor: "white",
  padding: 24,
  borderRadius: 12,
  minWidth: 300,
  textAlign: "center",
};

const confirmBtn = {
  marginRight: 10,
  backgroundColor: "#28a745",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: 4,
};

const cancelBtn = {
  backgroundColor: "#dc3545",
  color: "white",
  padding: "6px 12px",
  border: "none",
  borderRadius: 4,
};

export default ConfirmModal;

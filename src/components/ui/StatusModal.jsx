import React from "react";

function StatusModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={overlayStyle}>
      <div style={modalStyle}>
        <p>{message}</p>
        <button style={buttonStyle} onClick={onClose}>
          ตกลง
        </button>
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
  backgroundColor: "rgba(0,0,0,0.3)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1200,
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  borderRadius: 10,
  minWidth: "300px",
  textAlign: "center",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)",
};

const buttonStyle = {
  marginTop: 20,
  padding: "6px 12px",
  borderRadius: 6,
  backgroundColor: "#007bff",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

export default StatusModal;

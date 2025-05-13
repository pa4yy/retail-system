import React from "react";

function StatusModal({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-[1200]">
      <div className="bg-white p-5 rounded-lg min-w-[300px] text-center shadow-lg">
        <p className="text-gray-700 mb-5">{message}</p>
        <button 
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}

export default StatusModal;

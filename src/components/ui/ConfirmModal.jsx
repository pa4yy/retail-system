function ConfirmModal({ isOpen, title, message, onConfirm, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl min-w-[300px] text-center">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-5">{message}</p>
        <div className="flex justify-center gap-3">
          <button 
            onClick={onConfirm} 
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
          >
            ยืนยัน
          </button>
          <button 
            onClick={onCancel} 
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
          >
            ยกเลิก
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;

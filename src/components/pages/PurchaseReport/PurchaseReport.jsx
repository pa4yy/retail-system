import React, { useEffect, useState } from "react";
import MainLayout from "../../layout/MainLayout";
import ReceiveProductModal from './ReceiveProductModal';
import axios from "axios";

function PurchaseReport({ user }) {
  const [purchases, setPurchases] = useState([]);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState({
    Purchased: true,
    Received: true
  });

  useEffect(() => {
    axios.get("http://localhost:5000/api/purchases")
      .then(res => setPurchases(res.data))
      .catch(err => console.error("Load failed", err));
  }, []);

  const handleViewDetails = async (purchase) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/purchase-detail/${purchase.Purchase_Id}`);
      setSelectedPurchase({
        ...purchase,
        Products: res.data,
      });
      setShowModal(true);
    } catch (err) {
      console.error("Load purchase details failed", err);
      alert("ไม่สามารถโหลดรายละเอียดคำสั่งซื้อได้");
    }
  };

  const fetchPurchases = async () => {
    const res = await axios.get("http://localhost:5000/api/purchases");
    setPurchases(res.data);
  };

  const filtered = purchases.filter(p => {
    const matchSearch =
      p.Purchase_Id.toString().includes(search) ||
      p.Supplier_Name?.toLowerCase().includes(search.toLowerCase());

    const purchaseDate = new Date(p.Purchase_Date);
    const isAfterStart = startDate ? purchaseDate >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? purchaseDate <= new Date(endDate) : true;
    const matchStatus = statusFilter[p.Purchase_Status];

    return matchSearch && isAfterStart && isBeforeEnd && matchStatus;
  });

  const handleStatusChange = (status) => {
    setStatusFilter(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  return (
    <MainLayout user={user} title="การสั่งซื้อสินค้า">
      <div className="h-full p-6 bg-white rounded-lg shadow flex flex-col">
        <h2 className="text-2xl font-bold mb-6">การสั่งซื้อสินค้า</h2>

        {/* Filter */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          {/* วันที่และสถานะ */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="font-medium">วันที่</label>
              <input
                type="date"
                className="border px-3 py-2 rounded"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>ถึง</span>
              <input
                type="date"
                className="border px-3 py-2 rounded"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* สถานะ */}
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={statusFilter.Purchased}
                  onChange={() => handleStatusChange('Purchased')}
                  className="w-4 h-4"
                />
                <span>สั่งซื้อแล้ว</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={statusFilter.Received}
                  onChange={() => handleStatusChange('Received')}
                  className="w-4 h-4"
                />
                <span>รับสินค้าแล้ว</span>
              </label>
            </div>
          </div>

          {/* ค้นหา */}
          <div className="flex items-center gap-2 mt-4 sm:mt-0">
            <input
              type="text"
              className="border px-3 py-2 rounded w-[220px]"
              placeholder="ค้นหาเลขสั่งซื้อ / ผู้ขาย"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              ค้นหา
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-hidden">
          <div className="h-[600px] overflow-y-auto">
            <table className="w-full border-collapse">
              <colgroup>
                <col style={{ width: "60px" }} />
                <col style={{ width: "140px" }} />
                <col style={{ width: "250px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "100px" }} />
              </colgroup>
              <thead className="sticky top-0">
                <tr className="bg-blue-700 text-white">
                  <th className="py-3 text-sm">หมายเลขคำสั่งซื้อ</th>
                  <th className="py-3 text-sm">วันที่สั่งซื้อ</th>
                  <th className="py-3 text-sm">คู่ค้า</th>
                  <th className="py-3 text-sm">ราคารวม</th>
                  <th className="py-3 text-sm">สถานะ</th>
                  <th className="py-3 text-sm">เพิ่มเติม</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-gray-500">ไม่พบข้อมูล</td>
                  </tr>
                ) : (
                  filtered.map((p, index) => (
                    <tr
                      key={p.Purchase_Id}
                      className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-50"}`}
                    >
                      <td className="py-2 text-center">{p.Purchase_Id}</td>
                      <td className="py-2 text-center">
                        {new Date(p.Purchase_Date).toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' })}
                      </td>
                      <td className="py-2 text-center">{p.Supplier_Name}</td>
                      <td className="py-2 text-center">{parseFloat(p.Total_Purchase_Price).toFixed(2)}</td>
                      <td className="py-2 text-center">{p.Purchase_Status}</td>
                      <td className="py-2 text-center">
                        <button
                          className="text-blue-600 hover:underline disabled:opacity-50"
                          onClick={() => handleViewDetails(p)}
                        >
                          รายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <ReceiveProductModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          purchase={selectedPurchase}
          user={user}
          onReceiveSuccess={fetchPurchases}
        />
      </div>
    </MainLayout>
  );
}

export default PurchaseReport;

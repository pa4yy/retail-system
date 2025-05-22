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
  


  const filtered = purchases.filter(p => {
    const matchSearch =
      p.Purchase_Id.toString().includes(search) ||
      p.Supplier_Name?.toLowerCase().includes(search.toLowerCase());

    const purchaseDate = new Date(p.Purchase_Date);
    const isAfterStart = startDate ? purchaseDate >= new Date(startDate) : true;
    const isBeforeEnd = endDate ? purchaseDate <= new Date(endDate) : true;

    return matchSearch && isAfterStart && isBeforeEnd;
  });

  return (
    <MainLayout user={user} title="การสั่งซื้อสินค้า">
      <div className="p-6 bg-white rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-6">การสั่งซื้อสินค้า</h2>

        {/* Filter */}
        <div className="flex flex-wrap justify-between items-center mb-6">
          {/* วันที่ */}
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
        <div style={{ maxHeight: 720, minHeight: 720, overflowY: "auto" }}>
          <table className="min-w-[800px] w-full table-fixed">
            <colgroup>
              <col style={{ width: "60px" }} />
              <col style={{ width: "140px" }} />
              <col style={{ width: "250px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "120px" }} />
              <col style={{ width: "100px" }} />
            </colgroup>
            <thead className="bg-blue-800 text-white sticky top-0">
              <tr>
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
                    className={`${index % 2 === 0 ? "bg-white" : "bg-blue-50"} hover:bg-blue-100 transition`}
                  >
                    <td className="py-2 text-center">{p.Purchase_Id}</td>
                    <td className="py-2 text-center">{new Date(p.Purchase_Date).toLocaleString()}</td>
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

        <ReceiveProductModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          purchase={selectedPurchase}
          user={user}
        />
      </div>
    </MainLayout>

  );
}

export default PurchaseReport;

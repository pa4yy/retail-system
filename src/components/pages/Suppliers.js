import React, { useState } from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';
import styles from '../ui/Suppliers.module.css';
import { FaTrash } from 'react-icons/fa';

function Suppliers({ user }) {
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');


  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    setSuppliers(suppliers.filter((_, i) => i !== deleteIndex));
    setShowDeleteModal(false);
    setDeleteIndex(null);
  };
  // ดัมมี่ลบข้อมูล
  const [suppliers, setSuppliers] = useState([
    {
      name: "LnwZa007",
      address: "500 Star Conculor Garena Rov",
      phone: "081-234-5678"
    }
    // เพิ่มข้อมูลอื่นๆ ได้ที่นี่
  ]);
  // ดัมมี่ลบข้อมูล

  return (
    <MainLayout user={user} title="Supplier">
      <div className={styles.container}>
        <h1 className="text-2xl font-bold text-gray-800">ข้อมูลคู่ค้า</h1>
        <div className={styles.tableBox}>
          <div className="flex justify-between items-center mb-6">

            {/* ปุ่มฟ้า */}
            <div className={styles.containerbtn}>
              <div className={styles.headerrowbtn}>
                <button className={styles.custombtn} onClick={() => setShowModal(true)}> เพิ่มข้อมูล </button>
              </div>
            </div>
            {/*  */}

          </div>
          {/* ตารางข้อมูลคู่ค้า */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className={`${styles.thName} py-3 px-4 border-b text-left`}>ชื่อคู่ค้า</th>
                <th className={`${styles.thAddress} py-3 px-4 border-b text-left`}>ที่อยู่คู่ค้า</th>
                <th className={`${styles.thPhone} py-3 px-4 border-b text-left`}>เบอร์โทรคู่ค้า</th>
                <th className={`${styles.thEdit} py-3 px-4 border-b text-center`}>แก้ไขข้อมูล</th>
                <th className={`${styles.thDelete} py-3 px-4 border-b text-center`}>ลบข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {/* ตัวอย่างข้อมูล */}
              <tr className={styles.tableRow}>
                <td className="py-3 px-4 border-b">LnwZa007</td>
                <td className="py-3 px-4 border-b">500 Star Conculor Garena Rov</td>
                <td className="py-3 px-4 border-b">081-234-5678</td>
                <td className="py-3 px-4 border-b text-center">
                  <button className={styles.editTextBtn} onClick={() => setShowEditModal(true)}>แก้ไข</button>
                </td>
                <td className="py-3 px-4 border-b text-center">
                  <button className={styles.deleteIconBtn} onClick={handleDelete} title="ลบ">
                    <FaTrash color="#FF443A" size={24} />
                  </button>
                </td>
              </tr>
              {/* เพิ่ม row ตามข้อมูลจริง */}
            </tbody>
          </table>

          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h2>เพิ่มข้อมูลคู่ค้า</h2>
                <form>
                  <label>ชื่อคู่ค้า</label>
                  <input type="text" />
                  <label>เบอร์โทรคู่ค้า</label>
                  <input type="text" />
                  <label>ที่อยู่คู่ค้า</label>
                  <textarea rows={4}></textarea>
                  <div className={styles.modalActions}>
                    <button type="submit" className={styles.addBtn}>เพิ่ม</button>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>ยกเลิก</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* แก้ไขข้อมูล */}
          {showEditModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h2>แก้ไขข้อมูลคู่ค้า</h2>
                <form>
                  <label>ชื่อลูกค้า</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} />
                  <label>เบอร์โทรคู่ค้า</label>
                  <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                  <label>ที่อยู่คู่ค้า</label>
                  <textarea rows={4} value={editAddress} onChange={e => setEditAddress(e.target.value)} />
                  <div className={styles.modalActions}>
                    <button type="submit" className={styles.addBtn}>แก้ไข</button>
                    <button type="button" className={styles.cancelBtn} onClick={() => setShowEditModal(false)}>ยกเลิก</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* ลบข้อมูล */}
          {showDeleteModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.deleteModalContent}>
                <div className={styles.deleteModalHeader}>
                  <span style={{ fontSize: "2rem", color: "#222" }}>⚠️</span>
                  <span className={styles.deleteModalTitle}>ลบข้อมูล</span>
                </div>
                <div className={styles.deleteModalBody}>
                  <p>คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลนี้?</p>
                </div>
                <div className={styles.deleteModalActions}>
                  <button className={styles.confirmBtn} onClick={confirmDelete}>ตกลง</button>
                  <button className={styles.cancelBtn} onClick={() => setShowDeleteModal(false)}>ยกเลิก</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
      <div>Supplier</div>
    </MainLayout>
  );
}

export default Suppliers;
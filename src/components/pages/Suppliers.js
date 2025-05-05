import React, { useState, useEffect } from 'react';
import MainLayout from '../layout/MainLayout';
import { useLocation } from 'react-router-dom';
import styles from '../ui/Suppliers.module.css';
import { FaTrash } from 'react-icons/fa';
// import axios from 'axios';

function Suppliers(props) {
  const location = useLocation();
  const user = props.user || location.state?.user || JSON.parse(localStorage.getItem('user'));

  const [suppliers, setSuppliers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [editSupplierId, setEditSupplierId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteIndex, setDeleteIndex] = useState(null);
  const openEditModal = (supplier) => {
    setEditSupplierId(supplier.Supplier_Id);
    setEditName(supplier.Supplier_Name);
    setEditPhone(supplier.Supplier_Tel);
    setEditAddress(supplier.Supplier_Address);
    setShowEditModal(true);
  };

  useEffect(() => {
    fetch('http://localhost:5000/api/suppliers')
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setSuppliers(data);
      })
      .catch(err => {
        console.error('Fetch error:', err);
      });
  }, []);

  const handleAddSupplier = (e) => {
    e.preventDefault();
    console.log('📤 handleAddSupplier called');
    console.log('ส่งข้อมูล:', { newName, newPhone, newAddress });

    const newSupplier = {
      Supplier_Name: newName,
      Supplier_Tel: newPhone,
      Supplier_Address: newAddress
    };

    fetch('http://localhost:5000/api/suppliers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newSupplier)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        setSuppliers([...suppliers, { ...newSupplier, Supplier_Id: data.id }]);
        setShowModal(false);
        setNewName('');
        setNewPhone('');
        setNewAddress('');
      })
      .catch(err => {
        console.error('Error adding supplier:', err);
      });
  };

  const handleEditSupplier = (e) => {
    e.preventDefault();

    const updatedSupplier = {
      Supplier_Name: editName,
      Supplier_Tel: editPhone,
      Supplier_Address: editAddress
    };

    fetch(`http://localhost:5000/api/suppliers/${editSupplierId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSupplier)
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then(data => {
        // อัพเดท state ใน frontend
        const updatedSuppliers = suppliers.map(s =>
          s.Supplier_Id === editSupplierId
            ? { ...s, ...updatedSupplier }
            : s
        );
        setSuppliers(updatedSuppliers);

        // Reset
        setShowEditModal(false);
        setEditSupplierId(null);
        setEditName('');
        setEditPhone('');
        setEditAddress('');
      })
      .catch(err => {
        console.error('Error updating supplier:', err);
      });
  };

  const handleDelete = (index) => {
    setDeleteIndex(index);
    setShowDeleteModal(true);
  };


  const confirmDelete = () => {
    const supplierId = suppliers[deleteIndex].Supplier_Id;
  
    fetch(`http://localhost:5000/api/suppliers/${supplierId}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (!res.ok) throw new Error('ลบไม่สำเร็จ');
        return res.json();
      })
      .then(data => {
        // ลบออกจาก state
        setSuppliers(prev => prev.filter((_, i) => i !== deleteIndex));
        setShowDeleteModal(false);
        setDeleteIndex(null);
      })
      .catch(err => {
        console.error('เกิดข้อผิดพลาดในการลบ:', err);
        alert('ไม่สามารถลบรายการนี้ได้');
      });
  };


  return (
    <MainLayout user={user} title="Supplier">
      <div className={styles.container}>
        {/* ปุ่มฟ้า */}
        <div className={styles.containerbtn}>
          <h1 className="text-2xl font-bold text-gray-800">ข้อมูลคู่ค้า</h1>
          <div className={styles.headerrowbtn}>
            <button className={styles.custombtn} onClick={() => setShowModal(true)}> เพิ่มข้อมูล </button>
          </div>
        </div>

        <div className={styles.tableBox}>

          {/* ตารางข้อมูลคู่ค้า */}
          <table className={styles.table}>

            <thead className={styles.tableHead}>
              <tr className="bg-gray-100">
                <th className={`${styles.thName}`}>ชื่อคู่ค้า</th>
                <th className={`${styles.thAddress}`}>ที่อยู่คู่ค้า</th>
                <th className={`${styles.thPhone}`}>เบอร์โทรคู่ค้า</th>
                <th className={`${styles.thEdit}`}>สถานะ</th>
                <th className={`${styles.thEdit}`}>แก้ไขข้อมูล</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-3">ไม่มีข้อมูล</td></tr>
              ) : (
                suppliers.map((supplier, index) => (
                  <tr key={index} className={styles.tableRow}>
                    <td className="py-3 px-4 border-b">{supplier.Supplier_Name}</td>
                    <td className="py-3 px-4 border-b">{supplier.Supplier_Address}</td>
                    <td className="py-3 px-4 border-b">{supplier.Supplier_Tel}</td>
                    <td className="py-3 px-4 border-b">{supplier.is_Active ? "สั่งซื้อด้วย" : "ไม่สั่งซื้อด้วย"}</td>
                    <td className="py-3 px-4 border-b text-center">
                      <button className={styles.editTextBtn} onClick={() => openEditModal(supplier)}>แก้ไข</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>



          {/*------------------------------------------------- Modal All ------------------------------------------------- */}

          {/* เพิ่มข้อมูล */}
          {showModal && (
            <div className={styles.modalOverlay}>
              <div className={styles.modalContent}>
                <h2>เพิ่มข้อมูลคู่ค้า</h2>
                <form onSubmit={handleAddSupplier}>
                  <label>ชื่อคู่ค้า</label>
                  <input type="text" value={newName} onChange={e => setNewName(e.target.value)} required />

                  {/* ล็อกการกรอกเบอร์ไม่เกิน 10 ตัว */}
                  <label>เบอร์โทรคู่ค้า</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      if (onlyNums.length <= 10) {
                        setNewPhone(onlyNums);
                      }
                    }}
                    placeholder="กรอกเบอร์ไม่เกิน 10 ตัว"
                  />

                  {/*  */}

                  <label>ที่อยู่คู่ค้า</label>
                  <textarea rows={4} value={newAddress} onChange={e => setNewAddress(e.target.value)} required />
                  <div className={styles.modalActions}>
                    <button type="submit" className={styles.confirmBtn}>เพิ่มข้อมูล</button>
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
                <form onSubmit={handleEditSupplier}>
                  <label>ชื่อคู่ค้า</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} required />
                  <label>เบอร์โทรคู่ค้า</label>
                  <input
                    type="text"
                    value={editPhone}
                    onChange={e => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      if (onlyNums.length <= 10) {
                        setEditPhone(onlyNums);
                      }
                    }}
                    placeholder="กรอกเบอร์ไม่เกิน 10 ตัว"
                  />
                  <label>ที่อยู่คู่ค้า</label>
                  <textarea rows={4} value={editAddress} onChange={e => setEditAddress(e.target.value)} required />
                  <div className={styles.modalActions}>
                    <button type="submit" className={styles.addBtn}>บันทึกการแก้ไข</button>
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
          {/*------------------------------------------------- Modal All ------------------------------------------------- */}
        </div>
      </div>

    </MainLayout>
  );
}

export default Suppliers;
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// API สำหรับ login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        return res.status(400).json({ message: 'กรุณากรอก username และ password' });
    }

    const sql = 'SELECT Emp_user, Role, Fname, Lname FROM Employee WHERE Emp_user = ? AND Password = ? AND Emp_Status = "W"';
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
        }
        if (results.length === 0) {
            return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
        }
        
        const user = results[0];
        res.json({
            username: user.Emp_user,
            role: user.Role === 'M' ? 'manager' : 'employee',
            name: user.Fname + ' ' + user.Lname
        });
    });
});

// API สำหรับดึงข้อมูลพนักงานทั้งหมด
app.get('/api/employees', (req, res) => {
    const sql = 'SELECT Emp_Id, Emp_user, Password, Emp_Tel, Fname, Lname, Emp_Address, Role, Emp_Status FROM Employee';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
        }
        res.json(results);
    });
});

// API สำหรับเพิ่มข้อมูลพนักงาน
app.post('/api/employees', (req, res) => {
    const { Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address } = req.body;
    const sql = 'INSERT INTO Employee (Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(sql, [Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
        }
        res.json({ message: 'เพิ่มข้อมูลสำเร็จ', id: result.insertId });
    });
});

// API สำหรับแก้ไขข้อมูลพนักงาน
app.put('/api/employees/:id', (req, res) => {
    const { Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address } = req.body;
    const { id } = req.params;
    console.log('PUT /api/employees/:id', { id, Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address });
    const sql = 'UPDATE Employee SET Emp_user=?, Password=?, Fname=?, Lname=?, Emp_Tel=?, Role=?, Emp_Status=?, Emp_Address=? WHERE Emp_Id=?';
    db.query(sql, [Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address, id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
        }
        console.log('UPDATE result:', result);
        res.json({ message: 'แก้ไขข้อมูลสำเร็จ' });
    });
});

// API สำหรับดึงข้อมูลคู่ค้า
app.get('/api/suppliers', (req, res) => {
    const sql = 'SELECT Supplier_Id, Supplier_Name, Supplier_Tel, Supplier_Address FROM Supplier';
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
        }
        res.json(results);
    });
});

// API สำหรับเพิ่มข้อมูลคู่ค้า
app.post('/api/suppliers', (req, res) => {
    console.log('📥 Data received:', req.body); // << เพิ่มตรงนี้

    const { Supplier_Name, Supplier_Tel, Supplier_Address } = req.body;
    const sql = 'INSERT INTO Supplier (Supplier_Name, Supplier_Tel, Supplier_Address) VALUES (?, ?, ?)';
    db.query(sql, [Supplier_Name, Supplier_Tel, Supplier_Address], (err, result) => {
        if (err) {
            console.error('❌ Database error:', err); // << ดู error ตรงนี้ให้ละเอียด
            return res.status(500).json({ message: 'เกิดข้อผิดพลาดของเซิร์ฟเวอร์' });
        }
        res.json({ message: 'เพิ่มข้อมูลสำเร็จ', id: result.insertId });
    });
});

// API สำหรับแก้ไขข้อมูลคู่ค้า
app.put('/api/suppliers/:id', (req, res) => { 
    const { id } = req.params;
    console.log('PUT request for Supplier with ID:', id);

    // ตรวจสอบว่า Supplier Id มีอยู่ในฐานข้อมูลหรือไม่
    const checkSql = 'SELECT * FROM Supplier WHERE Supplier_Id = ?';
    db.query(checkSql, [id], (err, result) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ message: 'Server error' });
        }
        if (result.length === 0) {
            return res.status(404).json({ message: 'Supplier not found' });
        }

        // ถ้าพบข้อมูล, ทำการอัปเดต
        const { Supplier_Name, Supplier_Tel, Supplier_Address } = req.body;
        const updateSql = 'UPDATE Supplier SET Supplier_Name=?, Supplier_Tel=?, Supplier_Address=? WHERE Supplier_Id=?';
        const values = [Supplier_Name, Supplier_Tel, Supplier_Address, id];

        db.query(updateSql, values, (err, result) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Server error' });
            }

            console.log('Supplier updated:', result);
            res.json({ message: 'Supplier updated successfully' });
        });
    });
});





app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


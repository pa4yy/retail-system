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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

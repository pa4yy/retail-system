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

    const sql = 'SELECT Emp_user, Role, Fname, Lname FROM Employee WHERE Emp_user = ? AND Password = ? AND Emp_Status = 1';
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

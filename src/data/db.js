const mysql = require('mysql2');

const connection = mysql.createConnection({
    host: 'localhost',
    post: '3306',
    user: 'root',
    password: 'a1234',
    database: 'shopease'
});

connection.connect((err) => {
    if (err) {
        console.error('เกิดข้อผิดพลาดในการเชื่อมต่อฐานข้อมูล:', err);
        return;
    }
    console.log('เชื่อมต่อฐานข้อมูลสำเร็จ');
});

module.exports = connection; 
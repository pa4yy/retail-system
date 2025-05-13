const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 5000;

// สำหรับการอัปโหลดรูปภาพเข้า directory
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

app.use(cors());
app.use(bodyParser.json());

// ใช้คำสั่งนี้เพื่อสำหรับการอัปโหลดรูปภาพ
app.use("/uploads", express.static(path.join(__dirname, "../../uploads")));

// API สำหรับ login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "กรุณากรอก username และ password" });
  }

  const sql =
    'SELECT * FROM Employee WHERE Emp_user = ? AND Password = ? AND Emp_Status = "W"';
  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง" });
    }

    const user = results[0];
    res.json({
      Emp_Id: user.Emp_Id,
      Emp_user: user.Emp_user,
      Password: user.Password,
      Role: user.Role === "M" ? "Manager" : "Employee",
      Fname: user.Fname,
      Lname: user.Lname,
      Emp_Tel: user.Emp_Tel,
      Emp_Address: user.Emp_Address,
      Emp_Status: user.Emp_Status === "W" ? "Working" : "Farewell"
    });
  });
});

// API สำหรับดึงข้อมูลพนักงานทั้งหมด
app.get("/api/employees", (req, res) => {
  const sql =
    "SELECT Emp_Id, Emp_user, Password, Emp_Tel, Fname, Lname, Emp_Address, Role, Emp_Status FROM Employee";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
    res.json(results);
  });
});

// API สำหรับเพิ่มข้อมูลพนักงาน
app.post("/api/employees", (req, res) => {
  const {
    Emp_user,
    Password,
    Fname,
    Lname,
    Emp_Tel,
    Role,
    Emp_Status,
    Emp_Address,
  } = req.body;
  const sql =
    "INSERT INTO Employee (Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    sql,
    [Emp_user, Password, Fname, Lname, Emp_Tel, Role, Emp_Status, Emp_Address],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
      }
      res.json({ message: "เพิ่มข้อมูลสำเร็จ", id: result.insertId });
    }
  );
});

// API สำหรับแก้ไขข้อมูลพนักงาน
app.put("/api/employees/:id", (req, res) => {
  const {
    Emp_user,
    Password,
    Fname,
    Lname,
    Emp_Tel,
    Role,
    Emp_Status,
    Emp_Address,
  } = req.body;
  const { id } = req.params;
  console.log("PUT /api/employees/:id", {
    id,
    Emp_user,
    Password,
    Fname,
    Lname,
    Emp_Tel,
    Role,
    Emp_Status,
    Emp_Address,
  });
  const sql =
    "UPDATE Employee SET Emp_user=?, Password=?, Fname=?, Lname=?, Emp_Tel=?, Role=?, Emp_Status=?, Emp_Address=? WHERE Emp_Id=?";
  db.query(
    sql,
    [
      Emp_user,
      Password,
      Fname,
      Lname,
      Emp_Tel,
      Role,
      Emp_Status,
      Emp_Address,
      id,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
      }
      console.log("UPDATE result:", result);
      res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    }
  );
});

// API สำหรับดึงข้อมูลสินค้า
app.get("/api/products", (req, res) => {
  const sql = `
    SELECT 
      p.Product_Id, p.Product_Name, p.Product_Detail, p.Product_Amount, p.Product_Price, p.Product_Minimum,
      p.PType_Id, p.Product_Image,
      t.PType_Name
    FROM Product p
    LEFT JOIN Product_Type t ON p.PType_Id = t.PType_Id
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
    res.json(results);
  });
});

// API สำหรับเพิ่มข้อมูลสินค้า
app.post("/api/products", upload.single("Product_Image"), (req, res) => {
  const {
    Product_Name,
    Product_Detail,
    Product_Amount,
    Product_Price,
    Product_Minimum,
    PType_Id,
  } = req.body;
  let newImage = req.file ? `/uploads/${req.file.filename}` : "";

  const sql = `
    INSERT INTO Product (
      Product_Name, Product_Detail, Product_Amount,
      Product_Price, Product_Minimum, PType_Id, Product_Image
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [
      Product_Name,
      Product_Detail,
      Product_Amount,
      Product_Price,
      Product_Minimum,
      PType_Id,
      newImage,
    ],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });

      res.json({
        Product_Id: result.insertId, // ใช้ id ที่ auto increment
        Product_Name,
        Product_Detail,
        Product_Amount,
        Product_Price,
        Product_Minimum,
        PType_Id,
        Product_Image: newImage,
      });
    }
  );
});

// API สำหรับแก้ไขข้อมูลสินค้า
app.put("/api/products/:id", upload.single("Product_Image"), (req, res) => {
  const productId = req.params.id;
  const {
    Product_Name,
    Product_Detail,
    Product_Amount,
    Product_Price,
    Product_Minimum,
    PType_Id,
  } = req.body;
  let newImage = req.file ? `/uploads/${req.file.filename}` : null;

  db.query(
    "SELECT Product_Image FROM Product WHERE Product_Id = ?",
    [productId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      const oldImage = results[0]?.Product_Image;

      if (
        newImage &&
        oldImage &&
        oldImage !== newImage &&
        !oldImage.includes("noimage")
      ) {
        const oldImagePath = path.join(__dirname, "../../", oldImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("ลบไฟล์เก่าไม่สำเร็จ:", err.message);
        });
      }

      const updateSql = `
        UPDATE Product SET
          Product_Name = ?,
          Product_Detail = ?,
          Product_Amount = ?,
          Product_Price = ?,
          Product_Minimum = ?,
          PType_Id = ?${newImage ? ", Product_Image = ?" : ""}
        WHERE Product_Id = ?
      `;
      const params = [
        Product_Name,
        Product_Detail,
        Product_Amount,
        Product_Price,
        Product_Minimum,
        PType_Id,
      ];
      if (newImage) params.push(newImage);
      params.push(productId);

      db.query(updateSql, params, (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json({ message: "อัปเดตสินค้าเรียบร้อย" });
      });
    }
  );
});


// API สำหรับดึงข้อมูลประเภทสินค้า
app.get("/api/product_types", (req, res) => {
  const sql = "SELECT * FROM Product_Type";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "เกิดข้อผิดพลาดของเซิร์ฟเวอร์" });
    }
    res.json(results);
  });
});

// API สำหรับเพิ่มข้อมูลประเภทสินค้า
app.post("/api/product_types", (req, res) => {
  const { PType_Name } = req.body;

  db.query("SELECT COUNT(*) AS count FROM Product_Type", (err, result) => {
    if(err) return res.status(500).json({ message: "DB error"});

    if(result[0].count === 0) {
      db.query("ALTER TABLE Product_Type AUTO_INCREMENT = 1;", (err) => {
        if (err) return res.status(500).json({ message: "DB error while resetting AUTO_INCREMENT" });

        addPType();
      });
    } else {
      addPType();
    }
  })

  function addPType(){
    db.query(
      "INSERT INTO Product_Type (PType_Name) VALUES (?)",
      [PType_Name],
      (err, result) => {
        if (err) return res.status(500).json({ message: "DB error" });
        res.json({ PType_Id: result.insertId, PType_Name });
      }
    );
  }

});

// API สำหรับแก้ไขข้อมูลประเภทสินค้า
app.put("/api/product_types/:id", (req, res) => {
  const { PType_Name } = req.body;
  db.query(
    "UPDATE Product_Type SET PType_Name=? WHERE PType_Id=?",
    [PType_Name, req.params.id],
    (err, result) => {
      if (err) return res.status(500).json({ message: "DB error" });
      res.json({ message: "แก้ไขประเภทสินค้าเรียบร้อย" });
    }
  );
});

//API สำหรับลบข้อมูลประเภทสินค้า
app.delete("/api/product_types/:id", (req, res) => {
  const typeId = req.params.id;

  db.query(
    "SELECT COUNT(*) AS total FROM Product WHERE PType_Id = ?",
    [typeId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      const count = results[0].total;
      if (count > 0) {
        return res.status(400).json({
          message: "ไม่สามารถลบได้ เนื่องจากมีสินค้าที่ใช้ประเภทนี้อยู่",
        });
      }

      db.query(
        "DELETE FROM Product_Type WHERE PType_Id = ?",
        [typeId],
        (err, result) => {
          if (err) return res.status(500).json({ message: "DB error" });
          res.json({ message: "ลบประเภทสินค้าเรียบร้อย" });
        }
      );
    }
  );
});

// API สำหรับดึงข้อมูลคู่ค้า
app.get('/api/suppliers', (req, res) => {
  const sql = `
    SELECT Supplier_Id, Supplier_Name, Supplier_Tel, Supplier_Address , is_Active
    FROM Supplier   
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
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
    const { Supplier_Name, Supplier_Tel, Supplier_Address, is_Active } = req.body;
    const updateSql = 'UPDATE Supplier SET Supplier_Name=?, Supplier_Tel=?, Supplier_Address=?, is_Active=? WHERE Supplier_Id=?';
    const values = [Supplier_Name, Supplier_Tel, Supplier_Address, is_Active, id];


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

// API บันทึกข้อมูลการขาย
app.post("/api/sale", (req, res) => {
  console.log("POST /api/sale called");
  console.log("req.body:", req.body);

  const { Sale_Date, Emp_Id, Total_Sale_Price, Payment_methods, Products } = req.body;
  console.log(req.body);

  if (!Products || !Array.isArray(Products) || Products.length === 0) {
    return res.status(400).json({ message: "ไม่มีรายการสินค้า" });
  }

  const sql = "INSERT INTO Sales (Sale_Date, Emp_Id, Total_Sale_Price, Payment_medthods) VALUES (?, ?, ?, ?)";
  db.query(sql, [Sale_Date, Emp_Id, Total_Sale_Price, Payment_methods], (err, result) => {
    if (err) {
      console.error("Sale insert error:", err);
      return res.status(500).json({ message: "DB error" });
    }
    const saleId = result.insertId;
    const values = Products.map(p => [
      saleId,
      Number(p.Product_Id),
      Number(p.Sale_Amount)
    ]);
    const detailSql = "INSERT INTO Sales_Detail (Sale_Id, Product_Id, Sale_Amount) VALUES ?";
    db.query(detailSql, [values], (err2) => {
      if (err2) {
        console.error("SaleDetail insert error:", err2);
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ message: "บันทึกการขายสำเร็จ" });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


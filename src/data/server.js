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
      Role: user.Role === "M" ? "manager" : "employee",
      Fname: user.Fname,
      Lname: user.Lname,
      Emp_Tel: user.Emp_Tel,
      Emp_Address: user.Emp_Address,
      Emp_Status: user.Emp_Status === "W" ? "Working" : "Farewell"
    });
  });
});

// API สำหรับบันทึกการเข้าสู่ระบบ
app.post('/api/logs/login', (req, res) => {
  const { Emp_Id } = req.body;
  const Login_Time = new Date(); // เวลาปัจจุบัน

  db.query(
    'INSERT INTO Login_History (Emp_Id, Login_Time) VALUES (?, ?)',
    [Emp_Id, Login_Time],
    (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ message: 'DB error' });
      }
      res.json({ success: true });
    }
  );
});

// API สำหรับบันทึกการออกจากระบบ
app.post('/api/logs/logout', (req, res) => {
  const { Emp_Id } = req.body;
  const now = new Date();

  const sql = `
    UPDATE Login_History
    SET LogOut_Time = ?
    WHERE Emp_Id = ? AND LogOut_Time IS NULL
    AND Login_Time = (
      SELECT t.Login_Time
      FROM (
        SELECT Login_Time
        FROM Login_History
        WHERE Emp_Id = ? AND LogOut_Time IS NULL
        ORDER BY Login_Time DESC
        LIMIT 1
      ) t
    )
  `;
  db.query(sql, [now, Emp_Id, Emp_Id], (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });
    res.json({ message: "Logout logged" });
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
    if (err) return res.status(500).json({ message: "DB error" });

    if (result[0].count === 0) {
      db.query("ALTER TABLE Product_Type AUTO_INCREMENT = 1;", (err) => {
        if (err) return res.status(500).json({ message: "DB error while resetting AUTO_INCREMENT" });

        addPType();
      });
    } else {
      addPType();
    }
  })

  function addPType() {
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

  // ตรวจสอบว่ Supplier Id มีอยู่ในฐานข้อมูลหรือไม่
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
      Number(p.Sale_Amount),
      Number(p.Sale_Price)
    ]);
    const detailSql = "INSERT INTO Sales_Detail (Sale_Id, Product_Id, Sale_Amount, Sale_Price) VALUES ?";
    db.query(detailSql, [values], (err2) => {
      if (err2) {
        console.error("SaleDetail insert error:", err2);
        return res.status(500).json({ message: "DB error" });
      }

      // อัพเดทจำนวนสินค้าหลังจากบันทึกการขาย
      const updatePromises = Products.map(p => {
        return new Promise((resolve, reject) => {
          const updateSql = "UPDATE Product SET Product_Amount = Product_Amount - ? WHERE Product_Id = ?";
          db.query(updateSql, [Number(p.Sale_Amount), Number(p.Product_Id)], (err3) => {
            if (err3) {
              reject(err3);
            } else {
              resolve();
            }
          });
        });
      });

      Promise.all(updatePromises)
        .then(() => {
          res.json({ message: "บันทึกการขายสำเร็จ" });
        })
        .catch(err3 => {
          console.error("Product update error:", err3);
          return res.status(500).json({ message: "DB error" });
        });
    });
  });
});

// API บันทึกข้อมูลสั่งซื้อ
app.post("/api/purchase", (req, res) => {
  console.log("POST /api/purchase called");
  console.log("req.body:", req.body);

  const {
    Purchase_Id,
    Purchase_Date,
    Purchase_Status = '1',
    Total_Purchase_Price,
    Supplier_Id,
    Emp_Id,
    Products
  } = req.body;


  if (!Products || !Array.isArray(Products) || Products.length === 0) {
    return res.status(400).json({ message: "ไม่มีรายการสินค้า" });
  }

  const sql = "INSERT INTO Purchase (Purchase_Id, Purchase_Date, Purchase_Status, Total_Purchase_Price, Supplier_Id, Emp_Id) VALUES (?, ?, ?, ?, ?, ?)";
  db.query(sql, [Purchase_Id, Purchase_Date, Purchase_Status, Total_Purchase_Price, Supplier_Id, Emp_Id], (err, result) => {
    if (err) {
      console.error("Purchase insert error:", err);
      return res.status(500).json({ message: "DB error" });
    }

    const purchaseId = result.insertId;


    const values = Products.map(p => {
      const amount = Number(p.Product_Amount);
      const price = Number(p.Purchase_Price);

      if (isNaN(amount) || isNaN(price)) {
        console.error(`Invalid product data: ${JSON.stringify(p)}`);
        return null; // Or handle it in another way
      }

      return [
        purchaseId,
        Number(p.Product_Id),
        amount,
        price
      ];
    }).filter(Boolean);

    const detailSql = "INSERT INTO Purchase_Detail (Purchase_Id, Product_Id, Purchase_Amout, Purchase_Price) VALUES ?"; //n
    db.query(detailSql, [values], (err2) => {
      if (err2) {
        console.error("PurchaseDetail insert error:", err2);
        return res.status(500).json({ message: "DB error" });
      }
      res.json({ message: "บันทึกการขายสำเร็จ" });
    });
  });
});

// API สำหรับดึงข้อมูลสั่งซื้อ
app.get('/api/purchases', (req, res) => {
  const sql = `
    SELECT 
      p.Purchase_Id,
      p.Purchase_Date,
      CASE 
        WHEN p.Purchase_Status = 'P' THEN 'Purchased'
        WHEN p.Purchase_Status = 'R' THEN 'Received'
        ELSE p.Purchase_Status
      END AS Purchase_Status,
      p.Total_Purchase_Price,
      p.Emp_Id,
      s.Supplier_Name
    FROM Purchase p
    JOIN Supplier s ON p.Supplier_Id = s.Supplier_Id
    ORDER BY 
    CASE p.Purchase_Status 
    WHEN 'P' THEN 0 
    WHEN 'R' THEN 1 
    ELSE 2 
    END,
  p.Purchase_Date DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
    }
    res.json(results);
  });
});


// API สำหรับดึงข้อมูลการขาย พร้อมรายละเอียดสินค้า
app.get('/api/sales', (req, res) => {
  const { startDate, endDate, groupBy } = req.query;
  
  let dateFilter = '';
  let params = [];
  
  if (startDate && endDate) {
    if (groupBy === 'year') {
      dateFilter = 'WHERE YEAR(Sale_Date) BETWEEN ? AND ?';
      params = [startDate, endDate];
    } else if (groupBy === 'month') {
      dateFilter = 'WHERE DATE_FORMAT(Sale_Date, "%Y-%m") BETWEEN ? AND ?';
      params = [startDate, endDate];
    } else {
      dateFilter = 'WHERE Sale_Date BETWEEN ? AND ?';
      params = [startDate, endDate];
    }
  }

  const sqlSales = `
    SELECT * FROM Sales 
    ${dateFilter}
    ORDER BY Sale_Date DESC
  `;

  db.query(sqlSales, params, (err, sales) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
    }

    const saleIds = sales.map(s => s.Sale_Id);
    if (saleIds.length === 0) return res.json([]);

    const sqlDetail = `
      SELECT 
        d.Sale_Id, 
        d.Product_Id, 
        d.Sale_Amount, 
        d.Sale_Price, 
        p.Product_Name,
        t.PType_Name AS Product_Type,
        (
          SELECT pd.Purchase_Price 
          FROM Purchase_Detail pd
          JOIN Purchase pu ON pd.Purchase_Id = pu.Purchase_Id
          WHERE pd.Product_Id = d.Product_Id 
          AND pu.Purchase_Date <= s.Sale_Date
          ORDER BY pu.Purchase_Date DESC
          LIMIT 1
        ) AS Cost
      FROM Sales_Detail d
      LEFT JOIN Product p ON d.Product_Id = p.Product_Id
      LEFT JOIN Product_Type t ON p.PType_Id = t.PType_Id
      LEFT JOIN Sales s ON d.Sale_Id = s.Sale_Id
      WHERE d.Sale_Id IN (?)
    `;

    db.query(sqlDetail, [saleIds], (err2, details) => {
      if (err2) {
        console.error("Database Error:", err2);
        return res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
      }

      const saleMap = {};
      sales.forEach(s => { saleMap[s.Sale_Id] = { ...s, Sale_Detail: [] }; });
      details.forEach(d => {
        if (saleMap[d.Sale_Id]) {
          saleMap[d.Sale_Id].Sale_Detail.push(d);
        }
      });
      res.json(Object.values(saleMap));
    });
  });
});

// API สำหรับดึง Product_Id ของสินค้าที่สั่งซื้อแล้วยังไม่ได้รับ
app.get('/api/pending-purchase-products', (req, res) => {
  const sql = `
    SELECT d.Product_Id
    FROM Purchase p
    JOIN Purchase_Detail d ON p.Purchase_Id = d.Purchase_Id
    WHERE p.Purchase_Status = 'P'
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database Error:", err);
      return res.status(500).json({ message: 'ดึงข้อมูลล้มเหลว' });
    }
    res.json(results.map(r => r.Product_Id));
  });
});

// API สำหรับดึง purchase_detail ของสินค้าที่สั่งซื้อแล้วยังไม่ได้รับ
app.get("/api/purchase-detail/:purchaseId", (req, res) => {
  const { purchaseId } = req.params;
  console.log('Fetching purchase detail for ID:', purchaseId);

  // ตรวจสอบว่ามีข้อมูลในตาราง Purchase หรือไม่
  const checkPurchaseSql = "SELECT * FROM Purchase WHERE Purchase_Id = ?";
  db.query(checkPurchaseSql, [purchaseId], (err, purchaseResults) => {
    if (err) {
      console.error("Error checking purchase:", err);
      return res.status(500).json({ message: "ไม่สามารถตรวจสอบข้อมูลการสั่งซื้อได้" });
    }

    if (purchaseResults.length === 0) {
      return res.status(404).json({ message: "ไม่พบข้อมูลการสั่งซื้อนี้" });
    }

    console.log("Found purchase:", purchaseResults[0]);

    // ตรวจสอบข้อมูลในตาราง Purchase_Detail
    const checkDetailSql = "SELECT * FROM Purchase_Detail WHERE Purchase_Id = ?";
    db.query(checkDetailSql, [purchaseId], (err, detailResults) => {
      if (err) {
        console.error("Error checking purchase details:", err);
        return res.status(500).json({ message: "ไม่สามารถตรวจสอบรายละเอียดการสั่งซื้อได้" });
      }

      console.log("Found purchase details:", detailResults);

      if (detailResults.length === 0) {
        return res.status(404).json({ message: "ไม่พบรายละเอียดการสั่งซื้อนี้" });
      }

      // ถ้าทุกอย่างถูกต้อง ดึงข้อมูลแบบ join
      const sql = `
     SELECT 
        d.Product_Id,
        p.Product_Name,
        p.Product_Detail,
        p.Product_Image,
        d.Purchase_Amout AS Quantity,
        d.Purchase_Price AS Unit_Price,
        (d.Purchase_Amout * d.Purchase_Price) AS Total_Price,
        pu.Emp_Id AS Employee_Id,
        CONCAT(e.Fname, ' ', e.Lname) AS Employee_Name,
        pu.Purchase_Date,
        s.Supplier_Name,
        r.Emp_Id AS Receiver_Id,
        CONCAT(er.Fname, ' ', er.Lname) AS Receiver_Name
      FROM Purchase_Detail d
      LEFT JOIN Product p ON d.Product_Id = p.Product_Id
      LEFT JOIN Purchase pu ON d.Purchase_Id = pu.Purchase_Id
      LEFT JOIN Supplier s ON pu.Supplier_Id = s.Supplier_Id
      LEFT JOIN Employee e ON pu.Emp_Id = e.Emp_Id
      LEFT JOIN Receive r ON pu.Purchase_Id = r.Purchase_Id
      LEFT JOIN Employee er ON r.Emp_Id = er.Emp_Id
      WHERE d.Purchase_Id = ?
  `;

      console.log('Executing final SQL query:', sql);
      console.log('With parameters:', [purchaseId]);

      db.query(sql, [purchaseId], (err, results) => {
        if (err) {
          console.error("Database error details:", err);
          return res.status(500).json({
            message: "ดึงข้อมูลรายการสินค้าไม่สำเร็จ",
            error: err.message,
            sqlMessage: err.sqlMessage
          });
        }

        console.log('Query results:', results);

        if (results.length === 0) {
          return res.status(404).json({ message: "ไม่พบข้อมูลคำสั่งซื้อนี้" });
        }

        const { Employee_Id, Employee_Name, Purchase_Date, Supplier_Name, Receiver_Id, Receiver_Name } = results[0];

        const items = results.map(row => ({
          Product_Id: row.Product_Id,
          Product_Name: row.Product_Name,
          Product_Detail: row.Product_Detail,
          Product_Image: row.Product_Image,
          Quantity: row.Quantity,
          Unit_Price: row.Unit_Price,
          Total_Price: row.Total_Price,
        }));

        const response = {
          Purchase_Id: purchaseId,
          Employee_Id,
          Employee_Name,
          Purchase_Date,
          Supplier_Name,
          Receiver_Id,
          Receiver_Name,
          Items: items
        };

        console.log('Sending response:', response);
        res.json(response);
      });
    });
  });
});

// API สำหรับรับสินค้า
app.post('/api/receives', (req, res) => {
  const { Purchase_Id, Employee_Id } = req.body;
  console.log('Received request to /api/receives:', { Purchase_Id, Employee_Id });

  if (!Purchase_Id || !Employee_Id) {
    console.log('Missing required fields:', { Purchase_Id, Employee_Id });
    return res.status(400).json({ message: 'ข้อมูลไม่ครบถ้วน' });
  }

  // 1. เช็คว่า Receive ซ้ำไหม
  const checkSql = `SELECT 1 FROM Receive WHERE Purchase_Id = ? LIMIT 1`;
  db.query(checkSql, [Purchase_Id], (err, result) => {
    if (err) {
      console.error('Error checking receive record:', err);
      return res.status(500).json({ message: 'ตรวจสอบการรับสินค้าล้มเหลว' });
    }
    if (result.length > 0) {
      return res.status(400).json({ message: 'คำสั่งซื้อนี้รับสินค้าแล้ว' });
    }

    // 2. เช็คข้อมูลการสั่งซื้อ
    const checkPurchaseSql = `
      SELECT p.*, pd.Product_Id, pd.Purchase_Amout, pd.Purchase_Price 
      FROM Purchase p 
      JOIN Purchase_Detail pd ON p.Purchase_Id = pd.Purchase_Id 
      WHERE p.Purchase_Id = ?
    `;
    db.query(checkPurchaseSql, [Purchase_Id], (err, purchaseResults) => {
      if (err) {
        console.error('Error checking purchase details:', err);
        return res.status(500).json({ message: 'ตรวจสอบข้อมูลการสั่งซื้อล้มเหลว' });
      }
      if (purchaseResults.length === 0) {
        return res.status(404).json({ message: 'ไม่พบข้อมูลการสั่งซื้อนี้' });
      }

      // 3. เริ่ม transaction
      db.beginTransaction(err => {
        if (err) {
          console.error('Error starting transaction:', err);
          return res.status(500).json({ message: 'เริ่ม transaction ไม่ได้' });
        }

        const insertReceiveSql = `
          INSERT INTO Receive (Purchase_Id, Receive_Date, Emp_Id)
          VALUES (?, NOW(), ?)
        `;
        db.query(insertReceiveSql, [Purchase_Id, Employee_Id], (err, result) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error inserting receive record:', err);
              res.status(500).json({ message: 'บันทึกการรับสินค้าไม่สำเร็จ' });
            });
          }

          const Receive_Id = result.insertId;
          const insertReceiveDetailSql = `
            INSERT INTO Receive_Detail (Receive_Id, Product_Id, Receive_Amount)
            SELECT ?, Product_Id, Purchase_Amout FROM Purchase_Detail WHERE Purchase_Id = ?
          `;
          db.query(insertReceiveDetailSql, [Receive_Id, Purchase_Id], (err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error inserting receive details:', err);
                res.status(500).json({ message: 'บันทึกรายละเอียดรับสินค้าไม่สำเร็จ' });
              });
            }

            const updateProductStock = (index) => {
              if (index >= purchaseResults.length) {
                const updatePurchaseSql = `
                  UPDATE Purchase SET Purchase_Status = 'R' WHERE Purchase_Id = ?
                `;
                return db.query(updatePurchaseSql, [Purchase_Id], (err) => {
                  if (err) {
                    return db.rollback(() => {
                      console.error('Error updating purchase status:', err);
                      res.status(500).json({ message: 'อัพเดตสถานะคำสั่งซื้อไม่สำเร็จ' });
                    });
                  }

                  db.commit(err => {
                    if (err) {
                      return db.rollback(() => {
                        console.error('Error committing transaction:', err);
                        res.status(500).json({ message: 'commit transaction ไม่สำเร็จ' });
                      });
                    }
                    res.json({ message: 'รับสินค้าและอัพเดตสต็อกเรียบร้อย' });
                  });
                });
              }

              const { Product_Id, Purchase_Amout } = purchaseResults[index];
              const updateProductSql = `
                UPDATE Product SET Product_Amount = Product_Amount + ? WHERE Product_Id = ?
              `;
              db.query(updateProductSql, [Purchase_Amout, Product_Id], (err) => {
                if (err) {
                  return db.rollback(() => {
                    console.error('Error updating product stock:', err);
                    res.status(500).json({ message: 'อัพเดตสต็อกสินค้าไม่สำเร็จ' });
                  });
                }
                updateProductStock(index + 1);
              });
            };

            updateProductStock(0);
          });
        });
      });
    });
  });
});





app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
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
    'SELECT Emp_user, Role, Fname, Lname FROM Employee WHERE Emp_user = ? AND Password = ? AND Emp_Status = "W"';
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
      username: user.Emp_user,
      role: user.Role === "M" ? "manager" : "employee",
      name: user.Fname + " " + user.Lname,
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
  const sql = `SELECT Product_Id, Product_Name, Product_Detail, Product_Amount, Product_Price,Product_Minimum,
           PType_Id, Product_Image FROM Product`;
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

  db.query(
    "SELECT Product_Id FROM Product ORDER BY Product_Id DESC LIMIT 1",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      let newId = "PD001";
      if (results.length > 0) {
        const lastId = results[0].Product_Id;
        const num = parseInt(lastId.replace("PD", "")) + 1;
        newId = "PD" + num.toString().padStart(3, "0");
      }

      const sql = `
          INSERT INTO Product (
            Product_Id, Product_Name, Product_Detail, Product_Amount,
            Product_Price, Product_Minimum, PType_Id, Product_Image
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
      db.query(
        sql,
        [
          newId,
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
            Product_Id: newId,
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

// API สำหรับลบข้อมูลสินค้า
app.delete("/api/products/:id", (req, res) => {
  const productId = req.params.id;
  db.query(
    "SELECT Product_Image FROM Product WHERE Product_Id = ?",
    [productId],
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });
      const oldImage = results[0]?.Product_Image;
      if (oldImage && !oldImage.includes("noimage")) {
        const oldImagePath = path.join(__dirname, "../../", oldImage);
        fs.unlink(oldImagePath, (err) => {
          if (err) console.warn("ลบไฟล์เก่าไม่สำเร็จ:", err.message);
        });
      }
      db.query(
        "DELETE FROM Product WHERE Product_Id = ?",
        [productId],
        (err, result) => {
          if (err) return res.status(500).json({ message: "DB error" });
          res.json({ message: "ลบสินค้าเรียบร้อย" });
        }
      );
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

  db.query(
    "SELECT PType_Id FROM Product_Type ORDER BY PType_Id DESC LIMIT 1",
    (err, results) => {
      if (err) return res.status(500).json({ message: "DB error" });

      let newId = "PT001";
      if (results.length > 0) {
        const lastId = results[0].PType_Id;
        const num = parseInt(lastId.replace("PT", "")) + 1;
        newId = "PT" + num.toString().padStart(3, "0");
      }

      db.query(
        "INSERT INTO Product_Type (PType_Id, PType_Name) VALUES (?, ?)",
        [newId, PType_Name],
        (err, result) => {
          if (err) {
            console.error("Insert error:", err);
            return res.status(500).json({ message: "DB error" });
          }

          res.json({ PType_Id: newId, PType_Name });
        }
      );
    }
  );
});

// API สำหรับแก้ไขข้อมูลปรเภทสินค้า
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

// API สำหรับลบข้อมูลปรเภทสินค้า
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

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

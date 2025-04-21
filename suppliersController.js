// controllers/suppliersController.js
const { poolPromise } = require("../db");

exports.getAllSuppliers = async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query("SELECT * FROM NHACUNGCAP");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.addSupplier = async (req, res) => {
  console.log("🛠️ Dữ liệu nhận được:", req.body); // Kiểm tra dữ liệu nhận được
  const { MaNCC, TenNCC, DiaChi, SDT, Email } = req.body;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("MaNCC", MaNCC)
      .input("TenNCC", TenNCC)
      .input("DiaChi", DiaChi)
      .input("SDT", SDT)
      .input("Email", Email)
      .query("INSERT INTO NHACUNGCAP (MaNCC, TenNCC, DiaChi, SDT, Email) VALUES (@MaNCC, @TenNCC, @DiaChi, @SDT, @Email)");
    res.sendStatus(201);
  } catch (err) {
    console.error("❌ SQL lỗi:", err);
    res.status(500).send(err.message);
  }
};



// Các hàm updateSupplier và deleteSupplier không thay đổi
exports.updateSupplier = async (req, res) => {
  const { TenNCC, DiaChi, SDT } = req.body;
  const id = req.params.id;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("MANCC", id)
      .input("TENNCC", TenNCC)
      .input("DIACHI", DiaChi)
      .input("SDT", SDT)
      .query("UPDATE NHACUNGCAP SET TenNCC = @TenNCC, DiaChi = @DiaChi, SDT = @SDT WHERE MaNCC = @MaNCC");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
};

exports.deleteSupplier = async (req, res) => {
  const id = req.params.id;
  try {
    const pool = await poolPromise;
    await pool.request()
      .input("MaNCC", id)
      .query("DELETE FROM NHACUNGCAP WHERE MaNCC = @MaNCC");
    res.sendStatus(200);
  } catch (err) {
    res.status(500).send(err.message);
  }
};
exports.getSupplierById = async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("MaNCC", id)
      .query("SELECT * FROM NHACUNGCAP WHERE MaNCC = @MaNCC");
    if (result.recordset.length === 0) {
      return res.status(404).send("Không tìm thấy nhà cung cấp");
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
};



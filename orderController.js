const { poolPromise, sql } = require('../db');

module.exports = {
  // Lấy tất cả đơn hàng
  getAllOrders: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM DONHANG");
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi khi lấy đơn hàng:", err);
      res.status(500).send("Lỗi server.");
    }
  },

  // Thêm đơn hàng
// Thêm đơn hàng
addOrder: async (req, res) => {
  const { MADH, NGAYDAT, TRANGTHAIDH, TONGTIEN, items } = req.body;
  const pool = await poolPromise;

  const transaction = new sql.Transaction(pool);
  try {
    await transaction.begin();

    // 1. Thêm đơn hàng
    const request = new sql.Request(transaction);
    await request
      .input('MADH', sql.VarChar, MADH)
      .input('NGAYDAT', sql.Date, NGAYDAT)
      .input('TRANGTHAIDH', sql.NVarChar, TRANGTHAIDH)
      .input('TONGTIEN', sql.Float, TONGTIEN)
      .query("INSERT INTO DONHANG (MADH, NGAYDAT, TRANGTHAIDH, TONGTIEN) VALUES (@MADH, @NGAYDAT, @TRANGTHAIDH, @TONGTIEN)");

    // 2. Thêm từng dòng chi tiết (dùng request mới mỗi lần)
    for (const item of items) {
      const itemRequest = new sql.Request(transaction); // 🔥 Tạo mới request mỗi vòng lặp
      await itemRequest
        .input('MADH', sql.VarChar, MADH)
        .input('MAVT', sql.VarChar, item.materialCode)
        .input('SLXUAT', sql.Int, item.quantity)
        .query(`INSERT INTO CHITIETHOADON (MADH, MAVT, SLXUAT) VALUES (@MADH, @MAVT, @SLXUAT)`);
    }

    await transaction.commit();
    res.status(201).send("✅ Đã thêm đơn hàng kèm chi tiết.");
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Lỗi khi thêm đơn hàng:", err);
    res.status(500).send("Lỗi server.");
  }
},


  // Cập nhật đơn hàng
// Cập nhật đơn hàng
// Cập nhật đơn hàng
updateOrder: async (req, res) => {
  const { id } = req.params;
  const { NGAYDAT, TRANGTHAIDH, TONGTIEN, items } = req.body;

  const pool = await poolPromise;
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();

    // 1. Cập nhật thông tin đơn hàng
    const updateRequest = new sql.Request(transaction);
    await updateRequest
      .input('MADH', sql.VarChar, id)
      .input('NGAYDAT', sql.Date, NGAYDAT)
      .input('TRANGTHAIDH', sql.NVarChar, TRANGTHAIDH)
      .input('TONGTIEN', sql.Float, TONGTIEN)
      .query(`
        UPDATE DONHANG 
        SET NGAYDAT = @NGAYDAT, TRANGTHAIDH = @TRANGTHAIDH, TONGTIEN = @TONGTIEN
        WHERE MADH = @MADH
      `);

    // 2. Xóa chi tiết đơn hàng cũ
    const deleteRequest = new sql.Request(transaction);
    await deleteRequest
      .input('MADH', sql.VarChar, id)
      .query(`DELETE FROM CHITIETHOADON WHERE MADH = @MADH`);

    // 3. Thêm lại các chi tiết mới
    for (const item of items) {
      console.log("🛠️ Đang thêm vật tư:", item);
    
      if (!item.materialCode || isNaN(item.quantity)) {
        console.error("❌ Dữ liệu vật tư không hợp lệ:", item);
        throw new Error("Dữ liệu vật tư không hợp lệ");
      }

      const itemRequest = new sql.Request(transaction); // ✅ mỗi lần tạo mới
      await itemRequest
        .input('MADH', sql.VarChar, id)
        .input('MAVT', sql.VarChar, item.materialCode)
        .input('SLXUAT', sql.Int, item.quantity)
        .query(`
          INSERT INTO CHITIETHOADON (MADH, MAVT, SLXUAT)
          VALUES (@MADH, @MAVT, @SLXUAT)
        `);
    }

    await transaction.commit();
    res.send("✅ Đã cập nhật đơn hàng và chi tiết.");
  } catch (err) {
    await transaction.rollback();
    console.error("❌ Lỗi khi cập nhật đơn hàng:", err.message);
    res.status(500).send("Lỗi server.");
  }
}
,
  

  // Xóa đơn hàng
  deleteOrder: async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await poolPromise;
      await pool.request()
        .input('MADH', sql.VarChar, id)
        .query("DELETE FROM DONHANG WHERE MADH = @MADH");
      res.send("Đã xoá đơn hàng.");
    } catch (err) {
      console.error("Lỗi khi xoá:", err);
      res.status(500).send("Lỗi server.");
    }
  },

  getOrderById:  async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input("MaDH", id)
      .query("SELECT * FROM DONHANG WHERE MaDH = @MaDH");
    if (result.recordset.length === 0) {
      return res.status(404).send("Không tìm thấy đơn hàng");
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).send(err.message);
  }
}};



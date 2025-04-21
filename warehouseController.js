const { poolPromise } = require("../db");
const db = require("../db");
module.exports = {
    // Lấy danh sách kho hàng
    getAllWarehouses: async (req, res) => {
      try {
        const pool = await poolPromise;
        const result = await pool.request().query("SELECT * FROM KHOHANG");
        res.json(result.recordset);  // Trả về dữ liệu kho hàng
      }catch (err) {
        console.error("Lỗi khi lấy kho hàng:", err);
        res.status(500).json({ error: "Lỗi khi lấy kho hàng từ SQL Server" }); // ✅ trả về JSON
      }
      
    },
  
    // Thêm kho hàng
    addWarehouse: async (req, res) => {
      const { MAKH, SOLUONG, VITRI, THOIGIANCN } = req.body;
      try {
        const pool = await poolPromise;
        await pool.request()
          .input('MAKH', db.sql.VarChar, MAKH)
          .input('SOLUONG', db.sql.Int, SOLUONG)
          .input('VITRI', db.sql.NVarChar, VITRI)
          .input('THOIGIANCN', db.sql.DateTime, THOIGIANCN)
          .query("INSERT INTO KHOHANG (MAKH, SOLUONG, VITRI, THOIGIANCN) VALUES (@MAKH, @SOLUONG, @VITRI, @THOIGIANCN)");
        res.status(201).send("Kho hàng đã được thêm.");
      } catch (err) {
        console.error("Lỗi khi thêm kho hàng:", err);
        res.status(500).send("Lỗi khi thêm kho hàng.");
      }
    },
  
    // Cập nhật kho hàng
    updateWarehouse: async (req, res) => {
      const { SOLUONG, VITRI, THOIGIANCN } = req.body;
      const { id } = req.params;  // MAKH
      try {
        const pool = await poolPromise;
        await pool.request()
          .input('SOLUONG', db.sql.Int, SOLUONG)
          .input('VITRI', db.sql.NVarChar, VITRI)
          .input('THOIGIANCN', db.sql.DateTime, THOIGIANCN)
          .input('MAKH', db.sql.VarChar, id)
          .query("UPDATE KHOHANG SET SOLUONG = @SOLUONG, VITRI = @VITRI, THOIGIANCN = @THOIGIANCN WHERE MAKH = @MAKH");
        res.send("Kho hàng đã được cập nhật.");
      } catch (err) {
        console.error("Lỗi khi cập nhật kho hàng:", err);
        res.status(500).send("Lỗi khi cập nhật kho hàng.");
      }
    },
  
    // Xóa kho hàng
    deleteWarehouse: async (req, res) => {
      const { id } = req.params;  // MAKH
      try {
        const pool = await poolPromise;
        await pool.request()
          .input('MAKH', db.sql.VarChar, id)
          .query("DELETE FROM KHOHANG WHERE MAKH = @MAKH");
        res.send("Kho hàng đã được xóa.");
      } catch (err) {
        console.error("Lỗi khi xóa kho hàng:", err);
        res.status(500).send("Lỗi khi xóa kho hàng.");
      }
    },
    getWarehousesById: async (req, res) => {
      const { id } = req.params;  // MAKH
      try {
        const pool = await poolPromise;
        const result = await pool.request()
          .input('MAKH', id)
          .query("SELECT * FROM KHOHANG WHERE MAKH = @MAKH");
        res.json(result.recordset[0]);  // Trả về kho hàng theo ID
      } catch (err) {
        console.error("Lỗi khi lấy kho hàng theo ID:", err);
        res.status(500).send("Lỗi khi lấy kho hàng theo ID.");
      }
    }
    
  };
const db = require("../db");
const { get } = require("../routes/material");
const { poolPromise, sql } = db;

module.exports = {
  // Lấy tất cả vật tư
  getAllMaterials: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query("SELECT * FROM VATTU");
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi khi lấy vật tư:", err);
      res.status(500).json({ error: "Không thể lấy danh sách vật tư." });
    }
  },

  // Thêm vật tư
  addMaterial: async (req, res) => {
    const { MAVT, TENVT, MOTA, DONVI, DONGIA, MANCC, MAKH } = req.body;
    try {
      const pool = await poolPromise;
      await pool.request()
        .input("MAVT", sql.VarChar, MAVT)
        .input("TENVT", sql.NVarChar, TENVT)
        .input("MOTA", sql.NVarChar, MOTA)
        .input("DONVI", sql.NVarChar, DONVI)
        .input("DONGIA", sql.Float, DONGIA)
        .input("MANCC", sql.VarChar, MANCC)
        .input("MAKH", sql.VarChar, MAKH)
        .query(`INSERT INTO VATTU (MAVT, TENVT, MOTA, DONVI, DONGIA, MANCC, MAKH)
                VALUES (@MAVT, @TENVT, @MOTA, @DONVI, @DONGIA, @MANCC, @MAKH)`);
      res.status(201).send("Đã thêm vật tư.");
    } catch (err) {
      console.error("Lỗi khi thêm vật tư:", err);
      res.status(500).json({ error: "Không thể thêm vật tư." });
    }
  },

  // Sửa vật tư
  updateMaterial: async (req, res) => {
    const { id } = req.params;
    const { TENVT, MOTA, DONVI, DONGIA, MANCC, MAKH } = req.body;
    try {
      const pool = await poolPromise;
      await pool.request()
        .input("MAVT", sql.VarChar, id)
        .input("TENVT", sql.NVarChar, TENVT)
        .input("MOTA", sql.NVarChar, MOTA)
        .input("DONVI", sql.NVarChar, DONVI)
        .input("DONGIA", sql.Float, DONGIA)
        .input("MANCC", sql.VarChar, MANCC)
        .input("MAKH", sql.VarChar, MAKH)
        .query(`UPDATE VATTU SET TENVT=@TENVT, MOTA=@MOTA, DONVI=@DONVI, DONGIA=@DONGIA, MANCC=@MANCC, MAKH=@MAKH WHERE MAVT=@MAVT`);
      res.send("Đã cập nhật vật tư.");
    } catch (err) {
      console.error("Lỗi khi cập nhật vật tư:", err);
      res.status(500).json({ error: "Không thể cập nhật vật tư." });
    }
  },

  // Xoá vật tư
  deleteMaterial: async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await poolPromise;
      await pool.request()
        .input("MAVT", sql.VarChar, id)
        .query("DELETE FROM VATTU WHERE MAVT = @MAVT");
      res.send("Đã xoá vật tư.");
    } catch (err) {
      console.error("Lỗi khi xoá vật tư:", err);
      res.status(500).json({ error: "Không thể xoá vật tư." });
    }
  },
  getMaterialById: async (req, res) => {
    const { id } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("MAVT", sql.VarChar, id)
        .query("SELECT * FROM VATTU WHERE MAVT = @MAVT");
      if (result.recordset.length === 0) {
        return res.status(404).send("Không tìm thấy vật tư.");
      }
      res.json(result.recordset[0]);
    } catch (err) {
      console.error("Lỗi khi lấy vật tư:", err);
      res.status(500).json({ error: "Không thể lấy vật tư." });
    }
  },
  // GET /api/warehouse/:makh/materials

    getInventoryValueByWarehouse: async (req, res) => {
      const { makh } = req.params;
    
      try {
        const pool = await poolPromise;
        const result = await pool.request()
          .input("makh", sql.VarChar, makh)
          .query(`
            SELECT MAVT, SOLUONG, DONGIA
            FROM CHITIETKHO
            WHERE MAKH = @makh
          `);
    
        const materials = result.recordset || [];
    
        const totalValue = materials.reduce((sum, mat) => {
          const sl = Number(mat.SOLUONG) || 0;
const dg = Number(mat.DONGIA) || 0;
          return sum + sl * dg;
        }, 0);
    
        res.json({ totalValue, materials });
      } catch (err) {
        console.error("Lỗi khi tính giá trị tồn kho:", err);
        res.status(500).json({ error: "Server error" });
      }
    },
      // GET /api/warehouse
  getWarehouseSummary: async (req, res) => {
    try {
      const pool = await poolPromise;
      const result = await pool.request().query(`
        SELECT 
          C.MAVT,
          V.TENVT,
          V.DONGIA,
          C.MAKH,
          C.SOLUONG,
          K.VITRI
        FROM CHITIETKHO C
        JOIN VATTU V ON C.MAVT = V.MAVT
        JOIN KHOHANG K ON C.MAKH = K.MAKH
      `);

      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi khi lấy dữ liệu kho:", err);
      res.status(500).json({ error: "Không thể lấy dữ liệu kho." });
    }
  },// Trong vattuController.js
  getMaterialsByWarehouse: async (req, res) => {
    const { makh } = req.params;
    try {
      const pool = await poolPromise;
      const result = await pool.request()
        .input("MAKH", sql.VarChar, makh)
        .query(`
          SELECT 
            V.MAVT, 
            V.TENVT, 
            V.DONVI, 
            C.DONGIA,
            C.SOLUONG AS SOLUONGTON,
            C.SOLUONG * C.DONGIA AS GIATRI_TONKHO
          FROM CHITIETKHO C
          JOIN VATTU V ON C.MAVT = V.MAVT
          WHERE C.MAKH = @MAKH AND C.SOLUONG > 0
        `);
      res.json(result.recordset);
    } catch (err) {
      console.error("Lỗi khi lấy vật tư theo kho:", err);
      res.status(500).json({ error: "Không thể lấy vật tư theo kho." });
    }
  }
  
  }    


const express = require("express");
const router = express.Router();
const controller = require("../controllers/orderController");
const { poolPromise } = require("../db");

// ✅ LẤY TẤT CẢ ĐƠN HÀNG
router.get("/", controller.getAllOrders);

// ✅ LẤY CHI TIẾT ĐƠN HÀNG
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;

    const orderResult = await pool.request().query(`
      SELECT * FROM DONHANG WHERE MADH = '${id}'
    `);

    const order = orderResult.recordset[0];

    if (!order) {
      return res.status(404).send("Không tìm thấy đơn hàng");
    }

    const itemsResult = await pool.request().query(`
      SELECT c.MAVT as materialCode, v.TENVT as materialName, v.DONVI, c.SLXUAT as quantity, v.DONGIA as price
      FROM CHITIETHOADON c
      JOIN VATTU v ON c.MAVT = v.MAVT
      WHERE c.MADH = '${id}'
    `);

    order.items = itemsResult.recordset;
    res.json(order);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
});

// ✅ CÁC ROUTE KHÁC
// ✅ LẤY CHI TIẾT ĐƠN HÀNG (có items)
router.get("/detail/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;

    const orderResult = await pool.request().query(`
      SELECT * FROM DONHANG WHERE MADH = '${id}'
    `);

    const order = orderResult.recordset[0];
    if (!order) return res.status(404).send("Không tìm thấy đơn hàng");

    const itemsResult = await pool.request().query(`
      SELECT c.MAVT as materialCode, v.TENVT as materialName, v.DONVI, c.SLXUAT as quantity, v.DONGIA as price
      FROM CHITIETHOADON c
      JOIN VATTU v ON c.MAVT = v.MAVT
      WHERE c.MADH = '${id}'
    `);

    order.items = itemsResult.recordset;
    res.json(order);
  } catch (err) {
    console.error("❌ Lỗi khi lấy chi tiết đơn hàng:", err);
    res.status(500).send("Lỗi máy chủ");
  }
});


router.post("/", controller.addOrder);
router.put("/:id", controller.updateOrder);
router.delete("/:id", controller.deleteOrder);

module.exports = router;

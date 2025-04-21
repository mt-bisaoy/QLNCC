const express = require('express');
const router = express.Router(); // ✅ Bổ sung dòng này
const controller = require('../controllers/warehouseController');

// Lấy danh sách kho hàng
router.get('/', controller.getAllWarehouses);
router.get('/:id', controller.getWarehousesById); // Lấy tất cả kho hàng

// Thêm kho hàng mới
router.post('/', controller.addWarehouse);

// Cập nhật kho hàng
router.put('/:id', controller.updateWarehouse);

// Xóa kho hàng
router.delete('/:id', controller.deleteWarehouse);

module.exports = router;

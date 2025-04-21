const express = require("express");
const router = express.Router();
const controller = require("../controllers/vattuController");
router.get("/warehouse/:makh/value", controller.getInventoryValueByWarehouse);
router.get("/warehouse/:makh/materials", controller.getMaterialsByWarehouse); 

// Lấy vật tư theo kho
router.get("/warehouse", controller.getWarehouseSummary);
router.get("/", controller.getAllMaterials);
router.get("/:id", controller.getMaterialById); // (nếu cần)
router.post("/", controller.addMaterial);
router.put("/:id", controller.updateMaterial);
router.delete("/:id", controller.deleteMaterial);
module.exports = router;
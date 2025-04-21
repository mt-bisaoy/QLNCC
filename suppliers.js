const express = require("express");
const router = express.Router();
const controller = require("../controllers/suppliersController");

router.get("/", controller.getAllSuppliers); // ✅ Quan trọng
router.get("/:id", controller.getSupplierById); // (nếu cần)

router.post("/", controller.addSupplier);
router.put("/:id", controller.updateSupplier);
router.delete("/:id", controller.deleteSupplier);

module.exports = router;

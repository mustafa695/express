const express = require("express");
const multer = require("multer");
const {
  insertProduct,
  getProducts,
  getProductByID,
} = require("../controllers/productController");
const router = express();
// const upload = multer({ dest: "uploads/" });
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/addProduct", upload.array("file"), insertProduct);
router.get("/products", getProducts);
// router.get("/product/upload", upload.array("file"), uploadImages);
router.get("/product/:slug", getProductByID);

module.exports = router;

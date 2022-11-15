const express = require("express");
const { body } = require("express-validator");
const {
  createOrder,
  getOrderByUid,
  testMail,
} = require("../controllers/orderController");

const router = express();

router.post(
  "/create-order",
  [
    body("product_id", "Product id is empty.").isLength({ min: 1 }),
    body("ship_address", "Shipping address cannot be empty.").isLength({
      min: 1,
    }),
    body("user_id", "User Id is empty").isLength({ min: 1 }),
    body("amount", "Amount is empty.").isLength({ min: 1 }),
    body("payment_type", "Please select the payment method").isLength({
      min: 1,
    }),
  ],
  createOrder
);
router.get("/test-mail", testMail);
router.get("/order/:id", getOrderByUid);

module.exports = router;

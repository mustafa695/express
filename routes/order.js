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
    body("product_info", "Product info is empty.").isLength({ min: 1 }),
    body("ship_address", "Shipping address cannot be empty.").isLength({
      min: 1,
    }),
    body("name", "Name epmty").isLength({min: 1}),
    body("email", "Email epmty").isLength({min: 1}),
    body("contact", "Contact epmty").isLength({min: 1}),
    body("billing_address", "billing address epmty").isLength({min: 1}),
    body("country", "country is epmty").isLength({min: 1}),
    body("city", "city is epmty").isLength({min: 1}),

    body("user_id", "User Id is empty").isLength({ min: 1 }),
    body("payment", "Please select the payment method").isLength({
      min: 1,
    }),
  ],
  createOrder
);
router.get("/test-mail", testMail);
router.get("/order/:id", getOrderByUid);

module.exports = router;

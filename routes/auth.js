const express = require("express");
const router = express();

const {
  signup,
  signin,
  authenticaeToken,
} = require("../controllers/authController");

router.post("/signUp", signup);
router.post("/signIn", signin);
router.get("/test", authenticaeToken, (req, res) => {
  res.send("Welcome buddy.....!");
});

module.exports = router;

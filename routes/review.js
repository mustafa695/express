const express = require("express");
const { insertReview, getReview } = require("../controllers/reviewController");

const router = express();

router.post("/addReview", insertReview);
router.get("/review/:id", getReview);

module.exports = router;

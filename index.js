require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const signupRoutes = require("./routes/auth");
const productRoutes = require("./routes/product");
const reviewRoutes = require("./routes/review");
const orderRoutes = require("./routes/order");

var path = require("path");
const conn = require("./connection");

var pathname = path.resolve(__dirname, "./public");

app.use(express.static(pathname));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

//create connection..

conn.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected with App...");
});

//routes

app.use("/api", signupRoutes);
app.use("/api", productRoutes);
app.use("/api", reviewRoutes);
app.use("/api", orderRoutes);

// Server listening

app.listen(3000, () => {
  console.log("Server started on port 3000...");
});

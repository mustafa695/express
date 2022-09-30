require('dotenv').config()

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const mysql = require("mysql");
const multer = require("multer");
const jwt = require("jsonwebtoken");

var path = require("path");

var pathname = path.resolve(__dirname, "./public");

app.use(express.static(pathname));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));

const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "express",
});

conn.connect((err) => {
  if (err) throw err;
  console.log("Mysql Connected with App...");
});

app.post("/api/login", (req, res) => {
  let user = req.body;
  let sql = "INSERT INTO register (username, email, password) VALUES (?, ?, ?)";
  conn.query(
    sql,
    [user.username, user.email, user.password],
    (err, results) => {
      if (err) throw err;
      
      let _email = { email: user.email };
      let accessToken = jwt.sign(_email, process.env.ACCESS_TOKEN_SECRET);
      res.send(
        JSON.stringify({
          accessToken: accessToken,
          msg: "Login Successfuly",
        })
      );
    }
  );
});

//get all users

app.get("/api/users", (req, res) => {
  let sqlQuery = "SELECT * FROM users";
  conn.query(sqlQuery, (err, results) => {
    if (err) throw err;
    res.send(apiResponse(results));
  });
});

// add a new user

app.post("/api/addUser", (req, res) => {
  let user = req.body;

  let sql = "INSERT INTO users (name, email, phone) VALUES(?,?,?)";
  conn.query(sql, [user.name, user.email, user.phone], (err, results) => {
    if (err) throw err;
    res.send(apiResponse(results));
  });
});

// get user by id

app.get("/api/user/:id", (req, res) => {
  let sql = "SELECT * FROM users WHERE id=" + req.params.id;
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(apiResponse(results));
  });
});

// update a user

app.patch("/api/updateUser/:id", (req, res) => {
  let user = req.body;
  console.log(user.name, user.email);
  let sql =
    "UPDATE users SET name='" +
    user.name +
    "', email='" +
    user.email +
    "', phone='" +
    user.phone +
    "' WHERE id=" +
    req.params.id;
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send("User Update Successfully");
  });
});

// delete user

app.delete("/api/userDelete/:id", (req, res) => {
  let sql = "DELETE FROM users WHERE id=" + req.params.id;
  conn.query(sql, (err, results) => {
    if (err) throw err;
    res.send(
      JSON.stringify({
        status: 200,
        msg: "User Deleted Successfully",
      })
    );
  });
});

//file profile add
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix =
      Date.now() + "-" + Math.round(Math.random() * 1e9) + ".png";
    cb(null, file.fieldname + "-" + uniqueSuffix);
  },
});

const upload = multer({ storage: storage });

app.post("/api/file-upload", upload.single("file"), function (req, res) {
  let sql = "INSERT INTO profile (avatar) VALUES (?)";
  conn.query(sql, [req.file.filename], (err, results) => {
    if (err) throw err;
    res.send(JSON.stringify(req.file));
  });
});

//get profile
app.get("/api/profile", (req, res) => {
  let sql = "SELECT * FROM profile";
  conn.query(sql, (err, results) => {
    if (err) throw err;
    let obj = {
      src: pathname + "/" + "images" + "/" + "file-1658500274390-829280665.png",
    };
    res.send(JSON.stringify(obj));
  });
});

//pagination

app.get("/api/paginate", (req, res) => {
  let offset = (req.query.page - 1) * req.query.limit + 1;

  let sql = `SELECT * FROM users ORDER BY name LIMIT ${req.query.page} OFFSET ${offset}`;
  conn.query(sql, (err, results) => {
    if (err) throw err;
    // apiResponse(results);
    res.send(JSON.stringify(results));
  });
});

//register user

function apiResponse(results) {
  return JSON.stringify({ status: 200, error: null, response: results });
}

// Server listening

app.listen(3000, () => {
  console.log("Server started on port 3000...");
});

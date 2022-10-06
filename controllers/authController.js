const conn = require("../connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//user signup

const signup = async (req, res) => {
  let user = req.body;
  let password = await bcrypt.hash(user.password, 10);
  //check email exists
  conn.query(
    "SELECT * FROM users WHERE email = ?",
    [user.email],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0) {
        res.send("Email already exists");
      } else {
        let sql = "INSERT INTO users (name, email, password) VALUES(?,?,?)";
        conn.query(sql, [user.name, user.email, password], (err, results) => {
          if (err) throw err;
          res.send("User signup successfully");
        });
      }
    }
  );
};

//user signin

const signin = async (req, res) => {
  let data = req.body;
  conn.query(
    "SELECT * FROM users WHERE email = ?",
    [data.email],
    async (err, results) => {
      if (err) throw err;

      if (results.length) {
        let accessToken = jwt.sign(
          {email: data.email},
          process.env.ACCESS_TOKEN_SECRET,
          {
            expiresIn: "1d",
          }
        );

        conn.query(
          "UPDATE users SET token = ? WHERE email = ?",
          [accessToken, data.email],
          async (error, resp) => {
            if (error) throw error;
            let comparePassword = await bcrypt.compareSync(
              data.password,
              results[0].password
            );
            if (comparePassword) {
              res.send({
                message: "User login successfully.",
                token: accessToken,
              });
            }
            res.send("Password incorrect!");
          }
        );
      } else {
        res.send("Invalid Credentials");
      }
    }
  );
};

function authenticaeToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

module.exports = {
  signup,
  signin,
  authenticaeToken,
};

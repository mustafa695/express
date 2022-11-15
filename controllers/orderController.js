const {validationResult } = require("express-validator");
const conn = require("../connection");
const { sendEmail } = require("../helpers/sendEmail");

const createOrder = (req, res) => {
  let data = req.body;
  console.log(data.product_id, "====");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const date = new Date();
  const currentDate = date.toISOString();
  const sql =
    "INSERT INTO orders (product_id, user_id, amount, ship_address,	status, payment_type, created_at) VALUES (?,?,?,?,?,?,?)";
  conn.query(
    sql,
    [
      data.product_id,
      data.user_id,
      data.amount,
      data.ship_address,
      0,
      data.payment_type == 0 ? "Cash on delivery" : "Stripe",
      currentDate,
    ],
    async (err, result) => {
      if (err) throw err;
      let userEmail = "amustufa37@gmail.com";
      let subject = "Order placed";
      let body = "Dudes, we really need your money.";

      const emailSent = await sendEmail(userEmail, subject, body);

      if (emailSent.accepted) {
        res.status(200).json({
          msg: "Order submit successfully.",
          mailmsg: "Invoice has been sent to your email address.",
        });
      } else {
        res.status(400).json({
          msg: "Something went wrong!.",
        });
      }
    }
  );
  
};

const getOrderByUid = (req, res) => {
  conn.query(
    "SELECT * FROM ((orders INNER JOIN users ON orders.user_id = ?) INNER JOIN products ON orders.product_id = products.id)",
    [req.params.id],
    (err, result) => {
      if (err) throw err;
      res.send(result);
    }
  );
};

const testMail = async (req, res) => {
 
  let userEmail = "amustufa37@gmail.com";
  let subject = "Order placed";
  let body = "Dudes, we really need your money.";

  const emailSent = await sendEmail(userEmail, subject, body);
  res.send(emailSent);
};

module.exports = {
  createOrder,
  getOrderByUid,
  testMail,
};

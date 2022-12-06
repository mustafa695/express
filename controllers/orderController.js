const { validationResult } = require("express-validator");
const { callbackPromise } = require("nodemailer/lib/shared");
const conn = require("../connection");
const { sendEmail } = require("../helpers/sendEmail");

// function gettingProdutcs(id, result) {
//   let sql = "SELECT * FROM products WHERE id=" + id;
//   return new Promise(function (resolve, reject) {
//     conn.query(sql, (err, products) => {
//       if (err) reject(err);
//       console.log({ result }, "---products");
//       result.products = products;
//       resolve(result);
//     });
//   });
// }

const date = new Date();
const currentDate = date.toISOString();

async function productsGet(data) {
  const sql =
    "INSERT INTO orders (product_id, user_id, price, quantity, created_at) VALUES (?,?,?,?,?)";
  let prom = [];
  let cost = 0;
  for (let i = 0; i < data.product_info.length; i++) {
    cost = cost + data.product_info[i].price * data.product_info[i].quantity;
    conn.query(
      sql,
      [
        data.product_info[i].id,
        data.user_id,
        data.product_info[i].price,
        data.product_info[i].quantity,
        currentDate,
      ],
      async (err, result) => {
        if (err) throw err;
        let sql = "SELECT * FROM products WHERE id=" + data.product_info[i].id;
        conn.query(sql, (errs, products) => {
          if (errs) throw errs;
          // let prod = [...products]
          products[0].buyQunat = data.product_info[i].quantity;
          prom.push(products[0]);
        });
      }
    );
  }

  if (data.product_info.length) {
    return new Promise(function (res, err) {
      setTimeout(() => {
        let result = [...prom];
        result.totalCost = cost;
        // result.quantity = data.product_info[i].quantity;
        res(result);
      }, data.product_info.length * 500);
    });
    // return p;
  }
}

const createOrder = async (req, res) => {
  let data = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const product = await productsGet(data);
  
  let ordId;
 
  //creating order#
  conn.query(
    "SELECT id FROM product_orders ORDER BY id DESC LIMIT 1",
    (err, result) => {
      if (err) throw err;
      if (result.length) {
        ordId = +result[0].id + +result.length;
      } else {
        ordId = 1;
      }
      console.log({ ordId });

      // *****************************************************************
      //post a order

      let sql =
        "INSERT INTO product_orders (name, email, contact, ship_address, billing_address, country, city, ord_number, amount, payment, status, date) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)";
      conn.query(
        sql,
        [
          data.name,
          data.email,
          data.contact,
          data.ship_address,
          data.billing_address,
          data.country,
          data.city,
          ordId,
          product.totalCost || 0,
          data.payment == 0 ? "Cash on delivery" : "Stripe",
          0,
          currentDate,
        ],
        async (err, results) => {
          if (err) throw err;
          //send email to a user
          let userEmail = "amustufa37@gmail.com";
          let subject = "Order placed";
          // let body = "Dudes, we really need your money.";
          try {
            const emailSent = await sendEmail(
              data.name,
              userEmail,
              data.contact,
              data.billing_address,
              data.ship_address,
              data.country,
              data.city,
              subject,
              ordId,
              product,
              product.totalCost
            );

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
          } catch (error) {
            res.send(error);
            console.log(error);
          }
        }
      );
    }
  );
};

//get order from user id
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

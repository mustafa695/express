const conn = require("../connection");

//add reivew
const insertReview = (req, res) => {
  const data = req.body;
  let date = new Date();
  let created_at = date.toISOString();
  let sql =
    "INSERT INTO reviews (comment, created_at, stars, userId, productId) VALUES (?, ?, ?, ?, ?)";

  conn.query(
    sql,
    [data.comment, created_at, data.stars, data.userId, data.productId],
    (err, resS) => {
      if (err) throw err;
      //count
      conn.query(
        "SELECT COUNT(id) as 'count' FROM reviews WHERE productId = ?",
        [data.productId],
        (err, revRes) => {
          if (err) throw err;

          //getting product data
          conn.query(
            "SELECT id, rating FROM products WHERE id = ?",
            [data.productId],
            (err, productRes) => {
              if (err) throw err;
              let ratingAvg = +productRes[0].rating + +data.stars;

              // rating calculate....

              // let ratingTotal = ratingAvg / revRes[0].count;
              // let rating = ratingTotal.toFixed(1);

              conn.query(
                "UPDATE products SET rating = ? WHERE id = ?",
                [ratingAvg, data.productId],
                (err, result) => {
                  if (err) throw err;
                  res.json({
                    message: "Review submit successfully",
                  });
                }
              );
            }
          );
          //end count
        }
      );
    }
  );
};

//one user review data
const getReview = (req, res) => {
  let sql = "SELECT * FROM reviews WHERE userId = ?";
  conn.query(sql, [req.params.id], (err, result) => {
    if (err) throw err;
    res.json({
      data: result,
    });
  });
};

module.exports = {
  insertReview,
  getReview,
};

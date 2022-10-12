const conn = require("../connection");
var admin = require("firebase-admin");

var serviceAccount = require("../config/key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "gs://node-ecommerce-9827a.appspot.com",
});

//insert product
const insertProduct = async (req, res) => {
  let data = req.body;
  let title = req.body.name;
  let slug = title.replace(/\s+/g, "-").toLowerCase();
  conn.query(
    "SELECT * FROM products WHERE name = ?",
    [data.name],
    (err, response) => {
      if (err) throw err;
      if (response.length > 0) {
        return res.send("Title should be unique for slug.");
      } else {
        let sql =
          "INSERT INTO products (name, slug, description, rating, category, price, quantity) VALUES (?,?,?,?,?,?,?)";
        conn.query(
          sql,
          [
            data.name,
            slug,
            data.description,
            data.rating,
            data.category,
            data.price,
            data.quantity,
          ],
          async (error, result) => {
            if (error) throw error;

            console.log(req.files.length);
            let urls = [];
            for (let j = 0; j < req.files.length; j++) {
              try {
                const bucket = await admin
                  .storage()
                  .bucket()
                  .file(req.files[j].originalname);
                await bucket.createWriteStream().end(req.files[j].buffer);
                const signedURLconfig = {
                  action: "read",
                  expires: "01-01-2030",
                };
                const url = await bucket.getSignedUrl(signedURLconfig);
                conn.query(
                  "INSERT INTO gallery (images, p_id) VALUES (?,?)",
                  [url, result.insertId],
                  (err, response) => {
                    if (err) throw err;
                  }
                );

                urls.push(url);
              } catch (error) {
                console.log(error);
              }
            }

            Promise.all(urls)
              .then((data) => {
                res.json({ message: "Product created." });
              })
              .catch((err) => {
                throw err;
              });
          }
        );
      }
    }
  );
};

function getGalleryData(data) {
  let sql = "SELECT id, images FROM gallery WHERE p_id =" + data?.id;
  return new Promise(function (resolve, reject) {
    conn.query(sql, (err, images) => {
      if (err) reject(err);
      data.images = images;
      resolve(data);
    });
  });
}

//get products

// query : http://localhost:3000/api/products?page=1&&limit=10

const getProducts = async (req, res) => {
  let offset = (req.query.page - 1) * req.query.limit + 1;
  
  let sql = `SELECT * FROM products ORDER BY name LIMIT ${
    req.query.limit
  } OFFSET ${req.query.page == 1 ? 0 : offset}`;
  conn.query(sql, async (err, result) => {
    if (err) throw err;
    if (result?.length) {
      let prom = [];
      for (let i = 0; i < result?.length; i++) {
        prom.push(getGalleryData(result[i]));
      }
      Promise.all(prom)
        .then((data) => {
          res.send(data);
        })
        .catch((err) => {
          throw err;
        });
    }
  });
};

//get product by slug

const getProductByID = (req, res) => {
  let sql = "SELECT * FROM products WHERE slug = ?";
  conn.query(sql, [req.params.slug], (error, result) => {
    if (error) throw error;
    if (result?.length) {
      //update views
      let view = result[0]?.views == null ? 0 : result[0]?.views;
      let views = view + 1;
      conn.query(
        "UPDATE products SET views = ? WHERE id = ?",
        [views, result[0]?.id],
        (err, final) => {
          if (err) throw err;
          conn.query(
            "SELECT images, id FROM gallery WHERE p_id=" + result[0]?.id,
            (err, resp) => {
              if (err) throw err;
              result[0].images = resp;
              res.send(result);
            }
          );
        }
      );
    } else {
      res.send("No data found.");
    }
  });
};

// const uploadImages = async (req, res) => {
//   console.log(req.files.length);
//   let urls = [];
//   for (let j = 0; j < req.files.length; j++) {
//     try {
//       const bucket = await admin.storage().bucket().file(req.files[j].originalname);
//       await bucket.createWriteStream().end(req.files[j].buffer);
//       const signedURLconfig = { action: "read", expires: "01-01-2030" };
//       const url = await bucket.getSignedUrl(signedURLconfig);
//       urls.push(url);
//     } catch (error) {
//       console.log(error);
//     }
//   }
//   console.log(urls,"===============urls array");
//   res.send("kk");
// };

// recent products
// related products
// popular products

module.exports = {
  insertProduct,
  getProducts,
  getProductByID,
};

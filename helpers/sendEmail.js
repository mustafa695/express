const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");

function sendEmail(
  name,
  user,
  contact,
  billing_address,
  ship_address,
  country,
  city,
  subject,
  ordId,
  product,
  total
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD, // naturally, replace both with your real credentials or an application-specific password
    },
  });

  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
  };

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: user,
    subject: subject,
    template: "email",
    context: {
      name: name, // replace {{name}} with Adebola
      company: "MA Inc.",
      ordId: ordId,
      product: product,
      total: total,
      contact: contact,
      billing_address: billing_address,
      ship_address: ship_address,
      email: user,
      country: country,
      city: city
    },
    // text: body,
  };

  return transporter.sendMail(mailOptions);
  //     , function (error, info) {
  //     if (error) {
  //       console.log(error);
  //     } else {
  //       console.log("Email sent: " + info.response);
  //       return true;
  //     }
  //   });
}

module.exports = {
  sendEmail,
};

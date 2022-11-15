const nodemailer = require("nodemailer");

function sendEmail(user, subject, body) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD, // naturally, replace both with your real credentials or an application-specific password
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: user,
    subject: subject,
    text: body,
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

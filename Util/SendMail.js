const nodemailer = require("nodemailer");
const { Templates } = require("./Template");
const config = require("../Config/local");

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "robot@mollatech.com", // generated ethereal user
    pass: "robot!@#$", // generated ethereal password
  },
});

const sendMail = async (data) => {
  const {subject,message} = Templates(data);
  const info = await transporter.sendMail({
    from: '"BlueBricks Passwordless" <noreply@mollatech.com>',
    to: data.sendTo,
    subject: subject,
   html: message
  });

  return info;
};

module.exports = { sendMail };

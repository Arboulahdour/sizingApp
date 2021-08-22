const nodemailer = require("nodemailer");

var smtpTransport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "adexcloud00@gmail.com",
    pass: "ertyuiop12345",
  },
});

module.exports.sendResetEmail = async (email, token) => {
   // change first part to your domain
  var url = "http://localhost:8000/user/reset-password?token=" + token;

  await smtpTransport.sendMail({
    from: "noreply@adexcloud.dz",
    to: email,
    subject: "RESET YOUR PASSWORD",
    text: `Cliquer sur ce mien pour réinitialiser le mot de passe ${url}`,
    html: `<h3> Cliquer sur ce mien pour réinitialiser le mot de passe : ${url} </h3>`,
  });
};

module.exports.sendVerifyEmail = async (email, token) => {
  // change first part to your domain
  var url = "http://localhost:8000/user/verifyemail?token=" + token;

  await smtpTransport.sendMail({
    from: "ar.boulahdour@gmail.com",
    to: email,
    subject: "VERIFY YOUR EMAIL",
    text: `Cliquer sur ce lien pour se verifer ${url}`,
    html: `<h3> Cliquer sur ce lien pour verifer votre email : ${url} </h3>`,
  });
};

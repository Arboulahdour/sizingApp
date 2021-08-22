const router = require("express").Router();
const { 
    sendVerificationEmail,
    verifyEmail,
    getForgotPassword,
    postForgotPassword,
    getResetPassword,
    postResetPassword,
  } = require("../controllers/accountControllers");

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "SVP, connecter pour continuer !");
        res.redirect('/login');
    }
}

// SEND VERIFICATION EMAIL

router.get("/user/send-verification-email", checkAuth, sendVerificationEmail);

// VERIFY EMAIL

router.get("/user/verifyemail", verifyEmail);

// USER FORGOT PASSWORD GET

router.get("/user/forgot-password", getForgotPassword);

// USER FORGOT PASSWORD POST

router.post("/user/forgot-password", postForgotPassword);

// USER RESET PASSWORD GET

router.get("/user/reset-password", getResetPassword);

// USER RESET PASSWORD POST

router.post("/user/reset-password", postResetPassword);

module.exports = router;
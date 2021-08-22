const crypto = require('crypto');
const resetToken = require('../models/resetTokens');
const user = require('../models/User');
const Offer = require('../models/Offer');
const mailer = require('./sendMail');
const bcryptjs = require('bcryptjs');

// only authenticated users can send emails
exports.sendVerificationEmail = async (req, res) => {
    // check if user is google or already verified
    if (req.user.isVerified) {
        // already verified or google user
        // since we won't show any such option in the UI 
        // most probably this is being called by mistake or can be an attack
        // simply redirect to profile 
        res.redirect('/dashboard');
    } else {
        // generate a token 
        var token = crypto.randomBytes(32).toString('hex');
        // add that to database
        await resetToken({ token: token, email: req.user.email }).save();
        // send an email for verification
        mailer.sendVerifyEmail(req.user.email, token);
        const offers = await Offer.find({}).lean()
        res.render('dashboard', { username: req.user.username, verified: req.user.isVerified, emailsent: true, offers : offers });
    }
};

exports.verifyEmail = async (req, res) => {
    // grab the token
    const token = req.query.token;
    // check if token exists 
    // or just send an error
    if (token) {
        var check = await resetToken.findOne({ token: token });
        if (check) {
            // token verified
            // set the property of verified to true for the user
            var userData = await user.findOne({ email: check.email });
            userData.isVerified = true;
            await userData.save();
            // delete the token now itself
            await resetToken.findOneAndDelete({ token: token });
            res.redirect('/dashboard');
        } else {
            res.render('dashboard', { username: req.user.username, verified: req.user.isVerified, err: "Token invalide ou expiré, réessayer." });
        }
    } else {
        // doesnt have a token
        // I will simply redirect to dashboard
        res.redirect('/dashboard');
    }
};

exports.getForgotPassword = async (req, res) => {
    // render reset password page 
    // not checking if user is authenticated 
    // so that you can use as an option to change password too
    res.render('forgot-password.ejs', { csrfToken: req.csrfToken() });

};

exports.postForgotPassword =  async (req, res) => {
    const { email } = req.body;
    // not checking if the field is empty or not 
    // check if a user existss with this email
    var userData = await user.findOne({ email: email });
    console.log(userData);
    if (userData) {        
        // user exists and is not with google
        // generate token
        var token = crypto.randomBytes(32).toString('hex');
        // add that to database
        await resetToken({ token: token, email: email }).save();
        // send an email for verification
        mailer.sendResetEmail(email, token);

        res.render('forgot-password.ejs', { csrfToken: req.csrfToken(), msg: "Réinitialisation d'email envoyée. Vérifer votre boite pour plus d'infos.", type: 'success' });
    } else {
        res.render('forgot-password.ejs', { csrfToken: req.csrfToken(), msg: "Aucun utilisateur avec cet email est trouvé.", type: 'danger' });

    }
};

exports.getResetPassword = async (req, res) => {
    // do as in user verify , first check for a valid token 
    // and if the token is valid send the forgot password page to show the option to change password 

    const token = req.query.token;
    if (token) {
        var check = await resetToken.findOne({ token: token });
        if (check) {
            // token verified
            // send forgot-password page with reset to true
            // this will render the form to reset password
            // sending token too to grab email later
            res.render('forgot-password.ejs', { csrfToken: req.csrfToken(), reset: true, email: check.email });
        } else {
            res.render('forgot-password.ejs', { csrfToken: req.csrfToken(), msg: "Token Trafiqué or Expiré.", type: 'danger' });
        }
    } else {
        // doesnt have a token
        // I will simply redirect to dashboard
        res.redirect('/login');
    }

};

exports.postResetPassword = async (req, res) => {
    // get passwords
    const { password, password2, email } = req.body;
    console.log(password);
    console.log(password2);
    if (!password || !password2 || (password2 != password)) {
        res.render('forgot-password.ejs', { csrfToken: req.csrfToken(), reset: true, err: "Mot de passe ne correspond pas !", email: email });
    } else {
        // encrypt the password
        var salt = await bcryptjs.genSalt(12);
        if (salt) {
            var hash = await bcryptjs.hash(password, salt);
            await user.findOneAndUpdate({ email: email }, { $set: { password: hash } });
            res.redirect('/login');
        } else {
            res.render('forgot-password.ejs', { csrfToken: req.csrfToken(), reset: true, err: "Erreur unattendu, réessayer", email: email });

        }
    }
};
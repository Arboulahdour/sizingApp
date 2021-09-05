const express = require('express');
const router = express.Router();
const user = require('../models/User');
const Offer = require("../models/Offer");
const bcryptjs = require('bcryptjs');
const passport = require('passport');
require('../controllers/passportLocal')(passport);
const userRoutes = require('./accountRoutes');

function checkAuth(req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        next();
    } else {
        req.flash('error_messages', "SVP, connecter pour continuer !");
        res.redirect('/login');
    }
}

router.get('/', (req, res) => {
    if (req.isAuthenticated()) {
        res.render("index", { logged: true });
    } else {
        res.render("index", { logged: false });
    }
});

router.get('/login', (req, res) => {
    res.render("login", { csrfToken: req.csrfToken() });
});

router.get('/signup', (req, res) => {
    res.render("signup", { csrfToken: req.csrfToken() });
});

router.post('/signup', (req, res) => {
    // get all the values 
    const { email, username, password, confirmpassword } = req.body;
    // check if they are empty 
    if (!email || !username || !password || !confirmpassword) {
        res.render("signup", { err: "Tous les champs sont obligatoires !", csrfToken: req.csrfToken() });
    } else if (password != confirmpassword) {
        res.render("signup", { err: "Mot de passe ne correspond pas !", csrfToken: req.csrfToken() });
    } else {

        // validate email and username and password 
        // skipping validation
        // check if a user exists
        user.findOne({ $or: [{ email: email }, { username: username }] }, function (err, data) {
            if (err) throw err;
            if (data) {
                res.render("signup", { err: "Cet utilisateur est déja créé, essayer de connecter !", csrfToken: req.csrfToken() });
            } else {
                // generate a salt
                bcryptjs.genSalt(12, (err, salt) => {
                    if (err) throw err;
                    // hash the password
                    bcryptjs.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        // save user in db
                        user({
                            username: username,
                            email: email,
                            password: hash,
                            googleId: null,
                            provider: 'email',
                        }).save((err, data) => {
                            if (err) throw err;
                            // login the user
                            // use req.login
                            // redirect , if you don't want to login
                            res.redirect('/login');
                        });
                    })
                });
            }
        });
    }
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/dashboard',
        failureFlash: true,
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

router.get('/dashboard', checkAuth, async (req, res) => {
    // quering offers and adding a new parameter for checking verification
    const offers = await Offer.find({}).lean()
    // console.log(offers)
    res.render('dashboard', { username: req.user.username, verified : req.user.isVerified, offers : offers });
});

router.get('/vps-offer-gen', async (req, res) => {
    // quering offers and adding a new parameter for checking verification
    res.render('vps-offer-gen', { email: "ar.boulahdour@outlook.com" }); // , { email: req.user.email }
});

router.get('/zimbra-offer-gen', checkAuth, async (req, res) => {
    // quering offers and adding a new parameter for checking verification
    res.render('zimbra-offer-gen', { email: req.user.email });
});

router.get('/web-offer-gen', checkAuth, async (req, res) => {
    // quering offers and adding a new parameter for checking verification
    res.render('web-offer-gen', { email: req.user.email });
});

router.get('/eboutik-offer-gen', checkAuth, async (req, res) => {
    // quering offers and adding a new parameter for checking verification
    res.render('eboutik-offer-gen', { email: req.user.email });
});

router.get('/web-email-offer-gen', checkAuth, async (req, res) => {
    // quering offers and adding a new parameter for checking verification
    res.render('web-email-offer-gen', { email: req.user.email });
});

router.use(userRoutes);

module.exports = router;

// ar.boulahdour@outlook.com
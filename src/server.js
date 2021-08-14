const express           = require('express');
const csrf              = require('csurf');
const path              = require('path');
const cookieParser      = require('cookie-parser');
const expressSession    = require('express-session');
const flash             = require('connect-flash');
const mongoose          = require('mongoose');
const passport          = require('passport');
const dotenv            = require("dotenv");
var MemoryStore         = require('memorystore')(expressSession)

dotenv.config();

const app = express();

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views',);

app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));  
app.use('/img', express.static('img')); 

const mongoURI = require('./utilities/monkoKEY');

// CONNECT DATABASE

mongoose.connect(
  mongoURI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => {
    console.log("Connected to MongoDB");
  }
);

app.use(cookieParser('random'));

app.use(expressSession({
    secret: "random",
    resave: true,
    saveUninitialized: true,
    // setting the max age to longer duration
    maxAge: 24 * 60 * 60 * 1000,
    store: new MemoryStore(),
}));

app.use(csrf());
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

app.use(function (req, res, next) {
    res.locals.success_messages = req.flash('success_messages');
    res.locals.error_messages = req.flash('error_messages');
    res.locals.error = req.flash('error');
    next();
});

app.use(require('./routes/routes.js'));

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => console.log("Server Started At " + PORT));
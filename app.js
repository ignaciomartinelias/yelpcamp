// Requiering Dependencies, Models, Seeds & Routes

var express = require('express'),
	app = express(),
	bodyParser = require('body-parser'),
	mongoose = require('mongoose'),
	expressSession = require("express-session"),
	passport = require('passport'),
	methodOverride = require("method-override"),
	LocalStrategy = require('passport-local'),
	dotEnv = require('dotenv'),
	User = require('./models/user'),
	seedDB = require('./seeds'),
	flash = require("connect-flash"),
	indexRoutes = require("./routes/routes-index"),
	campgroundRoutes = require("./routes/routes-campgrounds"),
	commentRoutes = require("./routes/routes-comments");


// Seed DB
// seedDB();

// APP CONFIGURATION

dotEnv.config();

mongoose.connect(process.env.MONGODB_URL , { useNewUrlParser: true , useFindAndModify: false});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(flash());

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(expressSession({
	secret: "Colabore para no desaparecer",
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
})

app.use(indexRoutes);
app.use("/campgrounds" , campgroundRoutes);
app.use("/campgrounds/:id/comments" , commentRoutes);

// SERVER
app.listen(process.env.PORT , process.env.IP, function() {
	console.log('Yelpcamp Server Started!!');
});
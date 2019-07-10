var express = require('express'),
	router = express.Router(),
	passport = require('passport'),
	User = require('../models/user');

// ROOT ROUTE
router.get('/', function(req, res) {
	res.render('landing');
});

// ==================================
//            AUTH ROUTES
// ==================================

// REGISTER GET ROUTE
router.get('/register', function(req, res) {
	res.render('register');
});

// REGISTER POST ROUTE
router.post('/register', function(req, res) {
	var newUser = new User({ username: req.body.username });
	User.register(newUser, req.body.password, function(err, user) {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('/register');
		} else {
			passport.authenticate('local' , { failureFlash: 'Invalid username or password.'})(req, res, function() {
				req.flash('success', 'Welcome to YelpCamp ' + user.username + '!');
				res.redirect('/campgrounds');
			});
		}
	});
});

// LOGIN GET ROUTE
router.get('/login', function(req, res) {
	res.render('login');
});

// LOGIN POST ROUTE
router.post('/login',passport.authenticate('local', {successRedirect: '/campgrounds', failureRedirect: '/login', failureFlash: true,  successFlash: 'Welcome back!'}),
	function(req, res) {}
);

// LOGOUT ROUTE
router.get('/logout', function(req, res) {
	req.logout();
	req.flash('success', 'Logged you out!');
	res.redirect('/campgrounds');
});

module.exports = router;

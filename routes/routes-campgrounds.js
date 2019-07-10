var express = require('express'),
	middleware = require('../middleware'),
	Campground = require('../models/campground'),
	router = express.Router();

// ==================================
//        CAMPGROUND ROUTES
// ==================================

// INDEX ROUTE
router.get('/', function(req, res) {
	Campground.find(function(err, campgrounds) {
		res.render('campground/index', { campgrounds: campgrounds });
	});
});

// NEW ROUTE
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campground/new');
});

// CREATE ROUTE
router.post('/', middleware.isLoggedIn, function(req, res) {
	var newCamp = {
		name: req.body.name,
		price: req.body.price,
		image: req.body.image,
		description: req.body.description,
		author: {
			id: req.user._id,
			username: req.user.username
		}
	};

	Campground.create(newCamp);
	req.flash("success", "Successfully created campground!");
	res.redirect('/campgrounds');
});

// SHOW ROUTE
router.get('/:id', function(req, res) {
	var campgroundId = req.params.id;
	Campground.findById(campgroundId).populate('comments').exec(function(err, campground) {
		if (err) {
			console.log(err);
		} else {
			res.render('campground/show', { campground: campground });
		}
	});
});

// EDIT ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
	var campgroundId = req.params.id;
	Campground.findById(campgroundId, function(err, campground) {
		if (err) {
			req.flash("error", "Campground not found!");
			res.redirect('/campgrounds');
		} else {
			res.render('campground/edit', { campground: campground });
		}
	});
});

// UPDATE ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	var campgroundId = req.params.id;
	Campground.findByIdAndUpdate(campgroundId, req.body.campground, function(err, campground) {
		if (err) {
			req.flash("error", "Campground not found!");
			res.redirect('/campgrounds');
		} else {
			req.flash("success", "Successfully updated campground!");
			res.redirect('/campgrounds/' + campgroundId);
		}
	});
});

// DESTROY ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	var campgroundId = req.params.id;
	Campground.findByIdAndRemove(campgroundId, function(err, campground) {
		if (err) {
			console.log(err);
			res.redirect('/campgrounds/' + req.params.id);
		} else {
			req.flash("success", "Campground deleted!");
			res.redirect('/campgrounds');
		}
	});
});

module.exports = router;

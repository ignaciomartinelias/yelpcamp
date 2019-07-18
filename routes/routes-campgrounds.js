var express = require('express'),
	middleware = require('../middleware'),
	NodeGeocoder = require('node-geocoder'),
	Campground = require('../models/campground'),
	router = express.Router();

// ==================================
//         GEOCODER CONFIG
// ==================================

var options = {
	provider: 'google',
	httpAdapter: 'https',
	apiKey: process.env.GEOCODE_API_KEY,
	formatter: null
};

var geocoder = NodeGeocoder(options);

// ==================================
//        CAMPGROUND ROUTES
// ==================================

// INDEX ROUTE
router.get('/', function(req, res) {
	if (req.query.search) {
		var regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Campground.find({ name: regex }, function(err, campgrounds) {
      if(campgrounds.length == 0){
        req.flash('error', 'No campgrounds found');
        return res.redirect("/campgrounds");
      }
			res.render('campground/index', { campgrounds: campgrounds });
		});
	} else {
		Campground.find(function(err, campgrounds) {
			res.render('campground/index', { campgrounds: campgrounds });
		});
	}
});

// NEW ROUTE
router.get('/new', middleware.isLoggedIn, function(req, res) {
	res.render('campground/new');
});

//CREATE ROUTE
router.post('/', middleware.isLoggedIn, function(req, res) {
	// get data from form and add to campgrounds array
	var name = req.body.name;
	var image = req.body.image;
	var desc = req.body.description;
	var price = req.body.price;
	var author = {
		id: req.user._id,
		username: req.user.username
	};
	geocoder.geocode(req.body.location, function(err, data) {
		if (err || !data.length) {
			console.log(err.message);
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		var lat = data[0].latitude;
		var lng = data[0].longitude;
		var location = data[0].formattedAddress;
		var newCampground = {
			name: name,
			image: image,
			price: price,
			description: desc,
			author: author,
			location: location,
			lat: lat,
			lng: lng
		};
		// Create a new campground and save to DB
		Campground.create(newCampground, function(err, newlyCreated) {
			if (err) {
				console.log(err);
			} else {
				//redirect back to campgrounds page
				req.flash('success', 'Successfully created campground!');
				res.redirect('/campgrounds');
			}
		});
	});
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
			req.flash('error', 'Campground not found!');
			res.redirect('/campgrounds');
		} else {
			res.render('campground/edit', { campground: campground });
		}
	});
});

// UPDATE ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
	geocoder.geocode(req.body.location, function(err, data) {
		if (err || !data.length) {
			req.flash('error', 'Invalid address');
			return res.redirect('back');
		}
		req.body.campground.lat = data[0].latitude;
		req.body.campground.lng = data[0].longitude;
		req.body.campground.location = data[0].formattedAddress;

		Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground) {
			if (err) {
				req.flash('error', err.message);
				res.redirect('back');
			} else {
				req.flash('success', 'Successfully Updated!');
				res.redirect('/campgrounds/' + campground._id);
			}
		});
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
			req.flash('success', 'Campground deleted!');
			res.redirect('/campgrounds');
		}
	});
});

function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = router;

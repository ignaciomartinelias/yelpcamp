var express = require('express'),
	middleware = require('../middleware'),
	Campground = require('../models/campground'),
	Comment = require('../models/comment'),
	router = express.Router({ mergeParams: true });

// ==================================
//          COMMENTS ROUTES
// ==================================

// NEW ROUTE
router.get('/new', middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		res.render('comment/new', { campground: campground });
	});
});

// CREATE ROUTE
router.post('/', middleware.isLoggedIn, function(req, res) {
	Campground.findById(req.params.id, function(err, campground) {
		if (err) {
			console.log(err);
			res.redirect('/campgrounds');
		} else {
			Comment.create(req.body.comment, function(err, comment) {
				if (err) {
					console.log(err);
				} else {
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					campground.comments.push(comment);
					campground.save();
					req.flash("success", "Successfully created comment!");
					res.redirect('/campgrounds/' + req.params.id);
				}
			});
		}
	});
});

// EDIT ROUTE
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
	Comment.findById(req.params.comment_id, function(err, foundComment) {
		if (err) {
			console.log(err);
			res.redirect('back');
		} else {
			res.render('comment/edit', { comment: foundComment, campgroundId: req.params.id });
		}
	});
});

// UPDATE ROUTE
router.post('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
		if (err) {
			console.log(err);
			res.redirect('/campgrounds/' + req.params.id);
		} else {
			req.flash("success", "Successfully updated comment!");
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

// DELETE ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
	Comment.findByIdAndRemove(req.params.comment_id, function(err, deletedComment) {
		if (err) {
			console.log(err);
			res.redirect('back');
		} else {
			req.flash("success", "Comment deleted!");
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});

module.exports = router;

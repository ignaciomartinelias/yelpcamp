var middlewareObj = {},
    Comment = require("../models/comment"),
    Campground = require("../models/campground");

middlewareObj.isLoggedIn = function(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You need to be logged in to do that!");
	res.redirect('/login');
}

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err){
				req.flash("error", "Campground not found!");
				res.redirect("/campgrounds");
			} else {
				if(foundCampground.author.id.equals(req.user.id)){
					next();
				} else {
					req.flash("error", "You don't have permission to do that!");
					res.redirect("/campgrounds");
				}
			}
		})
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/campgrounds");
	}
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
	if (req.isAuthenticated()) {
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				req.flash("error", "Comment not found!");
				res.redirect("/campgrounds");
			} else {
				if(foundComment.author.id.equals(req.user.id)){
					next();
				} else {
					req.flash("error", "You don't have permission to do that!");
					res.redirect("/campgrounds");
				}
			}
		})
	} else {
		req.flash("error", "You need to be logged in to do that!");
		res.redirect("/campgrounds");
	}
}

module.exports = middlewareObj;
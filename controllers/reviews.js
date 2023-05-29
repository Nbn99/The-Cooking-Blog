const Article = require("../models/article");
const Review = require("../models/review");

const { validationResult } = require("express-validator");

exports.postNewReview = async (req, res, next) => {
  try {
    const articleId = req.params.id
    const article = await Article.findById(articleId)
    const description = req.body.description;
    const rating = req.body.rating;

    const review = new Review({
      description: description,
      rating: rating,
      userId: req.user._id,
    })

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render("articles/show", {
        path: "/articles/show",
        editing: false,
        hasError: true,
        review: {
          description: description,
          rating: rating,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
    article.reviews.push(review);
    await review.save()
    await article.save();
          console.log(article.reviews);
          req.flash("success", "Successfully made a new review");
          res.redirect(`/articles/${articleId}`);
          console.log("added new review");
  } catch (err) {
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }
};

exports.deleteReview = async (req, res, next) => {
  const { id, reviewId } = req.params;
  await Article.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash('success', 'Successfully deleted review')
  res.redirect(`/articles/${id}`);

};
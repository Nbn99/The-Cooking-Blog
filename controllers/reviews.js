const Article = require("../models/article");
const review = require("../models/review");
const Review = require("../models/review");

const { validationResult } = require("express-validator");

exports.postNewReview = async (req, res, next) => {
  const articleId = req.params.id;

  Article.findById(articleId)
      .then((article) => {
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
      
      return review
        .save()
        .then((result) => {
          article.reviews.push(review);
          article.save();
          console.log(article.reviews);
          req.flash("success", "Successfully made a new review");
          res.redirect(`/articles/${articleId}`);
          console.log("added new review");
        })
        .catch((err) => {
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
  // const article = await Article.findById(req.params.id);
  // const review = new Review(req.body.review);
  // review.author = req.user._id;
  // article.reviews.push(review);
  // await review.save();
  // await article.save();
  // req.flash('success', 'Created new review!');
  // res.redirect(`/articles/${article._id}`);
};

exports.deleteReview = (req, res, next) => {
  const { id, reviewId } = req.params;
  // await Article.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  // await Review.findByIdAndDelete(reviewId);
  // req.flash('success', 'Successfully deleted review')
  // res.redirect(`/articles/${id}`);

  Article.findByIdAndUpdate(id, { $pull: { reviews: reviewId } })
  .then((article) => {
    if (!article) {
      return res.redirect(`/articles/${id}`);
    }
  })
  .then((result) => {
    Review.findById(reviewId)
    .then((review) => {
      if (review.userId.toString() !== req.user._id.toString()) {
        return res.redirect(`/articles/${id}`);
      } else {
        Review.deleteOne({_id: reviewId})
        req.flash("success", "Successfully delete review");
          res.redirect(`/articles/${id}`);
          console.log("deleted review");

      }
    })

   
  })
  
  
};

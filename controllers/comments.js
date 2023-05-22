
const Article = require("../models/article");
const Comment = require("../models/comment");

const { validationResult } = require("express-validator");

exports.postNewComment = async (req, res, next) => {
  const articleId = req.params.id;

  Article.findById(articleId)
      .then((article) => {
      const description = req.body.description;

      const comment = new Comment({
        description: description,
        userId: req.user._id,
      })

      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render("articles/show", {
          path: "/articles/show",
          editing: false,
          hasError: true,
          comment: {
            description: description,
          },
          errorMessage: errors.array()[0].msg,
          validationErrors: errors.array(),
        });
      }
      
      return comment
        .save()
        .then((result) => {
          article.comments.push(comment);
          article.save();
          console.log(article.comment);
          req.flash("success", "Successfully made a new comment");
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
  // const comment = new Comments(req.body.comment);
  // comment.userId = req.user._id;
  // article.comments.push(comment);
  // await comment.save();
  // await article.save();
  // req.flash('success', 'Created new comment!');
  // res.redirect(`/articles/${article._id}`);
};

exports.deleteComment = (req, res, next) => {
  const { id, commentId } = req.params;
  // await Article.findByIdAndUpdate(id, { $pull: { comments: commentId } });
  // await Comment.findByIdAndDelete(commentId);
  // req.flash('success', 'Successfully deleted comment')
  // res.redirect(`/articles/${id}`);

  Article.findByIdAndUpdate(id, { $pull: { comments: commentId } })
  .then((article) => {
    if (!article) {
      return res.redirect(`/articles/${id}`);
    }
  })
  .then((result) => {
    Comment.findById(reviewId)
    .then((comment) => {
      if (comment.userId.toString() !== req.user._id.toString()) {
        return res.redirect(`/articles/${id}`);
      } else {
        Comment.deleteOne({_id: commentId})
        req.flash("success", "Successfully delete comment");
          res.redirect(`/articles/${id}`);
          console.log("deleted comment");
      }
    })
  })
};

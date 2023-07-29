const Article = require("../models/article");
const Comment = require("../models/comment");

const { validationResult } = require("express-validator");

exports.postNewComment = async (req, res, next) => {
  try {
    const articleId = req.params.slug
    const article = await Article.findOne({slug: articleId})
  const description = req.body.description;

  const comment = new Comment({
    description: description,
    userId: req.user._id,
  });

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
  article.comments.push(comment);

  await comment.save();
  await article.save();
 
  req.flash("success", "Successfully made a new comment");
  res.redirect(`/articles/${articleId}`);
  console.log("added new comment");
  } catch (err) {
    const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
  }
};

exports.deleteComment = async  (req, res, next) => {
  const { slug, commentId } = req.params;
  await Article.findByIdAndUpdate(slug, { $pull: { comments: commentId } });
  await Comment.findByIdAndDelete(commentId);
  req.flash('success', 'Successfully deleted comment')
  res.redirect(`/articles/${id}`);
};

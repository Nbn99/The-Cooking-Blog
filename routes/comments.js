const express = require("express");
const router = express.Router({ mergeParams: true });
const { body } = require("express-validator");
const { isLoggedIn } = require("../middlewares/is-auth");
const Comment = require("../models/comment");
const commentsController = require("../controllers/comments");

router.post(
  "/",
  [
    body(
      "description",
      "Description must have at least 3 characters and maximum 1500"
    )
      .isLength({ min: 5, max: 1500 })
      .trim(),
  ],

  isLoggedIn,
  commentsController.postNewComment
);

router.delete("/:commentId", isLoggedIn, commentsController.deleteComment);

module.exports = router;

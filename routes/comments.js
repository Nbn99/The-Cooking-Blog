const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const { isLoggedIn } = require('../middlewares/is-auth')
const Comment = require('../models/comment');
const commentsController = require('../controllers/comments')



router.post('/', isLoggedIn, commentsController.postNewComment )

router.delete('/:commentId', isLoggedIn, commentsController.deleteComment)

module.exports = router;
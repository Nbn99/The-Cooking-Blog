const express = require('express');
const router = express.Router({ mergeParams: true });
const { body } = require('express-validator');
const { isLoggedIn } = require('../middlewares/is-auth')
const Article = require('../models/article');
const Review = require('../models/review');
const reviewsController = require('../controllers/reviews');


router.post('/', isLoggedIn, reviewsController.postNewReview )

router.delete('/:reviewId', isLoggedIn, reviewsController.deleteReview)

module.exports = router;
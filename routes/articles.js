const express = require('express');
const path = require('path');
const articleController = require('../controllers/article');
const { body } = require('express-validator');
const { isLoggedIn } = require('../middlewares/is-auth')

const router = express.Router();

router.get('/', articleController.getAllArticles);

router.get('/new', isLoggedIn, articleController.getNewArticle);

router.get('/edit/:id', isLoggedIn, articleController.getEditArticle);

router.get('/:id', articleController.getArticle);

router.post(
    '/new',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isLoggedIn,
    articleController.postNewArticle
);

router.post(
    '/edit',
    [
        body('title')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isLoggedIn,
    articleController.postEditArticle
);
router.post('/search', articleController.searchArticle);

router.delete('/:id', isLoggedIn, articleController.deleteArticle);



module.exports = router;
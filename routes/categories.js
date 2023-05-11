const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categories');
const { body } = require('express-validator');
const { isLoggedIn } = require('../middlewares/is-auth')


router.get('/', categoriesController.getCategories);

router.get('/new', categoriesController.getNewCategory);

router.get('/:id', categoriesController.getCategoriesById);

router.get('/edit/:id', categoriesController.getEditCategory);

router.post('/new',
    [
        body('name')
            .isString()
            .isLength({ min: 3 })
            .trim(),
        body('description')
            .isLength({ min: 5, max: 400 })
            .trim()
    ],
    isLoggedIn,
    categoriesController.postNewCategory);

router.post('/edit',
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
    categoriesController.postEditCategory);

router.delete('/:id', categoriesController.deleteCategory);



module.exports = router;
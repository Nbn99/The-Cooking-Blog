// const fs = require('fs');  <- dodać gdy będę chciała dodać download ingrediens
// const path = require('path');

const { validationResult } = require('express-validator');
const Article = require('../models/article');

const ITEMS_PER_PAGE = 2;

exports.getNewArticle = (req, res, next) => {
    res.render('articles/new', {
        article: new Article(),
        path: '/articles/new',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    })
};

exports.postNewArticle = (req, res, next) => {
    const title = req.body.title;
    const createdAt = req.body.createdAt;
    const category = req.body.category;
    const subcategory = req.body.subcategory;
    const image = req.file
    const description = req.body.description;
    console.log(image)


    if (!image) {
        return res.status(422).render('articles/new', {
            path: '/articles/new',
            editing: false,
            hasError: true,
            article: {
                title: title,
                description: description,
                category: category,
                subcategory: subcategory
            },
            errorMessage: 'Attached file is not an image.',
            validationErrors: []
        });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('articles/new', {
            path: '/articles/new',
            editing: false,
            hasError: true,
            article: {
                title: title,
                description: description,
                category: category,
                subcategory: subcategory
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    const img = image.path;
    const article = new Article({

        title: title,
        createdAt: createdAt,
        category: category,
        subcategory: subcategory,
        img: img,
        description: description,
        userId: req.user._id
    })
    article
        .save()
        .then(result => {
            req.flash('success', 'Successfully made a new article');
            res.redirect('/articles');
            console.log('added new article')
            console.log(img)
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}


exports.getEditArticle = async (req, res, next) => {
    const articleId = req.params.id
    Article
        .findById(articleId)
        .then(article => {
            if (article.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/articles');
            } // sprawdzić czy działa bez tego 
            if (!article) {
                return res.redirect('/articles')
            }
            res.render('articles/edit', {
                path: '/articles/edit',
                editing: true,
                article: article,
                hasError: false,
                errorMessage: null,
                validationErrors: []
            })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postEditArticle = (req, res, next) => {

    const artId = req.body.articleId
    const updatedTitle = req.body.title;
    const createdAt = req.body.createdAt;
    const updatedCategory = req.body.category;
    const updatedSubcategory = req.body.subcategory;
    const image = req.file
    const updatedDescription = req.body.description;
    console.log(artId)

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('articles/edit', {
            path: '/articles/edit',
            editing: true,
            hasError: true,
            article: {
                title: updatedTitle,
                img: updatedImg,
                description: updatedDescription,
                category: updatedCategory,
                subcategory: updatedSubcategory,
                _id: artId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Article.findById(artId)
        .then(article => {
            if (article.userId.toString() !== req.user._id.toString()) {
                return res.redirect('/');
            }
            article.title = updatedTitle;
            article.createdAt = createdAt;
            article.category = updatedCategory;
            article.subcategory = updatedSubcategory;
            article.description = updatedDescription;
            if (image) {
                fileHelper.deleteFile(article.img);
                article.img = image.path;
            }

            return article.save().then(result => {
                console.log('UPDATED PRODUCT!');
                req.flash('success', 'Successfully updeted the campground');
                res.redirect('/articles');
                console.log(req.body.articleId)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getAllArticles = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalArticles;

    Article.find()
        .countDocuments()
        .then(numArticles => {
            totalArticles = numArticles;
            return Article.find()
                .skip((page - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE);
        })
        .then(articles => {
            res.render('articles/index', {
                articles: articles,
                path: '/articles',
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalArticles,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalArticles / ITEMS_PER_PAGE)
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });

    // Article.find().sort({ createdAt: 'desc' })
    //     .then(articles => {
    //         res.render('articles/index', {
    //             articles: articles,
    //             path: '/articles'
    //         })
    //     })
    //     .catch(err => {
    //         const error = new Error(err);
    //         error.httpStatusCode = 500;
    //         return next(error);
    //     });
};

exports.getArticle = async (req, res, next) => {
    const articleId = req.params.id;
    console.log(req.params)
    try {
        const article = await Article.findById(articleId);
        if (article == null) {
            res.redirect('/articles')
        } else {
            res.render('articles/show', {
                article: article,
                // isAuthenticated: req.isLoggedIn
            });
        };

    } catch (error) {
        error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};


// exports.postDeleteArticle = (req, res, next) => {
//     const { id } = req.params
//     console.log(id)
//     Article.findByIdAndRemove(id)
//       .then(() => {
//         console.log('DESTROYED article');
//         res.redirect('/articles');
//       })
//       .catch(err => console.log(err));
//   };


exports.deleteArticle = (req, res, next) => {
    const artId = req.body.articleId;
    Article.findById(artId)
        .then(article => {
            if (!article) {
                return next(new Error('Product not found.'));
            }
            fileHelper.deleteFile(article.img);
            return Product.deleteOne({ _id: artId, userId: req.user._id });
        })
        .then(() => {
            console.log('DESTROYED article');
            res.redirect('/articles');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};


// exports.searchArticle = async(req, res, next) => {
//     try {
//       let searchTerm = req.body.searchTerm;
//       let article = await Article.find( { $text: { $search: searchTerm, $diacriticSensitive: true } });
//       res.render('search', { article: 'Cooking Blog - Search', article } );
//     } catch (error) {
//       res.satus(500).send({message: error.message || "Error Occured" });
//     }

//   }

exports.searchArticle = async (req, res, next) => {
    let searchTerm = req.body.searchTerm;
    Article.find({ $text: { $search: searchTerm, $diacriticSensitive: true } })
        .then(article => {
            res.render('articles/search', { article: 'Cooking Blog - Search', article })
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
}
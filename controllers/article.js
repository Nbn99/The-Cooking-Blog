// const fs = require('fs');  <- dodać gdy będę chciała dodać download ingrediens
const path = require("path");
const fileHelper = require('../util/file')

const { validationResult } = require("express-validator");
const Article = require("../models/article");
const Category = require("../models/category");
const User = require("../models/users");
const Review = require("../models/review")
const { Console } = require("console");

const ITEMS_PER_PAGE = 2;

exports.getNewArticle = (req, res, next) => {
  Category.find({})
    .then((categories) => {
      res.render("articles/new", {
        article: new Article(),
        path: "/articles/new",
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        categories,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postNewArticle = async (req, res, next) => {

  const categories = await Category.find({})
 
  Article.find({}).populate({
    path: "category",
    select: "name"
  })

  const title = req.body.title;
  const createdAt = req.body.createdAt;
   const category = req.body.category
  const image = req.file;
  const ingredients = req.body.ingredients;
  const description = req.body.description;

  if (!image) {
    return res.status(422).render("articles/new", {
      path: "/articles/new",
      editing: false,
      hasError: true,
      article: {
        title: title,
        description: description,
        category: category,
        ingredients: ingredients,
      },
      errorMessage: "Attached file is not an image.",
      validationErrors: [],
      categories,
    });
  }

  const errors = validationResult(req);


  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("articles/new", {
      path: "/articles/new",
      editing: false,
      hasError: true,
      article: {
        title: title,
        description: description,
        category: category,
        ingredients: ingredients,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      categories,
    });
  }
  const img = image.path;

  const article = new Article({
    title: title,
    createdAt: createdAt,
    category: category,
    img: img,
    ingredients: ingredients,
    description: description,
    userId: req.user._id,
  }) 
  console.log(category)
  article   
    .save()       
    .then(async (result) => {
    categories;
    
      req.flash("success", "Successfully made a new article");
      res.redirect("/articles");
      console.log("added new article");
    })

    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditArticle = async (req, res, next) => {
  const categories = await Category.find({});
  const articleId = req.params.id;
  Article.findById(articleId)
    
    .then((article) => {
      if (article.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/articles");
      } // sprawdzić czy działa bez tego
      if (!article) {
        return res.redirect("/articles");
      }
      res.render("articles/edit", {
        path: "/articles/edit",
        editing: true,
        article: article,
        hasError: false,
        errorMessage: null,
        validationErrors: [],
        categories,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditArticle = async (req, res, next) => {
  const categories = await Category.find({});
  console.log(categories);
  const artId = req.body.articleId;
  const updatedTitle = req.body.title;
  const createdAt = req.body.createdAt;
  const updatedCategory = req.body.category;
  const image = req.file;
  const updatedIngredients = req.body.ingredients;
  const updatedDescription = req.body.description;
  console.log(artId);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("articles/edit", {
      path: "/articles/edit",
      editing: true,
      hasError: true,
      article: {
        title: updatedTitle,
        ingredients: updatedIngredients,
        description: updatedDescription,
        category: updatedCategory,
        _id: artId,
        categories,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }

  Article.findById(artId)
    .then((article) => {
      if (article.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      article.title = updatedTitle;
      article.createdAt = createdAt;
      article.category = updatedCategory;
      article.ingredients = updatedIngredients;
      article.description = updatedDescription;
      categories;
      if (image) {
        fileHelper.deleteFile(article.img);
        article.img = image.path;
      }

      return article.save().then((result) => {
        console.log("UPDATED article!");
        req.flash("success", "Successfully updated the article");
        res.redirect("/articles");
        console.log(req.body.articleId);
      });
    })
    .catch((err) => {
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
    .then((numArticles) => {
      totalArticles = numArticles;
      return Article.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((articles) => {
      res.render("articles/index", {
        articles: articles,
        path: "/articles",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalArticles,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalArticles / ITEMS_PER_PAGE),
      });
    })
    .catch((err) => {
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

// exports.getArticle = async (req, res, next) => {
//     const articleId = req.params.id;
//     console.log(req.params)
//     try {
//         const article = await Article.findById(articleId);
//         if (article == null) {
//             res.redirect('/articles')
//         } else {
//             res.render('articles/show', {
//                 article: article,
//                 // isAuthenticated: req.isLoggedIn
//             });
//         };

//     } catch (err) {
//         error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//     }
// };

exports.getArticle = (req, res, next) => {
  const artId = req.params.id;
  
  Article.findById(artId)
    .populate({
      path: "userId",
      select: "email",
    })
    .populate({
      path: "category",
      select: "name",
    })
    .populate({
      path: "reviews",
      select: ["description", "userId", "rating"],
      model: "Review"
    }).populate("userId")
    .then((article) => {
      if (article == null) {
        res.redirect("/articles");
      } else {
        res.render("articles/show", {
          article: article,
          pageTitle: article.title,
          path: "/articles",
        });
      }
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });

    Review.find({}).populate({
      path: "userId",
      select: "email"
    })
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
  const artId = req.params.id;
  console.log(artId)
  Article.findById(artId)
    .then((article) => {
      if (!article) {
        return next(new Error("Product not found."));
      }

      fileHelper.deleteFile(article.img);
      return Article.deleteOne({ _id: artId, userId: req.user._id });
    })
    .then(() => {
      console.log("DESTROYED article");
      res.redirect("/articles");
    })
    .catch((err) => {
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
//       res.status(500).send({message: error.message || "Error Occured" });
//     }

//   }

exports.searchArticle = (req, res, next) => {
  let searchTerm = req.body.searchTerm;
  Article.find({ $text: { $search: searchTerm, $diacriticSensitive: true } })
    .then((article) => {
      res.render("articles/search", {
        title: "Cooking Blog - Search",
        article,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.searchRandom = async (req, res, next) => {
  try {
    let count = await Article.find().countDocuments();

    let random = Math.floor(Math.random() * count);
    let article = await Article.findOne().skip(random).exec();
    res.render("articles/show", {
      title: "Cooking Blog - Explore Random",
      path: "/articles",
      article,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};

//   exports.searchRandom = (req, res, next) => {
//     Article.find().countDocuments()
//     .then(count => {
//         random = Math.floor(Math.random() * count);
//     })
//     .then(random => {
//         Article.findOne().skip(random).exec();
//     })
//     .then(article => {
//         res.render('search-random', { title: 'Cooking Blog - Explore Latest', article } )
//     })
//     .catch(err => {
//         const error = new Error(err);
//         error.httpStatusCode = 500;
//         return next(error);
//     });
//    }

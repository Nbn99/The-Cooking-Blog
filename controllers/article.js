const fs = require("fs");
const path = require("path");
const fileHelper = require("../util/file");
const PDFDocument = require("pdfkit");
const { validationResult } = require("express-validator");
const Article = require("../models/article");
const Category = require("../models/category");
const User = require("../models/users");
const Comment = require("../models/comment");

const ITEMS_PER_PAGE = 3;

exports.getNewArticle = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    
    res.render("articles/new", {
      article: new Article(),
      path: "/articles/new",
      editing: false,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
      categories,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postNewArticle = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    const title = req.body.title;
    const createdAt = req.body.createdAt;
    const category = req.body.category;
    const image = req.file;
    const ingredients = req.body.ingredients;
    const description = req.body.description;
     
    if (!image) {
      return res.status(422).render("articles/new", {
        path: "/articles/new",
        editing: true,
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
        editing: true,
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
    });

    await article.save();
    req.flash("success", "Successfully made a new article");
    res.redirect("/articles");
    console.log("added new article");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditArticle = async (req, res, next) => {
  try {
    const article = await Article.findOne({slug: req.params.slug});
    const categories = await Category.find({});
    const ingredientsArray = article.ingredients;
    const index = 0;
    const categoriesArray = [];
    const articleCategoriesArray = article.category;
    console.log(req.user._id)
    
    for(let i=0; i<categories.length; i++){
      categoriesArray.push(categories[i].name)
    }

   if (article.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/articles");
    }
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
      ingredientsArray,
      index,
      categoriesArray,
      articleCategoriesArray

    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postEditArticle = async (req, res, next) => {
  try {
    const categories = await Category.find({});
    const artId = req.body.articleId;
    const updatedTitle = req.body.title;
    const createdAt = req.body.createdAt;
    const updatedCategory = req.body.category;
    const image = req.file;
    const updatedIngredients = req.body.ingredients;
    const updatedDescription = req.body.description;
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
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
    const article = await Article.findById(artId);
    if (article.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/");
    }
    article.title = updatedTitle;
    article.createdAt = createdAt;
    article.category = updatedCategory;
    article.ingredients = updatedIngredients;
    article.description = updatedDescription;
    if (image) {
      fileHelper.deleteFile(article.img);
      article.img = image.path;
    }
    await categories
    await article.save();
    console.log("UPDATED article!");
    req.flash("success", "Successfully updated the article");
    res.redirect(`/articles/${article._id}`);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getAllArticles = async (req, res, next) => {
  try {
    if(!req.user){
    const currentUser = "";
    const categories = await Category.find({});
    const page = +req.query.page || 1;
    let totalArticles;
    const numArticles = await Article.find().countDocuments();
    totalArticles = numArticles;
    const articles = await Article.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
    res.render("articles/index", {
      categories: categories,
      articles: articles,
      currentUser,
      path: "/articles",
      currentPage: page,
      hasNextPage: ITEMS_PER_PAGE * page < totalArticles,
      hasPreviousPage: page > 1,
      nextPage: page + 1,
      previousPage: page - 1,
      lastPage: Math.ceil(totalArticles / ITEMS_PER_PAGE),
    });
    }else {
      const currentUser = req.user._id
      const categories = await Category.find({});
      const page = +req.query.page || 1;
      let totalArticles;
      const numArticles = await Article.find().countDocuments();
      totalArticles = numArticles;
      const articles = await Article.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
      res.render("articles/index", {
        categories: categories,
        articles: articles,
        currentUser,
        path: "/articles",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalArticles,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalArticles / ITEMS_PER_PAGE),
      });
    }
    
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getArticle = async (req, res, next) => {
  try {
    if(!req.user){
      const currentUser = "";
      const article = await Article.findOne({slug: req.params.slug})
      .populate( 'userId')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId'
        }
      })
      if (article == null) {
      res.redirect("/articles");
       } else {
      res.render("articles/show", {
        article,
        currentUser,
        pageTitle: article.title,
        path: "/articles",
      });
    }
    } else {
      const currentUser = req.user._id;

      const article = await Article.findOne({slug: req.params.slug})
      .populate( 'userId')
      .populate({
        path: 'comments',
        populate: {
          path: 'userId'
        }
      })
        if (article == null) {
        res.redirect("/articles");
         } else {
        res.render("articles/show", {
          article,
          currentUser,
          pageTitle: article.title,
          path: "/articles",
        });
      }
    }
    
  } catch (err) {
    error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
exports.deleteArticle = async (req, res, next) => {
  try {
    const artId = req.params.slug;
    const article = await Article.findOne({slug: artId});

    for(comment of article.comments){
      const commentId = comment._id;
      await Comment.findByIdAndDelete(commentId)
    }

    if (!article) {
      return next(new Error("Article not found."));
    }
    fileHelper.deleteFile(article.img);
    
    await Article.deleteOne({ slug: artId, userId: req.user._id });
    console.log("DESTROYED article");
    res.redirect("/articles");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};


exports.searchArticle = async (req, res, next) => {
  try {
    const searchTerm = req.body.searchTerm;
    
    const article = await Article.aggregate().search({
      text: {
        query: searchTerm,
        path: "title"
      }
    })
    
    console.log(article)
    return res.render("articles/search", {
      title: "Cooking Blog - Search",
       article
       });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
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

exports.getIngredientsPdf = async (req, res, next) => {
  try {
    const article = await Article.findOne({slug: req.params.slug});
    
    if (!article) {
      return next(new Error("No Article found."));
    }
    const ingredientsPdfName = "ingredient-list-" + article.title + ".pdf";
    const ingredientsPdfPath = path.join(
      "data",
      "ingredientLists",
      ingredientsPdfName
    );

    const pdfDoc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      'inline; filename="' + ingredientsPdfName + '"'
    );
    pdfDoc.pipe(fs.createWriteStream(ingredientsPdfPath));
    pdfDoc.pipe(res);

    pdfDoc.fontSize(26).text("Ingredients for " + article.title, {
      underline: true,
    }).moveDown();
    

    article.ingredients.forEach((ingredient) => {
      pdfDoc.fontSize(16).list([ingredient], {
        width:100,
        align: 'left',
        listType:'bullet',
        bulletRadius: 3
      })

      // pdfDoc.fontSize(14).text(ingredient);
    });

    pdfDoc.end();

  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

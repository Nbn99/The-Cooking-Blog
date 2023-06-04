const Category = require("../models/category");
const Article = require("../models/article");
const path = require("path");
const { validationResult } = require("express-validator");
const fileHelper = require("../util/file");

exports.getCategories = async (req, res, next) => {
  try {
    const limitNumber = 20;
    const categories = await Category.find({}).limit(limitNumber);
    res.render("categories/all", {
      title: "Cooking Blog - Categories",
      path: "/categories",
      categories,
    });
  } catch (error) {
    res.status(500).send({ message: error.message || "Error Occured" });
  }
};
//naprawić getCategoriesById
exports.getCategoriesById = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const limitNumber = 20;
    const category = await Category.findOne({ name: categoryId });
    
    // const articles = await Article.find({ category: {$in: [categoryId]} }).limit(
    //   limitNumber
    // );

    const articles = await Article.aggregate().search({
      text: {
        query: categoryId,
        path: "category"
      }
    }).limit(limitNumber)

    await res.render("categories/one", {
      title: "Cooking Blog - Categories",
      category,  
      articles,
    });    
    
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getNewCategory = (req, res, next) => {
  res.render("categories/new", {
    category: new Category(),
    path: "/categories/new",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationErrors: [],
  });
};

exports.postNewCategory = async (req, res, next) => {
  try {
    const name = req.body.name;
    const image = req.file;
    const description = req.body.description;

    if (!image) {
      return res.status(422).render("categories/new", {
        path: "/categories/new",
        editing: false,
        hasError: true,
        category: {
          name: name,
          description: description,
        },
        errorMessage: "Attached file is not an image.",
        validationErrors: [],
      });
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).render("categories/new", {
        path: "/categories/new",
        editing: false,
        hasError: true,
        category: {
          name: name,
          description: description,
        },
        errorMessage: errors.array()[0].msg,
        validationErrors: errors.array(),
      });
    }
    const img = image.path;
    const category = new Category({
      name: name,
      img: img,
      description: description,
      userId: req.user._id,
    });
    await category.save();
    req.flash("success", "Successfully made a new category");
    res.redirect("/categories");
    console.log("added new category");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getEditCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.id;
    const category = await Category.findById(categoryId)
    if (category.userId.toString() !== req.user._id.toString()) {
      return res.redirect("/categories");
    } 
    if (!category) {
      return res.redirect("/categories");
    }
    res.render("categories/edit", {
      path: "/categories/edit",
      editing: true,
      category: category,
      hasError: false,
      errorMessage: null,
      validationErrors: [],
    });
  } catch (err) {
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
  }
};

exports.postEditCategory =async (req, res, next) => {
  try {
    const catId = req.body.categoryId;
  const updatedName = req.body.name;
  const image = req.file;
  const updatedDescription = req.body.description;
  console.log(catId);

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("categories/edit", {
      path: "/categories/edit",
      editing: true,
      hasError: true,
      article: {
        name: updatedName,
        img: updatedImg,
        description: updatedDescription,
        _id: catId,
      },
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
    });
  }
  const category = await Category.findById(catId)
  if (category.userId.toString() !== req.user._id.toString()) {
    return res.redirect("/");
  }
  category.name = updatedName;
  category.description = updatedDescription;
  if (image) {
    fileHelper.deleteFile(category.img);
    category.img = image.path;
  }

  await category.save()
    console.log("UPDATED category!");
    req.flash("success", "Successfully updated the category");
    res.redirect("/categories");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
 };

exports.deleteCategory = async (req, res, next) => {
  try {
    const catId = req.params.id;
    const category = await Category.findById(catId)
    if (!category) {
      return next(new Error("Category not found."));
    }
    fileHelper.deleteFile(category.img);
    await Category.deleteOne({ _id: catId, userId: req.user._id });
    console.log("DESTROYED category");
    res.redirect("/categories");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

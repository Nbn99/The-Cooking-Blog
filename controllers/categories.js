const Category = require("../models/category");
const Article = require("../models/article");
const path = require("path");
const { validationResult } = require("express-validator");

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

// exports.getCategories = (req, res, next) => {
//     const limitNumber = 20;
//     Category.find({}).limit(limitNumber)
//         .then(categories => {
//             res.render('categories', {
//                 title: 'Cooking Blog - Categories',
//                 categories
//             });
//         })
//         .catch(err => {
//             const error = new Error(err);
//             error.httpStatusCode = 500;
//             return next(error);
//         });
// };

// exports.getCategoriesById = async (req, res, next) => {
//   try {
//     let categoryId = req.params.id;
//     const limitNumber = 20;
//     const categoryById = await Category.find({ category: categoryId }).limit(
//       limitNumber
//     );
//     res.render("categories/one", {
//       title: "Cooking Blog - Categories",
//       categoryById,
//     });
//   } catch (error) {
//     res.status(500).send({ message: error.message || "Error Occured" });
//   }
// };

exports.getCategoriesById = async (req, res, next) => {
  const categoryId = req.params.id;
  const limitNumber = 20;

  const category = await Category.findOne({ name: categoryId })
  console.log(category)

  Article.find({ category: categoryId })
    .limit(limitNumber)
    .then((categoryById) => {
      res.render("categories/one", {
        title: "Cooking Blog - Categories",
        categoryById,
        category
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
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

exports.postNewCategory = (req, res, next) => {
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
      path: "/new",
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
  category
    .save()
    .then((result) => {
      req.flash("success", "Successfully made a new category");
      res.redirect("/categories");
      console.log("added new category");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditCategory = async (req, res, next) => {
  const categoryId = req.params.id;
  Category.findById(categoryId)
    .then((category) => {
      if (category.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/categories");
      } // sprawdzić czy działa bez tego
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
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditCategory = (req, res, next) => {
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

  Category.findById(catId)
    .then((category) => {
      if (category.userId.toString() !== req.user._id.toString()) {
        return res.redirect("/");
      }
      category.name = updatedName;
      category.description = updatedDescription;
      if (image) {
        fileHelper.deleteFile(category.img);
        category.img = image.path;
      }

      return category.save().then((result) => {
        console.log("UPDATED category!");
        req.flash("success", "Successfully updated the category");
        res.redirect("/categories");
        console.log(req.body.categoryId);
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteCategory = (req, res, next) => {
  const catId = req.body.categoryId;
  Category.findById(catId)
    .then((category) => {
      if (!category) {
        return next(new Error("Product not found."));
      }
      fileHelper.deleteFile(category.img);
      return Category.deleteOne({ _id: catId, userId: req.user._id });
    })
    .then(() => {
      console.log("DESTROYED category");
      res.redirect("/categories");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categories");
const { body } = require("express-validator");
const { isLoggedIn, isCategoryAuthor } = require("../middlewares/is-auth");

router.get("/", categoriesController.getCategories);

router.get("/new", categoriesController.getNewCategory);

router.get("/:slug", categoriesController.getCategoriesById);

router.get("/edit/:slug", isLoggedIn, isCategoryAuthor, categoriesController.getEditCategory);

router.post(
  "/new",
  [
    body("name")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body(
      "description"
    )
      .isLength({ min: 5, max: 1500 })
      .trim(),
  ],
  isLoggedIn,  
  categoriesController.postNewCategory
);

router.post(
  "/edit",
  [
    body("name")
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body(
      "description"
    )
      .isLength({ min: 5, max: 1500 })
      .trim(),
  ],
  isLoggedIn, isCategoryAuthor,
  categoriesController.postEditCategory
);

router.delete("/:slug", isLoggedIn, isCategoryAuthor, categoriesController.deleteCategory);

module.exports = router;

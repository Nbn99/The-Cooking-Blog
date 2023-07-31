const express = require("express");
const path = require("path");
const articleController = require("../controllers/article");
const { body } = require("express-validator");
const { isLoggedIn, isArticleAuthor } = require("../middlewares/is-auth");


const router = express.Router();

router.get("/", articleController.getAllArticles);

router.get("/new", isLoggedIn, articleController.getNewArticle);

router.get("/random", articleController.searchRandom);

router.get("/edit/:slug", isLoggedIn, isArticleAuthor, articleController.getEditArticle);

router.get("/:slug", articleController.getArticle);

router.get("/ingredients/:slug", articleController.getIngredientsPdf);

router.post(
  "/new",
  [
    body("title",)
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("description")
      .isLength({ min: 5 })
      .trim(),
    // body("ingredients", "Ingredients must have at least 3 characters ")
    //   .isLength({ min: 3 })
    //   .trim(),
  ],
  isLoggedIn,
  articleController.postNewArticle
);

router.post(
  "/edit",
  [
    body("title",)
      .isString()
      .isLength({ min: 3 })
      .trim(),
    body("description",)
      .isLength({ min: 5 })
      .trim(),
    // body("ingredients", "Ingredients must have at least 3 characters ")
    //   .isLength({ min: 3 })
    //   .trim(),
  ],
  isLoggedIn, isArticleAuthor,
  articleController.postEditArticle
);
router.post("/search", articleController.searchArticle);

router.delete("/:slug", isLoggedIn, isArticleAuthor, articleController.deleteArticle);

module.exports = router;

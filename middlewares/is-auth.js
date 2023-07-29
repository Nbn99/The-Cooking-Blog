const Article = require('../models/article')
const Users = require('../models/users')
const Comment = require('../models/comment')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/users/login');
    }
    next();
};

module.exports.isArticleAuthor = async(req, res, next) => {
    const { slug } = req.params;
    const article = await Article.findOne({slug: slug});
    if (!article.userId.equals(req.user._id)){
        return res.redirect(`/articles/${slug}`);
    }
    next();
}

module.exports.isCategoryAuthor = async(req, res, next) => {
    const { slug } = req.params;
    const category = await Category.findOne({slug: slug});
    if (!category.userId.equals(req.user._id)){
        return res.redirect(`/category/${slug}`);
    }
    next();
}



// module.exports.isAuthor = async(req, res, next) => {
//     const { id } = req.params;
//     const article = await Article.findById(id);
//     console.log
//     console.log(article.userId)
//     if (article.userId.toString() !== req.user._id.toString()){
//         req.flash('error', 'You do not have permission to do that')
//         return res.redirect('/articles');
//     }
//     next();
// }
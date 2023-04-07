const Article = require('../models/article')
const Users = require('../models/users')


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/users/login');
    }
    next();
};

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
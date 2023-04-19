const mongoose = require('mongoose');
const slugify = require('slugify');

const Schema = mongoose.Schema;

const articleSchema = new Schema({
    
    title: {
        type: String,
        require: true
    },
    description: {
        type: String,
        require: true
    },
    img: {
        type: String,
        require: true
    },
    category: {
        type: String,
        require: true,
        enum: ['Breakfast', 'Lunch', 'Dinner', 'Appetizers', 'Desserts']
    },
    subcategory: {
        type: String,
        require: true,
        enum: ['None','Vegetarian', 'Vegan', 'Gluten Free']
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    slug: {
        type: String,
        require: true,
        unique: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        require: true
      }
})

articleSchema.pre('validate', function (next) {
    if (this.title) {
        this.slug = slugify(this.title, { lower: true, strict: true })
    }
    next()

})

module.exports = mongoose.model('Article', articleSchema)
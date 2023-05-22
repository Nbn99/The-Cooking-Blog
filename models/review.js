const mongoose = require('mongoose');

const Schema = mongoose.Schema

const reviewSchema = new Schema({
    description: {
        type: String,
        require: true
    },
    rating: {
        type: Number, 
        require: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Review', reviewSchema);
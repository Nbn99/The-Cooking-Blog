const mongoose = require('mongoose');
const slugify = require("slugify");

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  name: {
    type: String,
    required: true
  },
  img: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    require: true 
  },
  slug: {
    type: String,
    require: true,
    unique: true,
  },
});

categorySchema.pre("validate", function (next) {
  if (this.name) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});


categorySchema.index({ name: 'text'});

module.exports = mongoose.model('Category', categorySchema);
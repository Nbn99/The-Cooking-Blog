const mongoose = require("mongoose");
const slugify = require("slugify");

const Schema = mongoose.Schema;

const articleSchema = new Schema({
  title: {
    type: String,
    require: true,
  },
  description: {
    type: String,
    require: true,
  },
  img: {
    type: String,
    require: true,
  },
  category:
    {
      type: Array,
      require: true,
      ref: "Category",
    }
  ,
  ingredients: 
    {
      type: Array,
      required: true
    }
  ,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  slug: {
    type: String,
    require: true,
    unique: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

articleSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

articleSchema.index({title: 'text', description: 'text'});

module.exports = mongoose.model("Article", articleSchema);

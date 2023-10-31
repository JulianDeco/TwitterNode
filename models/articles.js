const mongoose = require("mongoose");
const { marked } = require('marked');
const slugify = require('slugify');
const { JSDOM } = require("jsdom");
const createDOMPurify = require('dompurify');
const DOMPurify = createDOMPurify(new JSDOM().window);

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
  },
  markdown: {
    type: String,
    required: true
  },
  image: {
    type: String,
  },
  cloudinary_id: {
    type: String,
  },
  createAt: {
    type: Date,
    default: Date.now
  },
  slug: {
    type: String,
    unique: true,
    required: true
  },
  sanitizedHtml: {
    type: String,
    required: true
  }
},
  { versionKey: false }
);

postSchema.pre("validate", function (next) {
  if (this.title) {
    this.slug = slugify(this.title, { lower: true, strict: true })
  }

  if(this.markdown){
    this.sanitizedHtml = DOMPurify.sanitize(marked(this.markdown))
  }

  next();
})


module.exports = mongoose.model("Article", postSchema)
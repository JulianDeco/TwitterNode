const mongoose = require("mongoose");
const { JSDOM } = require("jsdom");
const createDOMPurify = require('dompurify');
const DOMPurify = createDOMPurify(new JSDOM().window);
const slugify = require('slugify');

const tweetSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true
  },
  owner: {
    type: String
  },
  imagePath: {
    type: String
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

tweetSchema.pre("validate", function (next) {
  if(this.content){
    this.slug = slugify(this.content, { lower: true, strict: true });
    
    this.sanitizedHtml = DOMPurify.sanitize(this.content);
  }

  next();
})

module.exports = mongoose.model("Tweet", tweetSchema);
var mongoose = require('mongoose');

var postSchema = mongoose.Schema({
  caption: String,
  image: String,
  date: {
    type: Date,
    default: Date.now
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  likes: {
    type: Array,
    default: []
  },
  comments:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "comment"
  }]
})

module.exports = mongoose.model("post", postSchema);
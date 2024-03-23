var mongoose = require('mongoose');

var commentSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  comment: String,
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }
})

module.exports = mongoose.model("comment", commentSchema);
var mongoose = require('mongoose');

var storySchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  date: {
    type: Date,
    default: Date.now
  },
  image: String
})

module.exports = mongoose.model("story", storySchema);
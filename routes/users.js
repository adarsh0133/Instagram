var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/finalchallenge');

var userSchema = mongoose.Schema({
  email: String,
  fullname: String,
  username: String,
  password: String,
  profile: {
    type: String,
    default: "default.jpg"
  },
  bio: String,
  gender: String,
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  dm: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  dmreq: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  currentsocket: String,
  requests: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }],
  notifications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "notification"
  }],
  accountType: {
    type: String,
    default: "public"
  },
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "post"
  }],
  stories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "story"
  }],
  currentstory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "story"
  }]
})

userSchema.plugin(plm);

module.exports = mongoose.model('user', userSchema);
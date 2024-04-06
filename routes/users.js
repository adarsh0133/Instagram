var mongoose = require('mongoose');
var plm = require('passport-local-mongoose');

mongoose.connect('mongodb+srv://adarsh90399:1234@cluster0.ozglvms.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

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
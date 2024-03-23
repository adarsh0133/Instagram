var mongoose = require('mongoose');

var notificationSchema = mongoose.Schema({
  notificationType: String,
  date: {
    type: Date,
    default: Date.now
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  },
  toUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user"
  }
})

module.exports = mongoose.model("notification", notificationSchema);
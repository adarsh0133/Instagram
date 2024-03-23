const mongoose = require('mongoose')

var chatSchema = mongoose.Schema({
    fromUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    toUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    msg: String,
    date: {
        type: Date,
        default: Date.now
    },
})

module.exports = mongoose.model('chat', chatSchema)
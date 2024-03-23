const io = require("socket.io")();
const userModel = require("./routes/users");
const chatModel = require("./routes/chat");
const socketapi = {
    io: io
};

io.on("connection", function (socket) {
    console.log("A user connected");

    socket.on("newUserConnected", async (res) => {
        var loggedInUser = await userModel.findOne({ username: res });
        loggedInUser.currentsocket = socket.id;
        await loggedInUser.save();
    });

    socket.on("newmsg", async (res) => {
        var toUser = await userModel.findOne({ username: res.toUser });
        var fromUser = await userModel.findOne({ username: res.fromUser });

        if (fromUser.dm.indexOf(toUser._id) === -1) {
            res.isNewChat = true;
            res.fromUserProfile = fromUser.profile;
            fromUser.dm.push(toUser._id);
            fromUser.save();
            await toUser.dm.push(fromUser._id);
            await toUser.save();
        }

        var newChat = await chatModel.create({
            fromUser: fromUser._id,
            toUser: toUser._id,
            msg: res.msg
        });

        if (toUser.currentsocket) {
            socket.to(toUser.currentsocket).emit('message', res);
        } else {
            console.log('to user offline');
        }
    });
});

module.exports = socketapi;

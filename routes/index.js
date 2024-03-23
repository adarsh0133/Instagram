var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./post');
var commentModel = require('./comment');
var storyModel = require('./story');
var notificationModel = require('./notification');
var chatModel = require('./chat');
const passport = require('passport');
var localStrategy = require('passport-local');
const multer = require('multer');
var path = require('path');

passport.use(new localStrategy(userModel.authenticate()));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/postuploads/')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = Math.floor(Math.random() * 1000000) + dt.getTime() + path.extname(file.originalname);
    cb(null, fn);
  }
})

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4', 'image/avif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/profilepicuploads')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = Math.floor(Math.random() * 1000000) + dt.getTime() + path.extname(file.originalname);
    cb(null, fn);
  }
})

const fileFilter2 = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, JPEG, and PNG file formats are allowed'));
  }
};

const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/storyuploads')
  },
  filename: function (req, file, cb) {
    var dt = new Date();
    var fn = Math.floor(Math.random() * 1000000) + dt.getTime() + path.extname(file.originalname);
    cb(null, fn);
  }
})

const upload = multer({ storage: storage, fileFilter: fileFilter })
const upload2 = multer({ storage: storage2, fileFilter: fileFilter2 })
const upload3 = multer({ storage: storage3, fileFilter: fileFilter })

async function clearSockets() {
  var allUser = await userModel.find({})
  await Promise.all(
    allUser.map(async user => {
      user.currentSocket = ''
      await user.save()
      console.log(user)
    })
  )
}

clearSockets()


router.post('/createpost', isLoggedIn, upload.single('newpost'), function (req, res, next) {
  res.json(req.file.filename);
});

router.post('/updateDP', isLoggedIn, function (req, res, next) {
  upload2.single('newDP')(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log('File upload error:', err.message);
      return res.redirect('back');
    } else if (err) {
      console.log('Internal server error:', err);
      return res.redirect('back');
    }

    if (req.file) {
      req.user.profile = req.file.filename;
      req.user.save()
        .then(() => {
          res.redirect('back');
        })
        .catch((err) => {
          console.log('Error updating profile picture:', err);
          res.redirect('back');
        });
    } else {
      console.log('No file selected');
      res.redirect('back');
    }
  });
});

router.post('/newStory', isLoggedIn, upload3.single('newstory'), function (req, res, next) {
  res.json(req.file.filename)
});

router.get('/addstory/:imagename', isLoggedIn, async (req, res) => {
  var newStory = await storyModel.create({
    image: req.params.imagename,
    user: req.user._id
  })
  await req.user.stories.push(newStory._id)
  await req.user.currentstory.push(newStory._id)
  await req.user.save()
  const oneDayInMs = 24 * 60 * 60 * 1000;
  setTimeout(async () => {
    req.user.currentstory.splice(req.user.currentstory.indexOf(newStory._id), 1)
    await req.user.save();
  }, oneDayInMs);
  res.redirect("back")
})

router.get('/profile/removeDP', isLoggedIn, function (req, res, next) {
  req.user.profile = 'default.jpg'
  req.user.save()
  res.redirect("back")
});

router.post('/newpost', isLoggedIn, function (req, res, next) {
  postModel.create({
    image: req.body.newpost,
    caption: req.body.caption,
    user: req.user._id
  }).then(function (createdPost) {
    req.user.posts.push(createdPost._id)
    req.user.save()
    res.redirect("back")
  })
});

router.post('/updateBio', isLoggedIn, function (req, res, next) {
  req.user.bio = req.body.bio
  req.user.save()
  res.redirect("back")
});

router.get('/', function (req, res, next) {
  res.render('index');
});

router.get('/emailsignup', function (req, res, next) {
  res.render('emailsignup');
});

function getRandomItems(array, count) {
  const shuffled = array.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, array.length));
}

router.get('/feed', isLoggedIn, async function (req, res, next) {
  var allPosts = await postModel.find().populate('user');
  const allUsers = await userModel.find();
  const randomUsers = getRandomItems(allUsers, 5);
  var loggedInUser = await req.user.populate({ path: "following", populate: { path: "posts", populate: "user" } })
  const loggedInUserLatestPost = await postModel.findOne({ user: req.user._id })
    .sort({ date: -1 })
    .populate('user');

  let posts = loggedInUser.following.reduce((posts, user) => {
    return posts.concat(user.posts);
  }, []);

  // Add loggedInUser's latest post (if available) to the posts array
  if (loggedInUserLatestPost) {
    posts.push(loggedInUserLatestPost);
  }

  // Sort posts based on the date (earliest post first)
  posts.sort((a, b) => a.date - b.date)
  res.render('feed', { loggedInUser, allPosts, posts, randomUsers });
  console.log(posts)
});

router.get('/:username', isLoggedIn, async function (req, res, next) {
  var loggedInUser = await req.user.populate('posts following followers')
  res.render('userprofile', { loggedInUser });
});

router.get('/profile/edit', isLoggedIn, (req, res) => {
  res.render('editprofile', { loggedInUser: req.user });
})

router.get('/profile/who_can_see_your_content', isLoggedIn, (req, res) => {
  res.render('editprofile2', { loggedInUser: req.user });
})

router.post('/pvtdets', isLoggedIn, async (req, res) => {
  if (req.body.pvtdets) {
    console.log("pvt kar do")
    req.user.accountType = "private"
    await req.user.save()
  } else {
    console.log("public kar do")
    req.user.accountType = "public"
    await req.user.save()
  }
  console.log(req.body.pvtdets)
  console.log(req.user)
  res.redirect("back")
})

router.get('/like/:postId', isLoggedIn, async (req, res) => {
  var likedPost = await postModel.findOne({ _id: req.params.postId })
  if (likedPost.likes.indexOf(req.user.username) === -1) {
    await likedPost.likes.push(req.user.username)
    await likedPost.save()
  } else {
    await likedPost.likes.splice(likedPost.likes.indexOf(req.user.username), 1)
    await likedPost.save()
  }
  res.json(likedPost)
})

router.get('/getcomments/:postId', isLoggedIn, async (req, res) => {
  var currentPost = await postModel.findOne({ _id: req.params.postId }).populate({ path: 'comments', populate: 'user' }).populate('user')
  res.json(currentPost)
})

router.post('/addcomment/:postId', isLoggedIn, async (req, res) => {
  var currentPost = await postModel.findOne({ _id: req.params.postId })
  var newComment = await commentModel.create({
    user: req.user._id,
    comment: req.body.newcomment,
    post: req.params.postId
  })
  await currentPost.comments.push(newComment._id)
  await currentPost.save()
  var comment = await newComment.populate('user')
  res.json(comment)
})

router.get('/explore/posts', isLoggedIn, async (req, res) => {
  const allPosts = await postModel.find();
  const publicPosts = allPosts.filter(post => post.user !== 'private');

  const mixedPosts = publicPosts.filter(post =>
    post.image.endsWith('.jpg') || post.image.endsWith('.jpeg') || post.image.endsWith('.png') || post.image.endsWith('.mp4')  || post.image.endsWith('avif')
  );

  const mp4Posts = publicPosts.filter(post => post.image.endsWith('.mp4'));

  var arrangedPosts = [];
  const uniqueSet = new Set();

  for (let i = 0; i < mixedPosts.length; i += 4) {
    const tempArr = [];

    for (let j = i; j < i + 4 && j < mixedPosts.length; j++) {
      const currentPost = mixedPosts[j];
      if (!uniqueSet.has(currentPost._id)) {
        tempArr.push(currentPost);
        uniqueSet.add(currentPost._id);
      }
    }

    if (tempArr.length === 4) {
      arrangedPosts.push([tempArr, mp4Posts[i + 4]]);
    } else {
      arrangedPosts.push([tempArr]);
    }
  }

  arrangedPosts.forEach((arr, index) => {
    if(index%2 !== 0 && index !== 0){
      arr = arr.reverse()
    }
  })
  console.log(arrangedPosts)
  
  res.render('explore', { loggedInUser: req.user, arrangedPosts });
})

router.get('/get/reels', isLoggedIn, async (req, res) => {
  var allPosts = await postModel.find().populate('user');
  const reels = allPosts.filter(post => {
    const fileExtension = post.image.split('.').pop().toLowerCase();
    return fileExtension === 'mp4' && post.user.accountType === 'public';
  });

  console.log(reels);
  res.render('reels', { loggedInUser: req.user, reels });
})

router.get('/profile/:username', isLoggedIn, async (req, res) => {
  var clickedUser = await userModel.findOne({ username: req.params.username }).populate('posts')
  res.render('personprofile', { loggedInUser: req.user, clickedUser });
})

router.get('/follow/:username', isLoggedIn, async (req, res) => {
  var user = await userModel.findOne({ username: req.params.username })
  if (user.requests.indexOf(req.user._id) === -1) {
    await user.requests.push(req.user._id)
    await user.save()
    var notification = await notificationModel.create({
      notificationType: "request",
      fromUser: req.user._id,
      toUser: user._id
    })
    await user.notifications.push(notification._id)
    await user.save()
    console.log(user, req.user, notification)
  } else {
    var delNotification = await notificationModel.findOne({ fromUser: req.user, notificationType: "request" })
    await user.requests.splice(user.requests.indexOf(req.user._id), 1)
    await user.notifications.splice(user.notifications.indexOf(delNotification._id), 1)
    await user.save()
    console.log(user, delNotification)
  }
  res.redirect('back')
  console.log("hua")
})

router.get('/unfollow/:username', isLoggedIn, async (req, res) => {
  var user = await userModel.findOne({ username: req.params.username })
  var delNotification = await notificationModel.findOne({ fromUser: req.user, notificationType: "newFollower" })
  await req.user.following.splice(req.user.following.indexOf(user._id), 1)
  await req.user.save()
  await user.followers.splice(user.followers.indexOf(req.user._id), 1)
  await user.notifications.splice(user.notifications.indexOf(delNotification._id), 1)
  await user.save()
  res.redirect("back")
  // res.json({report: "done"})
})

router.get('/get/notifications', isLoggedIn, async (req, res) => {
  var loggedInUser = await userModel.findOne({ username: req.session.passport.user }).populate('requests').populate({ path: 'notifications', populate: 'fromUser' })
  res.json(loggedInUser)
  console.log(loggedInUser);
})

router.get('/acceptreq/:userId/:notificationId', isLoggedIn, async (req, res) => {
  var newFollower = await userModel.findOne({ _id: req.params.userId })
  var notification = await notificationModel.create({
    notificationType: "newFollower",
    fromUser: newFollower._id,
    toUser: req.user._id
  })
  await req.user.notifications.splice(req.user.notifications.indexOf(req.params.notificationId), 1)
  await req.user.notifications.push(notification._id)
  await req.user.followers.push(newFollower._id)
  await req.user.requests.splice(req.user.requests.indexOf(newFollower.userId), 1)
  await req.user.save()
  await newFollower.following.push(req.user._id)
  await newFollower.save()
  res.json({ newFollowerIndex: req.user.following.indexOf(newFollower._id) });
})

router.get('/directfollow/:userId', isLoggedIn, async (req, res) => {
  var newFollower = await userModel.findOne({ _id: req.params.userId })
  var notification = await notificationModel.create({
    notificationType: "newFollower",
    fromUser: req.user._id,
    toUser: newFollower._id
  })
  await newFollower.notifications.push(notification._id)
  await newFollower.followers.push(req.user._id)
  await newFollower.save()
  await req.user.following.push(newFollower._id)
  await req.user.save()
  res.redirect("back")
})

router.get('/deletereq/:userId/:notificationId', isLoggedIn, async (req, res) => {
  console.log("hit hua")
  await req.user.requests.splice(req.user.requests.indexOf(req.params._id), 1)
  await req.user.notifications.splice(req.user.notifications.indexOf(req.params.notificationId), 1)
  await req.user.save()
})

router.get('/search/:username', isLoggedIn, async (req, res) => {
  var regexp = new RegExp("^" + req.params.username);
  var allUsers = await userModel.find({ username: regexp });
  res.json({ allUsers })
})

router.get('/searchfollowing/:username', isLoggedIn, async (req, res) => {
  var regexp = new RegExp("^" + req.params.username);
  var followingIds = req.user.following
  var followerIds = req.user.followers
  const allUsers = await userModel.find({
    $and: [
      { username: regexp },
      {
        $or: [
          { _id: { $in: followingIds } },
          { _id: { $in: followerIds } }
        ]
      }
    ]
  })
  console.log(allUsers)
  res.json(allUsers)
})

router.get('/getdets/:userId', isLoggedIn, async (req, res) => {
  var loggedInUser = await userModel.findOne({ username: req.session.passport.user }).populate({ path: 'following', populate: 'currentstory' })
  var user = await userModel.findOne({ _id: req.params.userId }).populate('currentstory')
  res.json({ loggedInUser, user })
})

router.get('/direct/inbox', isLoggedIn, async (req, res) => {
  var loggedInUser = await req.user.populate('dm')
  const latestChats = [];
  for (const user of loggedInUser.dm) {
    const userChats = await chatModel
      .find({
        $or: [
          { fromUser: loggedInUser._id, toUser: user._id },
          { fromUser: user._id, toUser: loggedInUser._id }
        ]
      })
      .sort({ date: -1 }) // Sort by date to get the latest chat first
      .limit(1) // Retrieve only the latest chat
      .populate('toUser', 'username profile') // Populate fromUser details
      .populate('fromUser', 'username profile')
      .lean(); // Convert Mongoose document to plain JavaScript object

    if (userChats.length > 0) {
      latestChats.push({
        toUser: userChats[0].toUser,
        fromUser: userChats[0].fromUser,
        latestChat: userChats[0].msg,
        date: userChats[0].date
      });
    }
  }
  latestChats.sort((chatA, chatB) => {
    const timeA = new Date(chatA.date).getTime();
    const timeB = new Date(chatB.date).getTime();
    return timeB - timeA; // Sort in descending order (latest chats first)
  });
  res.render('messages', { loggedInUser, latestChats })
})

router.get('/direct/:userId', isLoggedIn, async (req, res) => {
  var toUser = await userModel.findOne({ _id: req.params.userId })
  var loggedInUser = await req.user.populate('dm')
  const latestChats = [];
  for (const user of loggedInUser.dm) {
    const userChats = await chatModel
      .find({
        $or: [
          { fromUser: loggedInUser._id, toUser: user._id },
          { fromUser: user._id, toUser: loggedInUser._id }
        ]
      })
      .sort({ date: -1 }) // Sort by date to get the latest chat first
      .limit(1) // Retrieve only the latest chat
      .populate('toUser', 'username profile') // Populate fromUser details
      .populate('fromUser', 'username profile')
      .lean(); // Convert Mongoose document to plain JavaScript object

    if (userChats.length > 0) {
      latestChats.push({
        toUser: userChats[0].toUser,
        fromUser: userChats[0].fromUser,
        latestChat: userChats[0].msg,
        date: userChats[0].date
      });
    }
  }
  latestChats.sort((chatA, chatB) => {
    const timeA = new Date(chatA.date).getTime();
    const timeB = new Date(chatB.date).getTime();
    return timeB - timeA; // Sort in descending order (latest chats first)
  });
  var userChats = await chatModel.find({
    $or: [
      {
        $and: [
          { fromUser: loggedInUser._id },
          { toUser: toUser._id }
        ]
      },
      {
        $and: [
          { fromUser: toUser._id },
          { toUser: loggedInUser._id }
        ]
      }
    ]
  }).populate('fromUser').populate("toUser")
  res.render('directmessage', { loggedInUser, toUser, userChats, latestChats })
  console.log(userChats)
})

router.post('/register', (req, res) => {
  var newUser = new userModel({
    email: req.body.email,
    fullname: req.body.fullname,
    username: req.body.username,
  })
  userModel.register(newUser, req.body.password)
    .then(() => {
      passport.authenticate('local')(req, res, () => res.redirect('/feed'))
    })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/feed',
  failureRedirect: '/'
}), function (req, res) { });

router.get('/logout/now', function (req, res, next) {
  console.log("hitttt")
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  else {
    res.redirect('/');
  }
}


module.exports = router;

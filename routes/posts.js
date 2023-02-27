const router = require("express").Router();
const Post = require("../models/Post");
const User = require("../models/User");

// create a post

router.post("/", async (req, res) => {
  const newPost = new Post(req.body);
  try {
    const savePost = await newPost.save();
    res.json(savePost);
  } catch (err) {
    res.status(500).json(err);
  }
});

// update a post
router.put("/:id", async (req, res) => {
  try {
    const findPost = await Post.findById(req.params.id);
    if (req.body.userId === findPost.userId || req.body.isAdmin) {
      await findPost.updateOne({ $set: req.body });
      res.status(200).json("this post has been updated");
    } else {
      return res.status(403).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// delete a post

router.delete("/:id", async (req, res) => {
  try {
    const findPost = await Post.findById(req.params.id);
    if (req.body.userId === findPost.userId || req.body.isAdmin) {
      findPost.deleteOne();
      res.status(200).json("this post has been deleted");
    } else {
      return res.status(500).json("You can update only your post!");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// like  a post
router.put("/:id/like", async (req, res) => {
  const findPost = await Post.findById(req.params.id);
  try {
    if (!findPost.likes.includes(req.body.userId)) {
      await findPost.updateOne({ $push: { likes: req.body.userId } });
      res.status(200).send("this post has been liked");
    } else {
      await findPost.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).send("this post has been disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

// get a post
router.get("/:id", async (req, res) => {
  try {
    if (req.params.id === req.body.userId || req.body.isAdmin) {
      const findPost = await Post.findById(req.params.id);
      await res.status(200).send(findPost);
    } else {
      res.status(500).send("you can only get your post");
    }
  } catch {
    res.status(500).json(err);
  }
});

// get timeline posts

router.get("/timeline/all", async (req, res) => {
  try {
    const currentUser = await User.findById(req.body.userId);
    console.log(currentUser._id);
    const userPosts = await Post.find({ userId: currentUser._id });
    const friendsPosts = await Promise.all(
      currentUser.followings.map((friendId) => {
        return Post.find({ userId: friendId });
      })
    );
    console.log(userPosts.concat(...friendsPosts));
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;

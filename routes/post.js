import { Router } from "express";
import { check, validationResult } from "express-validator";
import decode from "../middleware/auth.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
const router = Router();

// @route POST /api/post
// @desc new post
// @acc private

router
  .route("/")
  .post(
    [
      decode,
      [
        check("content").notEmpty().withMessage("Please upload the content"),
        check("type").notEmpty().withMessage("Please select type of post"),
        check("title").notEmpty().withMessage("Caption not found"),
        check("location").notEmpty().withMessage("Please upload the location"),
      ],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { content, type, title, tags, location } = req.body;
      try {
        const user = await User.findById(req.user.id).select("-password");
        const newPost = new Post({
          content,
          type,
          title,
          tags,
          location,
          user,
        });
        const post = await newPost.save();
        res.json({ post });
      } catch (e) {
        res.status(500).json({ msg: "Internal server error" });
      }
    }
  );

// @route GET /api/post/me
// @desc get posts of logged in user
// @acc private

router.route("/me").get(decode, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id }).exec();
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route GET /api/post/:id
// @desc get posts of user based on id
// @acc private

router.route("/:id").get(decode, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id }).exec();
    res.json({ posts });
  } catch (e) {
    if (err.kind == "ObjectId")
      return res.status(404).json({ msg: "No Post Found" });
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route GET /api/post/:type
// @desc get posts based on type
// @acc private

router.route("/:type").get(decode, async (req, res) => {
  try {
    const posts = await Post.find({ type: req.params.type }).exec();
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route GET /api/post/:location
// @desc get posts based on location
// @acc private

router.route("/:location").get(decode, async (req, res) => {
  try {
    const posts = await Post.find({ location: req.params.location }).sort({
      date: -1,
    });
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route GET /api/post/blog/:id
// @desc get blog based on id
// @acc private

router.route("/blog/:id").get(decode, async (req, res) => {
  try {
    const post = await Post.findOne({ id: req.params.id, type: "blog" });
    // console.log(post);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
    res.json({ post });
  } catch (e) {
    if (err.kind == "ObjectId")
      return res.status(404).json({ msg: "No Post Found" });
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route DELETE /api/post/delete/:id
// @desc delete a post
// @acc private
router.route("/delete/:id").delete(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
    if (post.user.toString() !== req.user.id)
      return res.status(401).json({ msg: "User not Authorized" });
    await post.remove();
    res.json({ msg: "Post deleted" });
  } catch (e) {
    if (err.kind == "ObjectId")
      return res.status(404).json({ msg: "No Post Found" });
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route PUT /api/post/like/:id
// @desc like a post
// @acc private
router.route("/like/:id").put(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    )
      return res.status(400).json({ msg: "Post already liked" });
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json({ likes: post.likes });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ msg: "No Post Found" });
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route PUT /api/post/unlike/:id
// @desc unlike a post
// @acc private
router.route("/unlike/:id").put(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res.status(400).json({ msg: "Post hasn't been liked yet" });
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json({ likes: post.likes });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ msg: "No Post Found" });
    res.status(500).json({ msg: "Internal server error" });
  }
});

// @route PUT /api/post/comment/:id
// @desc comment on a post
// @acc private
router
  .route("/comment/:id")
  .put(
    [
      decode,
      [check("comment").notEmpty().withMessage("Comment text cannot be empty")],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { comment } = req.body;
      try {
        const user = await User.findById(req.user.id).select("-password");
        const post = await Post.findById(req.params.id);
        if (!post)
          return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
        post.comments.unshift({ user: user.id, comment });
        await post.save();
        res.json({ comments: post.comments });
      } catch (e) {
        if (e.kind == "ObjectId")
          return res.status(404).json({ msg: "No Post Found" });
        res.status(500).json({ msg: "Internal server error" });
      }
    }
  );

// @route PUT /api/post/uncomment/:id
// @desc delete your comment on a post
// @acc private
router.route("/uncomment/:id/:commentId").put(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
    if (!post.comments)
      return res.status(404).json({ errors: [{ msg: "No Comments Found" }] });
    const removeIndex = post.comments
      .map((comment) => comment.id.toString())
      .indexOf(req.params.commentId);
    if (removeIndex === -1)
      return res.status(404).json({ errors: [{ msg: "No Comments Found" }] });
    if (post.comments[removeIndex].user.toString() !== req.user.id)
      return res.status(401).json({ msg: "User not Authorized" });
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json({ comments: post.comments });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ msg: "No Post Found" });
    res.status(500).json({ msg: "Internal server error" });
  }
});

export default router;

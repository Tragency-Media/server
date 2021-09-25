import { Router } from "express";
import { check, validationResult } from "express-validator";
import decode from "../middleware/auth.js";
import User from "../models/user.model.js";
import Post from "../models/post.model.js";
import v2 from "../utils/cloudinary.js";
import upload from "../utils/multer.js";

const router = Router();

// @route POST /api/post
// @desc new post
// @acc private
router.route("/cloudinary/:id").post(async (req, res) => {
  const post = await Post.findById(req.params.id);
  console.log(post);
  if (!post) return res.status(404).json({ msg: "Post not found!" });
  if (
    req.body.resource_type === "video" ||
    req.body.moderation_status === "approved"
  ) {
    post.content.unshift(req.body.secure_url);
    post.public_id.unshift(req.body.public_id);
  }
  await post.save();
  return res.json({ post });
});
router
  .route("/")
  .post(
    [
      decode,
      upload.array("files", 3),
      [
        check("content").notEmpty().withMessage("Please upload the content"),
        check("type").notEmpty().withMessage("Please select type of post"),
        check("title").notEmpty().withMessage("Caption not found"),
        check("location").notEmpty().withMessage("Please upload the location"),
      ],
    ],
    async (req, res) => {
      let { content, type, title, tags, location } = req.body;
      if (!req.files && type !== "blogs") {
        return res
          .status(400)
          .json({ errors: [{ msg: "No files were uploaded." }] });
      }
      // console.log(req.files);
      try {
        const fileUrls = [];
        const filePublicIds = [];
        const user = await User.findById(req.user.id).select("-password");
        content = type === "blogs" ? content : fileUrls;
        const public_id = type === "blogs" ? [] : filePublicIds;
        const newPost = new Post({
          content,
          public_id,
          type,
          title,
          tags,
          location,
          user,
          reportsLength: 0,
          reports: [],
        });
        const optionsObj =
          type === "vlogs"
            ? {
                resource_type: "video",
                notification_url: `https://tragency-media.herokuapp.com/api/post/cloudinary/${newPost.id}`,
              }
            : {
                moderation: "aws_rek",
                notification_url: `https://tragency-media.herokuapp.com/api/post/cloudinary/${newPost.id}`,
              };
        if (type !== "blogs")
          for (const file of req.files) {
            v2.uploader.upload(file.path, optionsObj);
          }
        const post = await newPost.save();
        return res.json({ post });
        // console.log(result);
      } catch (e) {
        res.status(500).json({ errors: [{ msg: "Internal server error" }] });
      }
    }
  );

// @route GET /api/post/me
// @desc get posts of logged in user
// @acc private

router.route("/me").get(decode, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id });
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route GET /api/post/:id
// @desc get posts based on id
// @acc private

router.route("/:id").get(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No posts found!" }] });
    res.json({ post });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ errors: [{ msg: "No posts found!" }] });
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route GET /api/post/type/:type
// @desc get posts based on type
// @acc private

router.route("/type/:type").get(decode, async (req, res) => {
  try {
    const Users = await User.find();
    // console.log(Users.length);
    const lt = Math.ceil(0.1 * Users.length);
    // console.log(Math.ceil(lt), lt);
    const posts = await Post.find({
      reportsLength: { $lt: lt },
      type: req.params.type,
    })
      .populate({
        path: "user",
        select: "username avatar",
      })
      .skip((req.query.page - 1) * 3)
      .limit(3)
      .sort({ createdAt: -1 });
    if (posts.length === 0)
      return res.status(404).json({ errors: [{ msg: "No posts found!" }] });
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route GET /api/post/:location
// @desc get posts based on location
// @acc private

router.route("/type/:type/:location").get(decode, async (req, res) => {
  try {
    const posts = await Post.find({
      location: {
        $regex: `${req.params.location}`,
        $options: "i",
      },
      type: req.params.type,
    })
      .populate({
        path: "user",
        select: "username avatar",
      })
      .skip((req.query.page - 1) * 3)
      .limit(3)
      .sort({ createdAt: -1 });
    if (posts.length === 0)
      return res.status(404).json({ errors: [{ msg: "No posts found!" }] });
    // console.log(req.params);
    res.json({ posts });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route GET /api/post/blog/:id
// @desc get blog based on id
// @acc private

router.route("/blog/:id").get(decode, async (req, res) => {
  try {
    const post = await Post.findOne({
      id: req.params.id,
      type: "blog",
    }).populate({
      path: "user",
      select: "username avatar",
    });
    // console.log(post);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    res.json({ post });
  } catch (e) {
    if (err.kind == "ObjectId")
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route DELETE /api/post/delete/:id
// @desc delete a post
// @acc private
router.route("/delete/:id").delete(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    if (post.user.toString() !== req.user.id)
      return res
        .status(401)
        .json({ errors: [{ msg: "User not authorized!" }] });
    const optionsObj =
      post.type === "vlogs"
        ? {
            resource_type: "video",
          }
        : {};
    for await (const public_id of post.public_id) {
      await v2.uploader.destroy(public_id, optionsObj);
    }
    await post.remove();
    res.json({ msg: "Post deleted" });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route PUT /api/post/like/:id
// @desc like a post
// @acc private
router.route("/like/:id").put(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    )
      return res.status(400).json({ errors: [{ msg: "Post already liked" }] });
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json({ likes: post.likes });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route PUT /api/post/unlike/:id
// @desc unlike a post
// @acc private
router.route("/unlike/:id").put(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    )
      return res
        .status(400)
        .json({ errors: [{ msg: "Post hasn't been liked yet" }] });
    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json({ likes: post.likes });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});
// @route PUT /api/post/report/:id
// @desc report a post
// @acc private
router.route("/report/:id").put(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    if (
      post.reports.filter((report) => report.user.toString() === req.user.id)
        .length > 0
    )
      return res
        .status(400)
        .json({ errors: [{ msg: "Post already reported" }] });
    post.reports.unshift({ user: req.user.id });
    post.reportsLength += 1;
    await post.save();
    res.json({ reports: post.reports });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
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
        // const user = await User.findById(req.user.id).select("-password");
        const user = await User.findById(req.user.id);
        const post = await Post.findById(req.params.id);
        if (!post)
          return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
        // console.log(user);
        post.comments.unshift({
          user: req.user.id,
          comment,
          avatar: user.avatar,
          username: user.username,
        });
        await post.save();
        res.json({ comments: post.comments });
      } catch (e) {
        if (e.kind == "ObjectId")
          return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
        res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
      }
    }
  );
// @route PUT /api/post/reply/:id/:commentId
// @desc reply to a comment
// @acc private
router
  .route("/reply/:postId/:commentId")
  .put(
    [
      decode,
      [check("reply").notEmpty().withMessage("Comment text cannot be empty")],
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { reply } = req.body;
      try {
        const user = await User.findById(req.user.id);
        const post = await Post.findById(req.params.postId);
        if (!post)
          return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
        const commentIndex = post.comments
          .map((comment) => comment.id.toString())
          .indexOf(req.params.commentId);
        post.comments[commentIndex].replies.unshift({
          user: req.user.id,
          reply,
          avatar: user.avatar,
          username: user.username,
        });
        await post.save();
        res.json({ comments: post.comments });
      } catch (e) {
        if (e.kind == "ObjectId")
          return res.status(404).json({ errors: [{ msg: "No Post Found" }] });
        res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
      }
    }
  );

// @route PUT /api/post/uncomment/:id/:commentId
// @desc delete your comment on a post
// @acc private
router.route("/uncomment/:id/:commentId").put(decode, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post)
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    if (!post.comments)
      return res.status(404).json({ errors: [{ msg: "No Comments Found" }] });
    const removeIndex = post.comments
      .map((comment) => comment.id.toString())
      .indexOf(req.params.commentId);
    if (removeIndex === -1)
      return res.status(404).json({ errors: [{ msg: "No Comment Found" }] });
    if (post.comments[removeIndex].user.toString() !== req.user.id)
      return res
        .status(401)
        .json({ errors: [{ msg: "User not authorized!" }] });
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json({ comments: post.comments });
  } catch (e) {
    if (e.kind == "ObjectId")
      return res.status(404).json({ errors: [{ msg: "No post found!" }] });
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route PUT /api/post/uncomment/:id/:commentId/:replyId
// @desc delete your reply on a comment
// @acc private
router
  .route("/unreply/:id/:commentId/:replyId")
  .put(decode, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post)
        return res.status(404).json({ errors: [{ msg: "No post found!" }] });
      if (!post.comments)
        return res.status(404).json({ errors: [{ msg: "No Comments Found" }] });
      const removeIndex = post.comments
        .map((comment) => comment.id.toString())
        .indexOf(req.params.commentId);
      if (removeIndex === -1)
        return res.status(404).json({ errors: [{ msg: "No Comment Found" }] });
      const replyRemoveIndex = post.comments[removeIndex].replies
        .map((reply) => reply.id.toString())
        .indexOf(req.params.replyId);
      if (replyRemoveIndex === -1)
        return res.status(404).json({ errors: [{ msg: "No Comment Found" }] });
      if (
        post.comments[removeIndex].replies[replyRemoveIndex].user.toString() !==
        req.user.id
      )
        return res
          .status(401)
          .json({ errors: [{ msg: "User not authorized!" }] });
      post.comments[removeIndex].replies.splice(replyRemoveIndex, 1);
      await post.save();
      res.json({ comments: post.comments });
    } catch (e) {
      if (e.kind == "ObjectId")
        return res.status(404).json({ errors: [{ msg: "No post found!" }] });
      res.status(500).json({ errors: [{ msg: "Internal server error" }] });
    }
  });

export default router;

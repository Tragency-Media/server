import { Router } from "express";
import { check, validationResult } from "express-validator";
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import decode from "../middleware/auth.js";
import v2 from "../utils/cloudinary.js";
import upload from "../utils/multer.js";
const router = Router();

// @route GET /api/profile/me
// @desc get current user profile
// @acc private

router.route("/me").get(decode, async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.user.id }).populate({
      path: "user",
      select: "username avatar",
    });
    if (!profile) {
      const user = await User.findById(req.user.id);
      const posts = await Post.find({ user: req.user.id });
      profile = await new Profile({ user, posts });
    }
    return res.json({ profile });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
  }
});

// @route POST /api/profile
// @desc create and update profile
// @acc private
router
  .route("/")
  .post(
    decode,
    upload.single("file"),
    [check("username").notEmpty().withMessage("Username cannot be empty")],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const user = await User.findById(req.user.id).select("-password");
        if (!user)
          return res.status(404).json({ errors: [{ msg: "User not Found" }] });
        let profile = await Profile.findOne({ user: req.user.id })
          .populate({
            path: "user",
            select: "username avatar",
          })
          .populate({ path: "posts" });
        const { bio, username } = req.body;
        const { file: image } = req;
        if (image) {
          if (user.public_id) {
            // console.log(user.public_id);
            await v2.uploader.destroy(user.public_id);
          }
          console.log(image);
          const { secure_url: avatar, public_id } = await v2.uploader.upload(
            image.path
          );
          user.avatar = avatar;
          user.public_id = public_id;
        }
        user.username = username;
        await user.save();
        if (profile) {
          profile.bio = bio;
          await profile.save();
        } else {
          const posts = await Post.find({ user: req.user.id });
          profile = new Profile({ user, bio, posts });
          await profile.save();
        }
        return res.json({ profile, user });
      } catch (error) {
        res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
      }
    }
  );

// @route GET /api/profile/user/:id
// @desc find profile by id
// @acc private

router.route("/user/:id").get(async (req, res) => {
  try {
    let profile = await Profile.findOne({ user: req.params.id })
      .populate({
        path: "user",
        select: "username avatar",
      })
      .populate({ path: "posts" });
    if (!profile) {
      const user = await User.findById(req.params.id);
      if (!user)
        return res.status(404).json({ errors: [{ msg: "No User Found!" }] });
      const posts = await Post.find({ user: req.params.id });
      profile = await new Profile({ user, posts });
      await profile.save();
    }
    return res.json({ profile });
  } catch (error) {
    if (error.kind == "ObjectId")
      return res.status(404).json({ msg: "No Profile Found" });
    res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
  }
});

export default router;

import { Router } from "express";
import gravatar from "gravatar";
import User from "../models/user.model.js";
import Profile from "../models/profile.model.js";
import decode from "../middleware/auth.js";
const router = Router();

// @route GET /api/profile/me
// @desc get current user profile
// @acc private

router.route("/me").get(decode, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      "username"
    );
    if (!profile) return res.status(404).json({ msg: "No Profile Found" });
    return res.json({ profile });
  } catch (e) {
    res.status(500).json({ msg: e });
  }
});

// @route POST /api/profile
// @desc create and update profile
// @acc private
router.route("/").post(decode, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    // console.log(user.email);
    const avatar =
      req.body.avatar ||
      gravatar.url(user.email, { s: "200", r: "pg", d: "mp" }, true);
    // console.log(gravatar);
    let profile = await Profile.findOne({ user: req.user.id });
    if (profile) {
      profile = await Profile.findOneAndUpdate(
        { user: req.user.id },
        { $set: { avatar } },
        { new: true }
      );
      return res.json({ profile });
    } else {
      profile = new Profile({ avatar, user });
      await newProfile.save();
    }
    return res.json({ profile });
  } catch (error) {
    res.status(500).json({ msg: error });
  }
});

// @route GET /api/profile/user/:id
// @desc find profile by id
// @acc private

router.route("/user/:id").get(decode, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.params.id }).populate(
      "user",
      "username"
    );
    if (!profile) return res.status(404).json({ msg: "No Profile Found" });
    return res.json({ profile });
  } catch (error) {
    if (err.kind == "ObjectId")
      return res.status(404).json({ msg: "No Profile Found" });
    res.status(500).json({ msg: error });
  }
});

export default router;

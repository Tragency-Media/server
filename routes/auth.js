import { Router } from "express";
import { check, validationResult } from "express-validator";
// import cookie from "cookie-parser";
import gravatar from "gravatar";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import decode from "../middleware/auth.js";
const router = Router();

// @route GET /api/auth
// @desc get user
// @acc private

router.route("/").get(decode, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ errors: [{ msg: "User Not Found!" }] });
    res.json({ user });
  } catch (e) {
    res.status(400).json({ errors: [{ msg: e }] });
  }
});

// @route POST /api/auth/signin
// @desc login user
// @acc public

router
  .route("/signin")
  .post(
    [
      check("email").isEmail().withMessage("Email Invalid"),
      check("password").not().isEmpty().withMessage("Password Required"),
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password } = req.body;
      try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user)
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        // console.log(password, );
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid Credentials" }] });
        const secret = process.env.SECRET;
        let dt = new Date();
        dt.setDate(dt.getDate() + 2);
        // console.log(dt);
        jwt.sign(
          { user: { id: user.id } },
          secret,
          { expiresIn: "2 days" },
          (e, token) => {
            if (e) throw e;
            res.cookie("token", token, {
              expires: dt,
              httpOnly: true,
            });
            return res.json({ token });
          }
        );
      } catch (e) {
        return res.status(500).json({ errors: [{ msg: e }] });
      }
    }
  );
// @route POST /api/auth/signup
// @desc register user
// @acc public

router
  .route("/signup")
  .post(
    check("username").not().isEmpty().withMessage("Username cannot be empty"),
    check("email").isEmail().withMessage("Email invalid"),
    check("password")
      .isLength({ min: 5 })
      .withMessage("Password must be at least 5 chars long")
      .matches(/\d/)
      .withMessage("Password must contain a number"),
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { email, password, username } = req.body;
      try {
        const userExists =
          (await User.findOne({ email })) || (await User.findOne({ username }));
        if (userExists) {
          // console.log(userExists);
          return res
            .status(400)
            .json({ errors: [{ msg: "User already exists" }] });
        }
        const avatar = gravatar.url(
          email,
          { s: "200", r: "pg", d: "mp" },
          true
        );
        const newUser = new User({
          email: email.toLowerCase(),
          password,
          username,
          avatar,
        });
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newUser.password, salt);
        newUser.password = hash;
        await newUser.save();
        const secret = process.env.SECRET;
        let dt = new Date();
        dt.setDate(dt.getDate() + 2);
        jwt.sign(
          { user: { id: newUser.id } },
          secret,
          { expiresIn: "2 days" },
          (e, token) => {
            if (e) throw e;
            res.cookie("token", token, {
              expires: dt,
              httpOnly: true,
            });
            return res.json({ token });
          }
        );
      } catch (e) {
        return res.status(500).json({ errors: [{ msg: e }] });
      }
    }
  );

// @route POST /api/auth/logout
// @desc logout user
// @acc private

router.route("/logout").post(decode, async (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0), httpOnly: true });
    return res.json({ msg: "Logged Out!" });
  } catch (e) {
    return res.status(500).json({ errors: [{ msg: e }] });
  }
});

export default router;

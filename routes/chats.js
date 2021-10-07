import { Router } from "express";
import ChatRoom from "../models/chatRoom.model.js";
import User from "../models/user.model.js";
import { check, validationResult } from "express-validator";
import v2 from "../utils/cloudinary.js";
import upload from "../utils/multer.js";
import decode from "../middleware/auth.js";
const router = Router();

// @route GET /api/rooms/
// @desc get all chatrooms
// @acc private
router.get("/", async (req, res) => {
  try {
    const chatRooms = await ChatRoom.find({ approved: true }).populate({
      path: "users.user",
      select: "-password",
    });
    return res.json({ chatRooms });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route POST /api/rooms/
// @desc create new chatrooms
// @acc private
router.post(
  "/",
  [
    decode,
    upload.single("file"),
    [
      check("title").notEmpty().withMessage("Title cannot be empty"),
      check("description")
        .notEmpty()
        .withMessage("Description cannot be empty"),
    ],
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      if (!req.file) {
        return res
          .status(400)
          .json({ errors: [{ msg: "No Group Image was uploaded." }] });
      }
      const { title, description, maxLimit } = req.body;
      const existingChatRoom = await ChatRoom.findOne({ title });
      if (existingChatRoom)
        return res.status(400).json({
          errors: [{ msg: "Chat Room with same name already exists" }],
        });
      const { file } = req;
      const { secure_url: profileImage, public_id } = await v2.uploader.upload(
        file.path
      );
      // console.log(title, description, maxLimit);
      //   console.log(response);
      const newChatRoom = new ChatRoom({
        admin: req.user.id,
        users: [{ user: req.user.id }],
        messages: [],
        maxLimit,
        title,
        description,
        profileImage,
        public_id,
      });
      //   console.log("newChatRoom");
      const room = await newChatRoom.save();
      return res.json({ room });
    } catch (e) {
      // console.log(e);
      return res
        .status(500)
        .json({ errors: [{ msg: "Internal server error" }] });
    }
  }
);

// @route GET /api/rooms/:id
// @desc get room based on id
// @acc private
router.route("/:id").get(decode, async (req, res) => {
  try {
    const chatRoom = await ChatRoom.findById(req.params.id)
      .populate({
        path: "users.user",
        select: "-password",
      })
      .populate({ path: "messages.user", select: "-password" });
    if (!chatRoom)
      return res.status(404).json({ errors: [{ msg: "No Chat Room Found" }] });
    const userExists = chatRoom.users.find(
      (user) => user.user.id.toString() === req.user.id
    );
    // console.log(chatRoom.users.)
    if (!userExists) {
      chatRoom.users.unshift({ user: req.user.id });
      await chatRoom.save();
      return res.json({ chatRoom });
    }
    // console.log(chatRoom);
    return res.json({ chatRoom });
  } catch (e) {
    console.log(e);
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route PUT /api/rooms/:id
// @desc add logged in user to room
// @acc private
// router.route("/:id").put(decode, async (req, res) => {
//   try {
//     const chatRoom = await ChatRoom.findById(req.params.id);
//     if (!chatRoom)
//       return res.status(404).json({ errors: [{ msg: "No Chat Room Found" }] });
//     const user = await User.findById(req.user.id);
//     //   console.log(req.files);
//     const { username, avatar } = user;
//     chatRoom.users.unshift({ user: req.user.id, username, avatar });
//     await chatRoom.save();
//     return res.json({ chatRoom });
//   } catch (e) {
//     res.status(500).json({ errors: [{ msg: "Internal server error" }] });
//   }
// });

// @route PUT /api/rooms/message/:id
// @desc add message to room
// @acc private
router
  .route("/message/:id")
  .put(
    decode,
    [check("message").notEmpty().withMessage("message cannot be empty")],
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }
        const chatRoom = await ChatRoom.findById(req.params.id);
        const { message, user, date } = req.body;
        if (!chatRoom)
          return res
            .status(404)
            .json({ errors: [{ msg: "No Chat Room Found" }] });
        chatRoom.messages.push({
          user,
          message,
          date,
        });
        // console.log(message, username, avatar, user, date);
        await chatRoom.save();
        await chatRoom.populate({
          path: "messages.user",
          select: "-password",
        });
        // console.log("hello");
        return res.json({ chatRoom });
      } catch (e) {
        res.status(500).json({ errors: [{ msg: "Internal server error" }] });
      }
    }
  );

export default router;

import mongoose from "mongoose";

const chatRoomSchema = new mongoose.Schema(
  {
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    approved: {
      type: Boolean,
      default: false,
    },
    maxLimit: {
      type: Number,
      default: 20,
    },
    title: {
      type: String,
      required: true,
      index: true,
    },
    profileImage: {
      type: String,
    },
    public_id: { type: String },
    description: {
      type: String,
      required: true,
    },
    users: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        username: {
          type: String,
        },
        avatar: { type: String },
      },
    ],
    messages: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        username: {
          type: String,
        },
        avatar: { type: String },
        message: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
  },
  { timestamps: true }
);

const chatRoom = new mongoose.model("chatRoom", chatRoomSchema);
export default chatRoom;

import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    type: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    tags: {
      type: String,
    },
    location: {
      type: String,
      required: true,
    },
    content: [
      {
        type: String,
        required: true,
      },
    ],
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    public_id: [{ type: String }],
    comments: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        comment: {
          type: String,
          required: true,
        },
        username: {
          type: String,
        },
        avatar: { type: String },
        replies: [
          {
            user: {
              type: mongoose.Schema.Types.ObjectId,
              ref: "User",
            },
            username: {
              type: String,
            },
            avatar: { type: String },
            reply: {
              type: String,
              required: true,
            },
            date: {
              type: Date,
              default: Date.now(),
            },
          },
        ],
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    ],
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    reportsLength: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Post = new mongoose.model("Post", postSchema);
export default Post;

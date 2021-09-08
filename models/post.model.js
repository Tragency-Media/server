import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
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
  content: {
    type: String,
    required: true,
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        comment: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
          default: Date.now(),
        },
      },
    },
  ],
  date: {
    type: Date,
    default: Date.now(),
  },
});

const Post = new mongoose.model("Post", postSchema);
export default Post;

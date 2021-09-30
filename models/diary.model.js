import mongoose from "mongoose";

const diarySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },

    published: {
      type: Date,
      index: true,
      default: Date.now(),
    },
  },
  { timestamps: true }
);

const Diary = new mongoose.model("Diary", diarySchema);
export default Diary;

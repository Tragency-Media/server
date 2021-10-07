import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      required: true,
    },
    viewed: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Notification = new mongoose.model("Notifications", notificationSchema);
export default Notification;

import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
  bio: { type: String, default: "" },
  posts: [{ type: mongoose.Schema.Types.ObjectID, ref: "Post" }],
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;

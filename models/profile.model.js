import mongoose from "mongoose";

const profileSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectID, ref: "User" },
  avatar: { type: String },
});

const Profile = mongoose.model("Profile", profileSchema);
export default Profile;

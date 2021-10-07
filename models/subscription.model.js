import mongoose from "mongoose";
const subscriptionSchema = new mongoose.Schema({
  user: { type: String, required: true },
  endpoint: { type: String, unique: true, required: true },
  expirationTime: { type: Number, required: false },
  keys: {
    auth: { type: String, required: true },
    p256dh: { type: String, required: true },
  },
});

const Subscription = new mongoose.model("Subscription", subscriptionSchema);
export default Subscription;

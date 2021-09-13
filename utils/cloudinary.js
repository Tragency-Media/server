import cloudinary from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
const v2 = cloudinary.v2;
v2.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

export default v2;

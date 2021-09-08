import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import profileRoute from "./routes/profile.js";
import postRoute from "./routes/post.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, (e) => console.log(e));
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("wohoooooo mongodb connected");
});

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/post", postRoute);

app.listen(port, () => {
  console.log(`server on port ${port}`);
});

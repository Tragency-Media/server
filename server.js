import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
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
app.use(cookieParser());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, (e) => console.log(e));
// const connection = mongoose.connection;
// connection.once("open");

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/post", postRoute);

// if (process.env.NODE_ENV === "production") {
app.use(express.static("client/build"));
app.get("*", (req, res) => {
  res.sendFile(path.join(path.resolve(), "client", "build", "index.html"));
});
// }

app.listen(port);

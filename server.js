import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import authRoute from "./routes/auth.js";
import profileRoute from "./routes/profile.js";
import postRoute from "./routes/post.js";
import chatRoomRoute from "./routes/chats.js";
import diaryRoute from "./routes/diary.js";
import {
  addUser,
  getAllUsers,
  getCurrentUser,
  userLeave,
} from "./utils/users.js";

dotenv.config();

const app = express();
const server = createServer(app);
const port = process.env.PORT || 5000;
const io = new Server(server);
app.use(cors());
app.use(express.json());
app.use(cookieParser());

const uri = process.env.ATLAS_URI;
mongoose.connect(uri, (e) => console.log(e));

app.use("/api/auth", authRoute);
app.use("/api/profile", profileRoute);
app.use("/api/post", postRoute);
app.use("/api/diary", diaryRoute);
app.use("/api/rooms", chatRoomRoute);

io.on("connection", (socket) => {
  // socket.send("Hello!");
  // console.log("connected");
  socket.on("joinRoom", ({ room, username, avatar, userId }) => {
    const user = addUser({ room, username, avatar, id: socket.id, userId });
    socket.join(user.room);
    const activeUsers = getAllUsers(user.room);
    // console.log(activeUsers);
    io.to(user.room).emit("onlineUsers", activeUsers);
  });
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    // console.log(user.room);
    socket.broadcast.to(user.room).emit("chatMessage", message);
  });
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);
    // console.log(user, user.room);
    if (user) {
      const activeUsers = getAllUsers(user.room);
      socket.broadcast.to(user.room).emit("onlineUsers", activeUsers);
    }
  });
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static("build"));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve("build", "index.html"));
  });
}

server.listen(port);

import { Router } from "express";
import Notification from "../models/notification.model";

const router = Router();

// @route GET /api/notifications
// @desc logged in user notifications
// @acc private
router.get("/", decode, (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id });
    res.json({ notifications });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

// @route POST /api/notifications
// @desc add notification
// @acc private
router.get("/", decode, (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.json({ msg: "Notification sent" });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

import { Router } from "express";
import webpush from "web-push";
import decode from "../middleware/auth.js";
import ChatRoom from "../models/chatRoom.model.js";
import Notification from "../models/notification.model.js";
import Subscription from "../models/subscription.model.js";

const router = Router();

const publicVapidKey =
  "BINa5yF4b57BFKnAggUVkfXOS4WdvqhHvv9Gh-VQoQmUyXfN3p7aV0CfkRL8YAjAsboGqcKzbflcucDsuD37JTA";
// const publicVapidKey =
//   "BOv7ChyuUEAvFN2-g8EXQO-0DpD3ZqYehRXVNbKENsyRpZbfQsHmtKTfYTChQrgOb55pDdGrWMagRuhEvZ8P56g";
const privateVapidKey = "XDV8FyPmgXCeesL50pGqD8pWoCQbG-WPw6Ql0Pg_Hm8";
// const privateVapidKey = "3R43r5WhH0IOz4lKUDqLHWTXjfC8scXn2KIVQUaix6M";

webpush.setVapidDetails(
  "mailto:vverma270705@gmail.com",
  publicVapidKey,
  privateVapidKey
);

// @route GET /api/notification/subscribe
// @desc Subscribe to notifications
// @acc private
router.route("/subscribe").post(decode, async (req, res) => {
  try {
    const { subscription } = req.body;
    res.status(201).json({});
    const newSubscription = new Subscription({
      user: req.user.id,
      ...subscription,
    });
    await newSubscription.save();
    // console.log(newSubscription);
  } catch (e) {
    console.log(e);
  }
});

// @route GET /api/notification/broadcast
// @desc broadcast notifications
// @acc private
router.route("/broadcast/:roomId").post(decode, async (req, res) => {
  try {
    const { options } = req.body;
    const { roomId } = req.params;
    // Create payload
    const payload = JSON.stringify(options);
    let { users } = await ChatRoom.findById(roomId);
    users = users.map((user) => user.user.toString());
    // console.log(users);
    let subscriptions = await Subscription.find({
      user: { $ne: req.user.id },
    });
    // console.log(subscriptions);
    subscriptions = subscriptions.filter(({ user }) =>
      users.includes(user.toString())
    );
    // console.log(subscriptions);
    const notifications = [];
    subscriptions.forEach((subscription) => {
      notifications.push(webpush.sendNotification(subscription, payload));
    });
    await Promise.all(notifications);
    // console.log(notifications);
    res.status(201).json({});
  } catch (e) {
    console.log(e);
  }
});

// @route GET /api/notification/:id
// @desc send notification to user
// @acc private
router.route("/:id").post(decode, async (req, res) => {
  try {
    const { options } = req.body;
    const { id } = req.params;
    if (id === req.user.id) return res.json({});
    // Create payload
    const payload = JSON.stringify(options);
    const subscriptions = await Subscription.find({ user: id });
    console.log(subscriptions);
    const notifications = [];
    subscriptions.forEach((subscription) => {
      notifications.push(webpush.sendNotification(subscription, payload));
    });
    await Promise.all(notifications);
    res.status(201).json({});
  } catch (e) {
    console.log(e);
  }
});

// @route GET /api/notifications
// @desc logged in user notifications
// @acc private
router.get("/", decode, async (req, res) => {
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
router.post("/", decode, async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.json({ notification });
  } catch (e) {
    res.status(500).json({ errors: [{ msg: "Internal server error" }] });
  }
});

export default router;

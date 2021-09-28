import { Router } from "express";
import { check, validationResult } from "express-validator";
import decode from "../middleware/auth.js";
import Diary from "../models/diary.model.js";

const router = Router();

//Create/Update request
// @route POST /api/diary/
// @desc updating the notes
router
  .route("/:date")
  .post(
    decode,
    [
      check("content").notEmpty().withMessage("Diary cannot be empty"),
      check("title").notEmpty().withMessage("Title is mandatory"),
      check("published").notEmpty().withMessage("Select date"),
    ],
    async (req, res) => {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(404).json({ errors: errors.array() });
      }

      try {
        const newDiary = req.body;

        // product is exists or not if exists then update else add new diary
        let diary = await Diary.find({ published: req.params.date });
        if (diary) {
          // update
          diary = await Diary.findOneAndUpdate(
            { published: req.params.date, user: req.user.id },
            { $set: { newDiary } },
            { new: true }
          );
          res.status(200).json({
            result: "Diary is Updated",
            diary: diary,
          });
        }

        //Adding data to the database
        else {
          diary = new Diary(newDiary);
          await diary.save();
        }
        return res.json({ diary });
      } catch (e) {
        res.status(500).json({ errors: [{ msg: "Internal server error" }] });
      }
    }
  );

//get data by using date
router.route("/:date").get(decode, async (req, res) => {
  try {
    let diary = await Diary.find({
      published: req.params.date,
      user: req.user.id,
    });
    if (!diary) return res.status(404).json({ msg: "Diary Not Found" });
    res.json({ diary });
  } catch (e) {
    console.error(e);
    res.status(500).json({ errors: [{ msg: "Internal Server Error" }] });
  }
});

export default router;

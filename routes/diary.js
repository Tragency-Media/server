import { Router } from "express";
import { check } from "express-validator";
import Diary from "../models/diary.model.js";

const router = Router();

//Create/Update request
// @route POST /api/diary/
// @desc updating the notes
router
  .route("/")
  .post(
    [
      check("what data you want to validate")
        .notEmpty()
        .withMessage("you need to add some message here"),
    ],
    async (req, res) => {
      try {
        const newDiary = {};

        // product is exists or not if exists then update else add new diary
        let diary = await Diary.find({ published: req.params.date });
        if (diary) {
          // update
          diary = await Diary.find(
            req.params.date,
            {
              $set: newDiary,
            },
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
        return res.json({ result: "Diary is added", diary: diary });
      } catch (e) {
        console.error(e);
        res.status(500).json({
          msg: e.message,
        });
      }
    }
  );

//get data by using date
router.route("/:date").get(async (req, res) => {
  try {
    let diary = await Diary.find({ published: req.params.date });
    res.status(200).json(diary);
  } catch (e) {
    console.error(e);
    res.status(500).json({ errors: [{ msg: "Server Error" }] });
  }
});

export default router;

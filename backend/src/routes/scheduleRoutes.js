const express = require("express");
const router = express.Router();
const {
  getAllSchedules,
  createSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

router.get("/", getAllSchedules);
router.post("/", createSchedule);
router.delete("/:id", deleteSchedule);

module.exports = router;
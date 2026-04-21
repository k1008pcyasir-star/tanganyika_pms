const express = require("express");
const router = express.Router();
const {
  getLatestRotationHistory,
  createRotationHistory,
} = require("../controllers/rotationController");

router.get("/", getLatestRotationHistory);
router.post("/", createRotationHistory);

module.exports = router;
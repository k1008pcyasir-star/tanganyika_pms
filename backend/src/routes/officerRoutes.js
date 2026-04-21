const express = require("express");
const router = express.Router();
const {
  getAllOfficers,
  getOfficerStats,
  createOfficer,
  updateOfficer,
  deleteOfficer,
} = require("../controllers/officerController");

router.get("/stats", getOfficerStats);
router.get("/", getAllOfficers);
router.post("/", createOfficer);
router.put("/:id", updateOfficer);
router.delete("/:id", deleteOfficer);

module.exports = router;
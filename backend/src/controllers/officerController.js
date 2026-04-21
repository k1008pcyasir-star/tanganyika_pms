const pool = require("../config/db");

const getAllOfficers = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM officers ORDER BY id DESC");

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting officers:", error);
    res.status(500).json({
      message: "Failed to fetch officers",
      error: error.message,
    });
  }
};

const getOfficerStats = async (req, res) => {
  try {
    const totalOfficersResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM officers"
    );

    const totalMainSchedulesResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM saved_schedules WHERE schedule_type = 'main'"
    );

    const totalPatrolSchedulesResult = await pool.query(
      "SELECT COUNT(*)::int AS total FROM saved_schedules WHERE schedule_type = 'patrol'"
    );

    res.status(200).json({
      totalOfficers: totalOfficersResult.rows[0].total,
      totalMainSchedules: totalMainSchedulesResult.rows[0].total,
      totalPatrolSchedules: totalPatrolSchedulesResult.rows[0].total,
    });
  } catch (error) {
    console.error("Error getting officer stats:", error);
    res.status(500).json({
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

const createOfficer = async (req, res) => {
  try {
    const { force_number, full_name, rank } = req.body;

    if (!full_name || !rank) {
      return res.status(400).json({
        message: "full_name and rank are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO officers (force_number, full_name, rank)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [force_number || null, full_name, rank]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating officer:", error);
    res.status(500).json({
      message: "Failed to create officer",
      error: error.message,
    });
  }
};

const updateOfficer = async (req, res) => {
  try {
    const { id } = req.params;
    const { force_number, full_name, rank } = req.body;

    if (!full_name || !rank) {
      return res.status(400).json({
        message: "full_name and rank are required",
      });
    }

    const result = await pool.query(
      `UPDATE officers
       SET force_number = $1,
           full_name = $2,
           rank = $3
       WHERE id = $4
       RETURNING *`,
      [force_number || null, full_name, rank, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Officer not found",
      });
    }

    res.status(200).json(result.rows[0]);
  } catch (error) {
    console.error("Error updating officer:", error);
    res.status(500).json({
      message: "Failed to update officer",
      error: error.message,
    });
  }
};

const deleteOfficer = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM officers WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Officer not found",
      });
    }

    res.status(200).json({
      message: "Officer deleted successfully",
      officer: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting officer:", error);
    res.status(500).json({
      message: "Failed to delete officer",
      error: error.message,
    });
  }
};

module.exports = {
  getAllOfficers,
  getOfficerStats,
  createOfficer,
  updateOfficer,
  deleteOfficer,
};
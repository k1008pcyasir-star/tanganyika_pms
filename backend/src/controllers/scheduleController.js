const pool = require("../config/db");

const getAllSchedules = async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM saved_schedules ORDER BY id DESC"
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting schedules:", error);
    res.status(500).json({
      message: "Failed to fetch schedules",
      error: error.message,
    });
  }
};

const createSchedule = async (req, res) => {
  try {
    const {
      schedule_type,
      title,
      date_from,
      date_to,
      schedule_date,
      patrol_time,
      zamu_officer,
      zamu_officer_phone,
      inspector_officer,
      inspector_officer_phone,
      signature_name,
      signature_rank,
      signature_title,
      fixed_sections,
      active_sections,
      patrol_officers,
    } = req.body;

    if (!schedule_type || !title) {
      return res.status(400).json({
        message: "schedule_type and title are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO saved_schedules (
        schedule_type,
        title,
        date_from,
        date_to,
        schedule_date,
        patrol_time,
        zamu_officer,
        zamu_officer_phone,
        inspector_officer,
        inspector_officer_phone,
        signature_name,
        signature_rank,
        signature_title,
        fixed_sections,
        active_sections,
        patrol_officers
      )
      VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8,
        $9, $10, $11, $12, $13, $14, $15, $16
      )
      RETURNING *`,
      [
        schedule_type,
        title,
        date_from || null,
        date_to || null,
        schedule_date || null,
        patrol_time || null,
        zamu_officer || null,
        zamu_officer_phone || null,
        inspector_officer || null,
        inspector_officer_phone || null,
        signature_name || null,
        signature_rank || null,
        signature_title || null,
        fixed_sections ? JSON.stringify(fixed_sections) : null,
        active_sections ? JSON.stringify(active_sections) : null,
        patrol_officers ? JSON.stringify(patrol_officers) : null,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error creating schedule:", error);
    res.status(500).json({
      message: "Failed to create schedule",
      error: error.message,
    });
  }
};

const deleteSchedule = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "DELETE FROM saved_schedules WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Schedule not found",
      });
    }

    res.status(200).json({
      message: "Schedule deleted successfully",
      schedule: result.rows[0],
    });
  } catch (error) {
    console.error("Error deleting schedule:", error);
    res.status(500).json({
      message: "Failed to delete schedule",
      error: error.message,
    });
  }
};

module.exports = {
  getAllSchedules,
  createSchedule,
  deleteSchedule,
};
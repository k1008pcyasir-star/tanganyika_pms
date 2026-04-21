const pool = require("../config/db");

const getLatestRotationHistory = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT ON (officer_id)
        id,
        officer_id,
        section_name,
        section_group,
        date_from,
        date_to,
        saved_at
      FROM officer_rotation_history
      ORDER BY officer_id, saved_at DESC, id DESC
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Error getting rotation history:", error);
    res.status(500).json({
      message: "Failed to fetch rotation history",
      error: error.message,
    });
  }
};

const createRotationHistory = async (req, res) => {
  try {
    const { entries } = req.body;

    if (!Array.isArray(entries) || entries.length === 0) {
      return res.status(400).json({
        message: "entries array is required",
      });
    }

    const insertedRows = [];

    for (const entry of entries) {
      const {
        officer_id,
        section_name,
        section_group,
        date_from,
        date_to,
      } = entry;

      if (!officer_id || !section_name || !section_group) {
        continue;
      }

      const result = await pool.query(
        `INSERT INTO officer_rotation_history (
          officer_id,
          section_name,
          section_group,
          date_from,
          date_to
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *`,
        [
          officer_id,
          section_name,
          section_group,
          date_from || null,
          date_to || null,
        ]
      );

      insertedRows.push(result.rows[0]);
    }

    res.status(201).json(insertedRows);
  } catch (error) {
    console.error("Error creating rotation history:", error);
    res.status(500).json({
      message: "Failed to create rotation history",
      error: error.message,
    });
  }
};

module.exports = {
  getLatestRotationHistory,
  createRotationHistory,
};
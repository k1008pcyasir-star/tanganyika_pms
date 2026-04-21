require("dotenv").config();

const bcrypt = require("bcryptjs");
const pool = require("./config/db");

async function createOrUpdateAdmin() {
  try {
    const username = "admin";
    const plainPassword = "tanganyika";

    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    const existingAdmin = await pool.query(
      "SELECT * FROM admins WHERE username = $1 LIMIT 1",
      [username]
    );

    if (existingAdmin.rows.length > 0) {
      await pool.query(
        "UPDATE admins SET password = $1 WHERE username = $2",
        [hashedPassword, username]
      );

      console.log("Admin password updated successfully");
      console.log("Username:", username);
      console.log("Password:", plainPassword);
    } else {
      await pool.query(
        `INSERT INTO admins (username, password)
         VALUES ($1, $2)`,
        [username, hashedPassword]
      );

      console.log("Admin created successfully");
      console.log("Username:", username);
      console.log("Password:", plainPassword);
    }
  } catch (error) {
    console.error("Error creating/updating admin:", error);
  } finally {
    await pool.end();
  }
}

createOrUpdateAdmin();
// express related
const express = require("express");
const router = express.Router();

// dotenv related
const dotenv = require("dotenv");
dotenv.config({ path: "./.env", encoding: "utf-8" });

// postgres related
const pool = require("../db");

router.post("/login", async (req, res, next) => {
  try {
    const { name, email, imageUrl } = req.body;

    // create username from the email
    let username = "";
    for (let i = 0; i < email.length && email[i] !== "@"; i++) {
      username += email[i];
    }
    // check if we have this user's data in db already
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (user.rowCount > 0) {
      // already exists then update its last login time

      const updatedUser = await pool.query(
        "UPDATE users SET last_login = $1, imageUrl = $2 WHERE username = $3 RETURNING *",
        [new Date(), imageUrl, username]
      );
      res.status(200).json({
        status: "success",
        user_id: updatedUser.rows[0].user_id,
      });
    } else {
      // doesn't exist then insert
      const newUser = await pool.query(
        "INSERT INTO users(username, email, full_name, last_login, created_on, imageUrl) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [username, email, name, new Date(), new Date(), imageUrl]
      );
      res.status(200).json({
        status: "success",
        user_id: newUser.rows[0].user_id,
      });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;

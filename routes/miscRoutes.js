// express related
const express = require("express");
const router = express.Router();

// dotenv related
const dotenv = require("dotenv");
dotenv.config({ path: "./.env", encoding: "utf-8" });

// postgres related
const pool = require("../db");

// error utility
const ErrorUtility = require("./utilities/errorUtility.js");

router.get("/boards/:boardId/users/:userId", async (req, res, next) => {
  try {
    const { userId, boardId } = req.params;
    const { operation } = req.query;

    const enrty = await pool.query(
      `SELECT * FROM users_${operation}s_boards WHERE user_id = $1 AND board_id = $2`,
      [userId, boardId]
    );

    if (enrty.rows.length > 0) {
      // user has done the operation
      res.json({ done: true });
    } else {
      //user has not done operaton
      res.json({ done: false });
    }
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.get("/comments/:commentId/users/:userId", async (req, res, next) => {
  try {
    const { userId, commentId } = req.params;
    const { operation } = req.query;

    const enrty = await pool.query(
      `SELECT * FROM users_${operation}s_comments WHERE user_id = $1 AND comment_id = $2`,
      [userId, commentId]
    );

    if (enrty.rows.length > 0) {
      // user has done the operation
      res.json({ done: true });
    } else {
      //user has not done operaton
      res.json({ done: false });
    }
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

module.exports = router;

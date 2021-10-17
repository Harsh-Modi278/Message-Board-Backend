// express related
const express = require("express");
const router = express.Router();

// dotenv related
const dotenv = require("dotenv");
dotenv.config({ path: "./.env", encoding: "utf-8" });

// postgres related
const pool = require("../db");

router.get("/boards/:boardId/users/:userId", async (req, res, next) => {
  try {
    let { userId, boardId } = req.params;
    const { operation } = req.query;
    userId = parseInt(userId);
    boardId = parseInt(boardId);

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
    console.log(err.message);
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/comments/:commentId/users/:userId", async (req, res, next) => {
  try {
    let { userId, commentId } = req.params;
    const { operation } = req.query;
    userId = parseInt(userId);
    commentId = parseInt(commentId);

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
    console.log(err.message);
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;

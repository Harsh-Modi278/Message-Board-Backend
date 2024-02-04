// express related
const express = require("express");
const router = express.Router();

// dotenv related
const dotenv = require("dotenv");
dotenv.config({ path: "./.env", encoding: "utf-8" });

// postgres related
const pool = require("../db");

// error utility
const ErrorUtility = require("./utilities/errorUtility");

router.post("/:commentId/upvote", async (req, res, next) => {
  try {
    let { user_id } = req.body;
    let { commentId } = req.params;
    user_id = parseInt(user_id);
    commentId = parseInt(commentId);

    // check if already upvoted by same user then downvote
    const enrty = await pool.query(
      "SELECT * FROM users_upvotes_comments WHERE user_id = $1 AND comment_id = $2",
      [user_id, commentId]
    );

    const comment = await pool.query(
      "SELECT upvotes FROM comments WHERE comment_id = $1",
      [commentId]
    );

    if (enrty.rows.length > 0) {
      // it has already been upvoted by the same user
      const updatedComment = await pool.query(
        "UPDATE comments SET upvotes = upvotes - 1 WHERE comment_id = $1 RETURNING *",
        [commentId]
      );

      //remove the log that user has upvoted the comment
      const deletedEntry = await pool.query(
        "DELETE FROM users_upvotes_comments WHERE user_id = $1 AND comment_id = $2",
        [user_id, commentId]
      );

      res.json(updatedComment.rows[0]);
    } else {
      const updatedComment = await pool.query(
        "UPDATE comments SET upvotes = upvotes + 1 WHERE comment_id = $1 RETURNING *",
        [commentId]
      );

      if (comment.rows[0].upvotes + 1 != 0) {
        const result = await pool.query(
          "INSERT INTO users_upvotes_comments (user_id, comment_id) VALUES ($1, $2) RETURNING *",
          [user_id, commentId]
        );
      }

      //remove the log that user has downvoted the comment
      await pool.query(
        "DELETE FROM users_downvotes_comments WHERE user_id = $1 AND comment_id = $2",
        [user_id, commentId]
      );

      res.json(updatedComment.rows[0]);
    }
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.post("/:commentId/downvote", async (req, res, next) => {
  try {
    let { user_id } = req.body;
    let { commentId } = req.params;
    user_id = parseInt(user_id);
    commentId = parseInt(commentId);

    // check if already downvoted by same user then downvote
    const enrty = await pool.query(
      "SELECT * FROM users_downvotes_comments WHERE user_id = $1 AND comment_id = $2",
      [user_id, commentId]
    );

    if (enrty.rows.length > 0) {
      // it has already been downvoted by the same user
      const updatedComment = await pool.query(
        "UPDATE comments SET upvotes = upvotes + 1 WHERE comment_id = $1 RETURNING *",
        [commentId]
      );

      //remove the log that user has downvoted the comment
      const deletedEntry = await pool.query(
        "DELETE FROM users_downvotes_comments WHERE user_id = $1 AND comment_id = $2",
        [user_id, commentId]
      );

      res.json(updatedComment.rows[0]);
    } else {
      const updatedComment = await pool.query(
        "UPDATE comments SET upvotes = upvotes - 1 WHERE comment_id = $1 RETURNING *",
        [commentId]
      );

      const comment = await pool.query(
        "SELECT upvotes FROM comments WHERE comment_id = $1",
        [commentId]
      );

      if (comment.rows[0].upvotes - 1 != 0) {
        const result = await pool.query(
          "INSERT INTO users_downvotes_comments (user_id, comment_id) VALUES ($1, $2) RETURNING *",
          [user_id, commentId]
        );
      }

      //remove the log that user has upvoted the comment
      const deletedEntry = await pool.query(
        "DELETE FROM users_upvotes_comments WHERE user_id = $1 AND comment_id = $2",
        [user_id, commentId]
      );
      res.json(updatedComment.rows[0]);
    }
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

module.exports = router;

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

router.get("/", async (req, res, next) => {
  const { sort } = req.query;
  let queryString =
    "SELECT boards.user_id as user_id, board_id, board_name, board_description AS preview, boards.upvotes as upvotes,  COUNT(comment_id) as comments_count, time_created FROM boards LEFT OUTER JOIN comments USING(board_id) GROUP BY (board_id, boards.user_id, board_description, boards.upvotes, time_created) ";
  if (sort === "best") {
    queryString += "ORDER BY upvotes DESC;";
  } else if (sort == "old") {
    queryString += "ORDER BY time_created;";
  } else if (sort == "new") {
    queryString += "ORDER BY time_created DESC;";
  } else if (sort == "comments count") {
    queryString += "ORDER BY comments_count DESC;";
  } else {
    queryString += ";";
  }
  try {
    const allBoards = await pool.query(queryString);
    res.json(allBoards.rows);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.get("/:boardId", async (req, res, next) => {
  try {
    const queryString = "SELECT boards.board_id AS board_id, boards.user_id as user_id, board_name, board_description, upvotes, time_created, username, imageUrl FROM boards JOIN users USING(user_id) WHERE board_id = $1;";

    const board = await pool.query(queryString, [req.params.boardId]);
    res.json(board.rows[0]);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.get("/:boardId/comments", async (req, res, next) => {
  const { sort } = req.query;
  let queryString =
    "SELECT comment_id, comments.user_id as user_id, comment, upvotes, comments.time as time, username, imageUrl FROM comments JOIN users USING(user_id) WHERE board_id = $1 ";
  if (sort === "best") {
    queryString += "ORDER BY upvotes DESC;";
  } else if (sort == "old") {
    queryString += "ORDER BY time";
  } else if (sort == "new") {
    queryString += "ORDER BY time DESC";
  } else {
    queryString += ";";
  }

  try {
    const board = await pool.query(queryString, [req.params.boardId]);
    res.json(board.rows);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.post("/:boardId/comments", async (req, res, next) => {
  try {
    const { comment } = req.body;

    const newComment = await pool.query(
      "INSERT INTO comments (user_id, board_id, comment, time) VALUES ($1, $2, $3, $4) RETURNING *;",
      [req.body.userId, req.params.boardId, comment, new Date()]
    );

    const { sort } = req.query;
    let queryString =
      "SELECT comment_id, comments.user_id as user_id, comment, upvotes, comments.time as time, username, imageUrl FROM comments JOIN users USING(user_id) WHERE board_id = $1 ";
    if (sort === "best") {
      queryString += "ORDER BY upvotes DESC;";
    } else if (sort == "old") {
      queryString += "ORDER BY time";
    } else if (sort == "new") {
      queryString += "ORDER BY time DESC";
    } else {
      queryString += ";";
    }

    const updatedComments = await pool.query(queryString, [req.params.boardId]);
    res.json(updatedComments.rows);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { user_id, title, description } = req.body;
    const newBoard = await pool.query(
      "INSERT INTO boards(user_id, board_name, board_description, time_created) VALUES ($1, $2, $3, $4) RETURNING *;",
      [user_id, title, description, new Date()]
    );
    res.json(newBoard.rows[0]);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.put("/:boardId", async (req, res, next) => {
  try {
    const { user_id, title, description } = req.body;
    const { boardId } = req.params;

    // check if this board is posted by user with user_id or not
    const board = await pool.query(
      "SELECT * FROM boards WHERE board_id = $1;",
      [boardId]
    );

    if (board.rows[0].user_id !== user_id) {
      res.sendStatus(403);
      return;
    }
    const updatedBoard = await pool.query(
      "UPDATE boards SET board_description = ($1) WHERE board_id = ($2) RETURNING *;",
      [description, boardId]
    );

    res.json(updatedBoard?.rows[0]);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const { board_id: boardId, user_id } = req.body;

    // check if this board is posted by user with user_id or not
    const board = await pool.query(
      "SELECT user_id FROM boards WHERE board_id = $1;",
      [boardId]
    );

    if (
      board.rows[0].user_id == undefined ||
      board.rows[0].user_id !== user_id
    ) {
      return res.sendStatus(403);
    }

    const deletedBoard = await pool.query(
      "DELETE FROM boards WHERE board_id = $1 RETURNING *;",
      [boardId]
    );
    res.json(deletedBoard.rows[0]);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.get("/:boardId/comments/:commentId", async (req, res, next) => {
  try {
    const { boardId, commentId } = req.params;

    const commentText = await pool.query(
      "SELECT comment FROM comments WHERE comment_id = $1 AND board_id = $2",
      [commentId, boardId]
    );

    res.json(commentText.rows[0]);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.put("/:boardId/comments/:commentId", async (req, res, next) => {
  try {
    const { boardId, commentId } = req.params;
    const { comment, user_id } = req.body;

    // check if comment is written by the person who is trying to update it
    const currComment = await pool.query(
      "SELECT user_id FROM comments WHERE comment_id = $1",
      [commentId]
    );

    if (
      currComment.rows[0].user_id == undefined ||
      currComment.rows[0].user_id != user_id
    ) {
      return res.sendStatus(403);
    }

    const updatedComment = await pool.query(
      "UPDATE comments SET comment = $1 WHERE comment_id = ($2) AND board_id = ($3) RETURNING *;",
      [comment, commentId, boardId]
    );

    res.json(updatedComment.rows[0]);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.delete("/:boardId/comments/:commentId", async (req, res, next) => {
  try {
    const { boardId, commentId } = req.params;
    const { user_id } = req.body;
    if (!user_id) return res.sendStatus(403);

    // check if comment is written by the person who is trying to update it
    const currComment = await pool.query(
      "SELECT user_id FROM comments WHERE comment_id = $1",
      [commentId]
    );
    if (
      currComment.rows.length === 0 ||
      currComment.rows[0].user_id != user_id
    ) {
      return res.sendStatus(403);
    }

    const deletedComment = await pool.query(
      "DELETE FROM comments WHERE comment_id = ($1) AND board_id = ($2) RETURNING *;",
      [commentId, boardId]
    );

    res.json(deletedComment.rows[0]);
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.post("/:boardId/upvote", async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const { boardId } = req.params;

    // check if already upvoted by same user then downvote
    const enrty = await pool.query(
      "SELECT * FROM users_upvotes_boards WHERE user_id = $1 AND board_id = $2",
      [user_id, boardId]
    );
    const board = await pool.query(
      "SELECT upvotes FROM boards WHERE board_id = $1",
      [boardId]
    );

    if (enrty.rows.length > 0) {
      // it has already been upvoted by the same user
      const updatedBoard = await pool.query(
        "UPDATE boards SET upvotes = upvotes - 1 WHERE board_id = $1 RETURNING *",
        [boardId]
      );

      //remove the log that user has upvoted the board
      const deletedEntry = await pool.query(
        "DELETE FROM users_upvotes_boards WHERE user_id = $1 AND board_id = $2",
        [user_id, boardId]
      );

      res.json(updatedBoard.rows[0]);
    } else {
      const updatedBoard = await pool.query(
        "UPDATE boards SET upvotes = upvotes + 1 WHERE board_id = $1 RETURNING *",
        [boardId]
      );

      if (board.rows[0].upvotes + 1 != 0) {
        const result = await pool.query(
          "INSERT INTO users_upvotes_boards (user_id, board_id) VALUES ($1, $2) RETURNING *",
          [user_id, boardId]
        );
      }

      //remove the log that user has downvoted the board
      await pool.query(
        "DELETE FROM users_downvotes_boards WHERE user_id = $1 AND board_id = $2",
        [user_id, boardId]
      );

      res.json(updatedBoard.rows[0]);
    }
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

router.post("/:boardId/downvote", async (req, res, next) => {
  try {
    const { user_id } = req.body;
    const { boardId } = req.params;

    // check if already downvoted by same user then downvote
    const enrty = await pool.query(
      "SELECT * FROM users_downvotes_boards WHERE user_id = $1 AND board_id = $2",
      [user_id, boardId]
    );

    if (enrty.rows.length > 0) {
      // it has already been downvoted by the same user
      const updatedBoard = await pool.query(
        "UPDATE boards SET upvotes = upvotes + 1 WHERE board_id = $1 RETURNING *",
        [boardId]
      );

      //remove the log that user has downvoted the comment
      const deletedEntry = await pool.query(
        "DELETE FROM users_downvotes_boards WHERE user_id = $1 AND board_id = $2",
        [user_id, boardId]
      );

      res.json(updatedBoard.rows[0]);
    } else {
      const updatedBoard = await pool.query(
        "UPDATE boards SET upvotes = upvotes - 1 WHERE board_id = $1 RETURNING *",
        [boardId]
      );

      const board = await pool.query(
        "SELECT upvotes FROM boards WHERE board_id = $1",
        [boardId]
      );

      if (board.rows[0].upvotes - 1 != 0) {
        const result = await pool.query(
          "INSERT INTO users_downvotes_boards (user_id, board_id) VALUES ($1, $2) RETURNING *",
          [user_id, boardId]
        );
      }

      //remove the log that user has upvoted the board
      const deletedEntry = await pool.query(
        "DELETE FROM users_upvotes_boards WHERE user_id = $1 AND board_id = $2",
        [user_id, boardId]
      );
      res.json(updatedBoard.rows[0]);
    }
  } catch (err) {
    ErrorUtility.logError(500, err, res);
  }
});

module.exports = router;

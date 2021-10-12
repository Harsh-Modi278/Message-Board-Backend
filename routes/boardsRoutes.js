// express related
const express = require("express");
const router = express.Router();

// dotenv related
const dotenv = require("dotenv");
dotenv.config({ path: "./.env", encoding: "utf-8" });

// postgres related
const pool = require("../db");

router.get("/", async (req, res, next) => {
  try {
    const allBoards = await pool.query(
      "SELECT user_id, board_id, board_name, board_description AS preview FROM boards;"
    );
    res.json(allBoards.rows);
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/:boardId", async (req, res, next) => {
  try {
    const board = await pool.query(
      "SELECT user_id, board_id, board_name, board_description FROM boards WHERE board_id = $1;",
      [req.params.boardId]
    );
    res.json(board.rows);
  } catch (err) {
    console.log(err.message);
  }
});

router.get("/:boardId/comments", async (req, res, next) => {
  try {
    const board = await pool.query(
      "SELECT comment_id, user_id, comment FROM comments WHERE board_id = $1;",
      [req.params.boardId]
    );
    res.json(board.rows);
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/:boardId/comments", async (req, res, next) => {
  try {
    const { user_id, comment } = req.body;
    const { boardId } = req.params;

    const newComment = await pool.query(
      "INSERT INTO comments (user_id, board_id, comment, time) VALUES ($1, $2, $3, $4) RETURNING *;",
      [parseInt(user_id), parseInt(boardId), comment, new Date()]
    );

    res.json(newComment?.rows);
  } catch (err) {
    console.log(err.message);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { user_id, title, description } = req.body;
    const newBoard = await pool.query(
      "INSERT INTO boards(user_id, board_name, board_description) VALUES ($1, $2, $3) RETURNING *;",
      [parseInt(user_id), title, description]
    );
    res.json(newBoard.rows[0]);
  } catch (err) {
    console.log(err.message);
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
      [description, parseInt(boardId)]
    );

    res.json(updatedBoard?.rows);
  } catch (err) {
    console.log(err.message);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    let { board_id: boardId, user_id } = req.body;

    boardId = parseInt(boardId);
    user_id = parseInt(user_id);

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
    console.log(err.message);
  }
});

router.get("/:boardId/comments/:commentId", async (req, res, next) => {
  try {
    let { boardId, commentId } = req.params;
    boardId = parseInt(boardId);
    commentId = parseInt(commentId);

    const commentText = await pool.query(
      "SELECT comment FROM comments WHERE comment_id = $1 AND board_id = $2",
      [commentId, boardId]
    );

    res.json(commentText.rows[0]);
  } catch (err) {
    console.log(err.message);
  }
});

router.put("/:boardId/comments/:commentId", async (req, res, next) => {
  try {
    let { boardId, commentId } = req.params;
    let { comment, user_id } = req.body;
    boardId = parseInt(boardId);
    commentId = parseInt(commentId);
    user_id = parseInt(user_id);

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
    console.log(err.message);
  }
});

router.delete("/:boardId/comments/:commentId", async (req, res, next) => {
  try {
    let { boardId, commentId } = req.params;
    let { user_id } = req.body;
    boardId = parseInt(boardId);
    commentId = parseInt(commentId);
    user_id = parseInt(user_id);

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

    const deletedComment = await pool.query(
      "DELETE FROM comments WHERE comment_id = ($1) AND board_id = ($2) RETURNING *;",
      [commentId, boardId]
    );

    res.json(deletedComment.rows[0]);
  } catch (err) {
    console.log(err.message);
  }
});

module.exports = router;

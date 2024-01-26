const express = require("express");
const app = express();

// cors related
const cors = require("cors");

const boardsRoutes = require("./routes/boardsRoutes.js");
const authRoutes = require("./routes/authRoutes.js");
const commentRoutes = require("./routes/commentRoutes.js");
const miscRoutes = require("./routes/miscRoutes.js");

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// enable all cors requests
const allowCors = fn => async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }
  return await fn(req, res)
}

app.use("/api/boards", allowCors(boardsRoutes));
app.use("/api/auth", allowCors(authRoutes));
app.use("/api/comments", allowCors(commentRoutes));
app.use("/api", allowCors(miscRoutes)); //keep it at last

// catch-all route
// If request is able pass till here, route was not found. => Send 404 error
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

// Handle all the previous errors (including 404 and others)
app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

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
app.use(cors());
app.options(cors()); //enable cors for pre-flight requests

// app.use("/api", indexRoutes);

app.use("/api/boards", boardsRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api", miscRoutes); //keep it at last


// catch-all route
app.get("*", (req, res, next) => {
    res.json({
        msg:"invalid route"
    });
})

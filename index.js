const express = require("express");
const app = express();

// cors related
const cors = require("cors");

const boardsRoutes = require("./routes/boardsRoutes.js");
// const indexRoutes = require("./routes/indexRoutes.js");

const PORT = process.env.PORT || 5000;

app.use(express.json());
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

// enable all cors requests
app.use(cors());

// app.use("/api", indexRoutes);

app.use("/api/boards", boardsRoutes);

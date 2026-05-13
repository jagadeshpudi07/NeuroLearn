const express = require("express")
const cors = require("cors")
const fs = require("fs")
require("dotenv").config()

const app = express()

const logToFile = (msg) => {
  const logMsg = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync('backend.log', logMsg);
  console.log(msg);
};

app.use(cors())
app.use(express.json())
app.use((req, res, next) => {
  logToFile(`${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", require("./routes/authRoutes"))
app.use("/api/notes", require("./routes/notesRoutes"))
app.use("/api/ai", require("./routes/aiRoutes"))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// Keep process alive in some environments
setInterval(() => {}, 1000);

const express = require("express");
const cors = require("cors");
const path = require("node:path");

require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const auditRoutes = require("./routes/auditRoutes");
const planningRoutes = require("./routes/planningRoutes");

const app = express();

app.set("trust proxy", 1); // 1 = one proxy hop in front of your app

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/audit", auditRoutes);
app.use("/api/planning", planningRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "VERA API funcionando correctamente"
  });
});

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`VERA backend ejecutándose en http://localhost:${PORT}`);
  });
}

module.exports = app;
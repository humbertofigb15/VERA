const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.set("trust proxy", 1); // 1 = one proxy hop in front of your app

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "VERA API funcionando correctamente"
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`VERA backend ejecutándose en http://localhost:${PORT}`);
});
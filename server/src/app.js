const express = require("express");
const cors = require("cors");

const demoRoutes = require("./routes/demoRoutes");
const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const sampleRoutes = require("./routes/sampleRoutes");
const orderRoutes = require("./routes/orderRoutes");
const userRoutes = require("./routes/userRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.VERCEL_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^https:\/\/([a-z0-9-]+\.)*vercel\.app$/i.test(origin)
      ) {
        return callback(null, true);
      }

      return callback(new Error("Origin is not allowed by CORS"));
    },
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "BI Backend API is running",
  });
});

app.use("/api/samples", sampleRoutes);
app.use("/api/demos", demoRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);
app.use("/api/assignments", assignmentRoutes);

module.exports = app;

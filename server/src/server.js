const path = require("path");

require("dotenv").config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("JWT_SECRET loaded:", !!process.env.JWT_SECRET);

const app = require("./app");
const connectDB = require("./config/db");

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`BI Backend running on port ${PORT}`);
  });
};

startServer();
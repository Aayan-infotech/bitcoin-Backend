// Load environment variables
require("dotenv").config();
const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes");
const { connectToDb } = require("./config/mongoDb");
const helmet = require("helmet");

const PORT = process.env.PORT || 3000;
const  app = express();
const server = http.createServer(app); // Create an HTTP server

// 🔹 CORS Configuration
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS || "*",  
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE",  "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));


app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

// 🔹 Routes
app.use("/api", routes);

// 🔹 Setup WebSockets for Real-Time Notifications

// 🔹 Start the Server
server.listen(PORT, async () => {
  try {
    await connectToDb();
    console.log(`🚀 Server running on PORT ${PORT}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    process.exit(1);
  }
});

// Load environment variables
require("dotenv").config();
const express = require("express");
const http = require("http");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const routes = require("./routes");
const { connectToDb } = require("./config/mongoDb");
const helmet = require("helmet");
const { getSecrets } = require("./config/awsSecrets");

const app = express();
const server = http.createServer(app);

const corsOptions = {
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 204,
};
app.use(cors(corsOptions));

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(helmet());

app.use("/api", routes);

(async () => {
  try {
    const secrets = await getSecrets(); // Load secrets
    const PORT = process.env.PORT || secrets.PORT || 3210;

    await connectToDb(); // Connect to DB
    server.listen(PORT, () => {
      console.log(`🚀 Server running on PORT ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server initialization failed:", error);
    process.exit(1);
  }
})();

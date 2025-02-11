// Load environment va 
require("dotenv").config()
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const PORT = process.env.PORT || 3000;
const routes=require("./routes")
const {connectToDb}=require("./config/mongoDb")

// integrating socket io
const app = express();

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use("/api", routes); 

app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.listen(PORT,()=>{
  connectToDb()
  console.log(`app listening at PORT ${PORT}`)
})
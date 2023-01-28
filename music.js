const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql");
var app = express();
require("dotenv").config();
const routes = require("./Routes/songs");
const artistRoutes = require("./Routes/artist");
const genreRoutes = require("./Routes/genre");
const userRoutes = require("./Routes/userRoutes");
const cors = require("cors");
const port = process.env.PORT || 5000;

//parsing middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const whitelist = ["http://localhost:3000/"];
app.use(cors(whitelist));

//root route
app.get("/", (req, res) => {
  res.send("hello this is root route");
});
app.use("/v1", routes, artistRoutes, genreRoutes, userRoutes);

//Database
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});
pool.getConnection((err, connection) => {
  if (err) throw err;
  console.log(`db connected ` + connection.threadId);
});

app.listen(port, () => {
  console.log(`listenig in port ${port}`);
});

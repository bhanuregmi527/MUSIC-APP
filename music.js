const express = require("express");
const bodyparser = require("body-parser");
const mysql = require("mysql");
var app = express();
require("dotenv").config();
const routes = require("./Routes/songs");
const artistRoutes = require("./Routes/artist");
const genreRoutes = require("./Routes/genre");
const userRoutes = require("./Routes/userRoutes");
const playlistRoutes = require("./Routes/playlist");
const paymentRoute=require("./Routes/payment");
const likedRoute=require("./Routes/likedSongsByUser")
const handleBadRoute = require("./middlewares/handleBadRoute");
const cors = require("cors");
const port = process.env.PORT || 6000;
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

//parsing middleware
app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());
const whitelist = ["http://localhost:3000/"];
app.use(cors(whitelist));
app.use("/public/img/artist", express.static("./public/img/artist"));
app.use("/public/img/coverphoto", express.static("./public/img/coverphoto"));
app.use("/public/songs", express.static("./public/songs"));
app.use("/public/img/user", express.static("./public/img/user"));
//root route

app.get("/", (req, res) => {
  pool.query(
    'SELECT * FROM  songs WHERE isDeleted="false" ORDER BY likes DESC  ',
    (error, topSongsResults) => {
      if (error) {
        return res.status(500).send(error);
      }

      pool.query(
        'SELECT * FROM songs WHERE isDeleted="false" ORDER BY played DESC ',
        (error, mostPlayedResults) => {
          if (error) {
            return res.status(500).send(error);
          }

          res.send({
            topSongs: topSongsResults,
            mostPlayed: mostPlayedResults,
          });
        }
      );
    }
  );
});

app.use("/v1", routes, artistRoutes, genreRoutes, userRoutes, playlistRoutes,paymentRoute,likedRoute);
app.use(handleBadRoute);
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: err,
  });
});

app.listen(port, () => {
  console.log(`listenig in port ${port}`);
});

const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const AppError = require("../middlewares/appErrors");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/songs");
  },
  filename: (req, file, cb) => {
    const artistID = req.body.artistID;
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        artistID +
        "-" +
        path.extname(file.originalname)
    );
    console.log(req.body);
  },
});
const songFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("audio")) {
    cb(null, true);
  } else {
    cb(new AppError("not an audio ! please upload only audio", 400), false);
  }
};

const upload = multer({
  storage: songStorage,
  fileFilter: songFilter,
});

const getSongs = async (req, res) => {
  pool.query(
    "SELECT * FROM songs WHERE isDeleted=false",
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
};
const getSingleSong = async (req, res) => {
  const songID = req.params.songID;
  pool.query(
    "SELECT * FROM songs WHERE isDeleted=false AND songID = ?",
    [songID],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
};

const addSong = async (req, res) => {
  const { songID, songName, Description, genreName, dateAdded, artistName } =
    req.body;
  const { filename } = req.file;
  pool.query(
    "INSERT INTO songs (songID, songName, Description,genreName,dateAdded,artistName,song) VALUES (?,?,?,?,?,?,?)",
    [songID, songName, Description, genreName, dateAdded, artistName, filename],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Song added to the database");
    }
  );
};

const updatesong = async (req, res) => {
  const songID = req.params.id;
  const { songName, Description, songDuration, genreID, dateAdded, artistID } =
    req.body;
  pool.query(
    "UPDATE songs SET songName=songName, Description=Description,songDuration=songDuration,genreID=genreID,dateAdded=dateAdded,artistID=artistID WHERE id = songID",
    [songName, Description, songDuration, genreID, dateAdded, artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Song updated in the database");
    }
  );
};
const deleteSong = async (req, res) => {
  const songID = req.params.songID;
  pool.query(
    "UPDATE  songs SET isDeleted=true WHERE songID = ?",
    [songID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Song deleted from the database");
    }
  );
};

const deleteAllSong = async (req, res) => {
  pool.query(
    "UPDATE songs SET isDeleted=true",
    function (error, results, fields) {
      if (error) throw error;
      res.send(" All songs Deleted");
    }
  );
};

const addPlaylist = async (req, res) => {
  const { playlistName, dateCreated } = req.body;
  const userID = req.params.userID;
  pool.query(
    "INSERT INTO playlists (userID, playlistName, dateCreated) VALUES (?,?,?,?)",
    [userID, playlistName, dateCreated],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Playlist added to the database");
    }
  );
};

const addSongToPlaylist = async (req, res) => {
  const { songID, playlistID } = req.body;
  pool.query(
    "INSERT INTO songs (songID, playlistID) VALUES (?,?)",
    [songID, playlistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Song added to the playlist");
    }
  );
};

module.exports = {
  upload,
  getSongs,
  addSong,
  updatesong,
  deleteSong,
  deleteAllSong,
  getSingleSong,
  addPlaylist,
  addSongToPlaylist,
};

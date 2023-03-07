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
    if (file.fieldname === "song") {
      cb(null, "public/songs");
    } else if (file.fieldname === "coverphoto") {
      cb(null, "public/img/coverphoto");
    }
  },
  filename: (req, file, cb) => {
    const artistName = req.body.artistName;
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        artistName +
        "-" +
        path.extname(file.originalname)
    );
    console.log(req.body);
  },
});
const songFilter = (req, file, cb) => {
  console.log(file);
  if (file.mimetype.startsWith("audio") || file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(
      new AppError(
        "Unknown type ! please upload only an audio or an image",
        400
      ),
      false
    );
  }
};

const upload = multer({
  storage: songStorage,
  fileFilter: songFilter,
});

const getSongs = async (req, res) => {
  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false'",
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length === 0) {
        res.status(404).send({
          error: "Sorry! the songs are Empty, Please  add songsfirst",
        });
      } else {
        res.send(results);
      }
    }
  );
};

const getMostPlayedSongs = async (req, res) => {
  pool.query(
    "SELECT * FROM  songs WHERE isDeleted='false' ORDER BY played DESC",
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length === 0) {
        res.status(404).send({
          error: "Sorry! the songs are Empty, Please  add songsfirst",
        });
      } else {
        res.send(results);
      }
    }
  );
};
// const getSongsByArtistId = async (req, res) => {
//   const artistID = req.params.artistID;

//   pool.query(
//     "SELECT * FROM songs WHERE isDeleted='false' AND artistID=?",
//     [artistID],
//     function (error, results, fields) {
//       if (error) {
//         console.error(error);
//         res.status(500).send({ error: "Internal Server Error" });
//       }
//       if (results.length === 0) {
//         res.status(404).send({
//           error: `Sorry! no songs found for artist with ID ${artistID}`,
//         });
//       } else {
//         res.send(results);
//       }
//     }'
//   );
// };

const getSongsByGenre = async (req, res) => {
  const genreName = req.params.genreName;

  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false' AND genreName=?",
    [genreName],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length === 0) {
        res.status(404).send({
          error: `Sorry! no songs found for genre ${genreName}`,
        });
      } else {
        res.send(results);
      }
    }
  );
};

const getSingleSong = async (req, res) => {
  const songID = req.params.songID;
  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false' AND songID = ?",
    [songID],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length === 0) {
        res.status(404).send({ error: "No song found with the given id" });
      } else {
        res.send(results);
      }
    }
  );
};
const getSongsByArtistID = async (req, res) => {
  const artistID = req.params.artistID;

  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false' AND artistID=?",
    [artistID],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length === 0) {
        res.status(404).send({
          error: `Sorry! no songs found for artist with ID ${artistID}`,
        });
      } else {
        res.send(results);
      }
    }
  );
};

const addSong = async (req, res) => {
  const { songName, Description, genreName, dateAdded, artistName, artistID, song_type } =
    req.body;
  // console.log(req.files["song"][0].filename);
  // console.log(req.files["coverphoto"][0].filename);
  const song = req.files["song"][0];
  const coverphoto = req.files["coverphoto"][0];
  pool.query(
    "INSERT INTO songs (songName, Description,genreName,dateAdded,artistName,song, coverphoto, artistID, song_type) VALUES (?,?,?,?,?,?,?,?,?)",
    [
      songName,
      Description,
      genreName,
      dateAdded,
      artistName,
      song.filename,
      coverphoto.filename,
      artistID,
      song_type
    ],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error });
      } else {
        res.send("Song added succesfully");
      }
    }
  );
};

const updatesong = async (req, res) => {
  const songID = req.params.songID;
  const { songName, Description, genreName, dateAdded, artistName, artistID } =
    req.body;
  const song = req.files["song"][0];
  const coverphoto = req.files["coverphoto"][0];

  const sql = pool.query(
    "UPDATE songs SET isDeleted='false' ,songName=?, Description=?,genreName=?,dateAdded=?,artistName=?, song=?, coverphoto=?, artistID=? WHERE songID = ?",
    [
      songName,
      Description,
      genreName,
      dateAdded,
      artistName,
      song.filename,
      coverphoto.filename,
      artistID,
      songID,
    ]
  );

  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false' AND songID = ? LIMIT 1",
    [songID],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length < 1) {
        res.status(404).send({ error: "No Song found with the given id" });
      } else {
        pool.query(sql);
        res.send("Song Updated Sucessfully");
      }
    }
  );
};

const updateplay = async (req, res) => {
  const songID = req.params.songID;
  // const { songName, Description, genreName, dateAdded, artistName, artistID } =
  //   req.body;
  // const song = req.files["song"][0];
  // const coverphoto = req.files["coverphoto"][0];

  const sql = pool.query("UPDATE songs SET played=played+1 WHERE songID = ?", [
    songID,
  ]);

  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false' AND songID = ? LIMIT 1",
    [songID],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length < 1) {
        res.status(404).send({ error: "No Song found with the given id" });
      } else {
        pool.query(sql);
        res.send("Song Updated Sucessfully");
      }
    }
  );
};
const deleteSong = async (req, res) => {
  const songID = req.params.songID;
  const sql = pool.query(
    `UPDATE songs SET isDeleted='true' WHERE songID = ${songID} `
  );

  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false' AND songID = ? LIMIT 1",
    [songID],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length < 1) {
        res.status(404).send({ error: "No song found with the given id" });
      } else {
        pool.query(sql);
        res.send("song Deleted Sucessfully");
      }
    }
  );
};

const deleteAllSong = async (req, res) => {
  const sql = pool.query(`UPDATE songs SET isDeleted='true' `);

  pool.query(
    "SELECT * FROM songs WHERE isDeleted='false'",
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length < 1) {
        res.status(404).send({ error: "Song are Empty" });
      } else {
        pool.query(sql);
        res.send("All Song Deleted Sucessfully");
      }
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

const likeSong = async (req, res) => {
  const songID = req.body.songID;
  const userID = req.body.userID;

  // check if the user has already liked the video
  pool.query(
    "SELECT * FROM liked WHERE songID = ? AND userID = ? LIMIT 1",
    [songID, userID],
    (error, results) => {
      console.log("result:", results);
      if (error) {
        console.error(error);
        res.status(500).send("Internal server error");
        return;
      }
      if (results.length > 0) {
        // user has already liked the video, do not update the like count
        return res.status(201).send("User has already liked the song");
      }
      // user has not yet liked the video, update the like count
      pool.query(
        "UPDATE songs SET likes = likes + 1 WHERE songID = ?",
        [songID],
        (error, results) => {
          if (error) {
            console.error(error);
            res.status(500).send("Internal server error");
            return;
          }
          // insert a record into the likes table to track the user's like
          pool.query(
            "INSERT INTO liked (songID, userID) VALUES (?, ?)",
            [songID, userID],
            (error, results) => {
              console.log("details added to the liked table");
              if (error) {
                console.error(error);
                res.status(500).send("Internal server error");
                return;
              }
              res.status(200).send("Song liked successfully");
            }
          );
        }
      );
    }
  );
};

const commentSong = async (req, res) => {
  const comment = req.body.comment;
  const userID = req.body.userID;
  const songID = req.body.songID;

  // insert a record into the comments table to track the user's comment
  pool.query(
    "INSERT INTO comments (userID, songID, comment) VALUES (?,?,?)",
    [userID, songID, comment],
    function (error, results, fields) {
      if (error) throw error;

      // fetch the newly added comment from the database
      pool.query(
        "SELECT * FROM comments WHERE  songID = ? and userID=? and comment=?",
        [songID, userID, comment],
        function (error, results, fields) {
          if (error) throw error;
          res.send(results[0]);
        }
      );
    }
  );
};

const getAllCommentsINSong = async (req, res) => {
  const songID = req.params.songID;
  pool.query(
    "SELECT * FROM comments WHERE isDeleted='false' and  songID = ?",
    [songID],
    function (error, results, fields) {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length === 0) {
        res.status(404).send({ error: "Leave first comment" });
      } else {
        res.send(results);
      }
    }
  );
};
const deleteComment = async (req, res) => {

    const songID = req.body.songID;
    const userID = req.body.userID;
    const commentID = req.body.commentID;
    const sql=pool.query(`UPDATE comments SET isDeleted='true' WHERE songID = ${songID} and commentID=${commentID} and userID=${userID} `)
   
    pool.query(
      "SELECT * FROM comments WHERE isDeleted='false' AND songID = ? and userID= ? and commentID=? LIMIT 1",
      [songID, userID, commentID],
      function (error, results, fields) {
        if (error) {
            console.error(error);
            return res.status(500).send({ error: "Internal Server Error" });
        }
        else {
          pool.query(sql)        
             res.send("comment Sucessfully");
        }
      }
    );
  
};

module.exports = {
  upload,
  getSongs,
  getMostPlayedSongs,
  getSongsByArtistID,
  addSong,
  updatesong,
  updateplay,
  deleteSong,
  deleteAllSong,
  getSingleSong,
  addPlaylist,
  addSongToPlaylist,
  getSongsByGenre,
  likeSong,
  commentSong,
  getAllCommentsINSong,
  deleteComment,
};

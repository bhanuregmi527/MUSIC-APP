const mysql = require("mysql2");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const getSongs = async (req, res) => {
  pool.query("SELECT * FROM songs", function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
};
const getSingleSong = async (req, res) => {
  const songID = req.params.songID;
  pool.query(
    "SELECT * FROM songs WHERE songID = ?",
    [songID],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
};

const addSong = async (req, res) => {
  const {
    songID,
    songName,
    Description,
    songDuration,
    genreID,
    dateAdded,
    artistID,
  } = req.body;
  pool.query(
    "INSERT INTO songs (songID, songName, Description,songDuration,genreID,dateAdded,artistID) VALUES (?,?,?,?,?,?,?)",
    [songID, songName, Description, songDuration, genreID, dateAdded, artistID],
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
    "DELETE FROM songs WHERE songID = ?",
    [songID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Song deleted from the database");
    }
  );
};

const deleteAllSong = async (req, res) => {
  pool.query("DELETE  FROM songs", function (error, results, fields) {
    if (error) throw error;
    res.send(" All songs Deleted");
  });
}


const addPlaylist = async (req, res) => {
  const { playlistName, dateCreated } = req.body;
  const userID = req.params.userID;
  pool.query('INSERT INTO playlists (userID, playlistName, dateCreated) VALUES (?,?,?,?)', [userID, playlistName, dateCreated], function (error, results, fields) {
    if (error) throw error;
    res.send('Playlist added to the database');
  });
}

const addSongToPlaylist = async (req, res) => {
  const { songID, playlistID} = req.body;
  pool.query('INSERT INTO songs (songID, playlistID) VALUES (?,?)', [songID, playlistID], function (error, results, fields) {
    if (error) throw error;
    res.send('Song added to the playlist');
  });
}

module.exports={
    getSongs,addSong,updatesong,deleteSong,deleteAllSong,getSingleSong, addPlaylist, addSongToPlaylist
}


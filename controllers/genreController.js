const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const getGenre = async (req, res) => {
  pool.query("SELECT * FROM genre WHERE isDeleted=false", function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
};

const getSingleGenre = async (req, res) => {

  // to handle empty
  // pool.query(
  //   "SELECT * FROM genre WHERE isDeleted=false AND genreID = ?",
  //   [genreID],
  //   function (error, results, fields) {
  //     if (error) {
  //         console.error(error);
  //         res.status(500).send({ error: "Internal Server Error" });
  //     }
  //     if (results.length === 0) {
  //         res.status(404).send({ error: "No genre found with the given id" });
  //     } else {
  //         res.send(results);
  //     }
  //   }
  // );

  const genreID = req.params.genreID;
  pool.query(
    "SELECT * FROM genre WHERE isDeleted=false AND genreID = ?",
    [genreID],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
};

const addGenre = async (req, res) => {
  const { genreID, genreName, Description, artistID } = req.body;
  pool.query(
    "INSERT INTO genre (genreID,genreName,Description,artistID) VALUES (?,?,?,?)",
    [genreID, genreName, Description, artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Song Genre added to the database");
    }
  );
};
const updateGenre = async (req, res) => {
  const genreID = req.params.id;
  const { genreName, Description, artistID } = req.body;
  pool.query(
    "UPDATE genre SET genreName=?, description=?,artistID=? WHERE genreID = ?",
    [genreID, genreName, Description, artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Genre updated in the database");
    }
  );
};

const deleteGenre = async (req, res) => {
  const genreID = req.params.genreID;
  pool.query(
    "UPDATE genre SET isDeleted=true WHERE genreID = ?",
    [genreID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("genre deleted from the database");
    }
  );
};
const deleteAllGenre = async (req, res) => {
  pool.query("UPDATE genre SET isDeleted=true", function (error, results, fields) {
    if (error) throw error;
    res.send(" All Genre Deleted");
  });
};

module.exports = {
  getGenre,
  getSingleGenre,
  addGenre,
  updateGenre,
  deleteGenre,
  deleteAllGenre,
};

const multer = require("multer");
const path = require("path");
const mysql = require("mysql");
const AppError = require("../middlewares/appErrors");
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});
const artistStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/artist");
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
  },
});
const artistFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image ! please upload only image", 400), false);
  }
};
const upload = multer({
  storage: artistStorage,
  fileFilter: artistFilter,
});

const getAllArtist = async (req, res) => {
  pool.query(
    "SELECT * FROM artist WHERE isDeleted='false'",
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
};
const getSingleArtist = async (req, res) => {
  const artistID = req.params.artistID;
  pool.query(
    "SELECT * FROM artist WHERE isDeleted='false' AND artistID = ?",
    [artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
};
const createArtist = async (req, res) => {
  const { artistID, artistName, artistBio, year, status } = req.body;
  console.log(req.body);
  console.log(req.file);
  const { filename } = req.file;
  pool.query(
    "INSERT INTO artist (artistName,artistBio,year,artistPhoto,status) VALUES (?,?,?,?,?)",
    [artistName, artistBio, year, filename, status],
    function (error, results, fields) {
      if (error) throw error;
      res.send("aritist added to the database");
    }
  );
};
const updateArtist = async (req, res) => {
  const artistID = req.params.artistID;
  const { artistName, artistBio, year, status } = req.body;
  console.log(req);
  const { filename } = req.file;
  pool.query(
    "UPDATE artist SET artistName=?, artistBio=?,year=?,artistPhoto=?,status=? WHERE artistID = ?",
    [artistName, artistBio, year, filename, status, artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("artist updated in the database");
    }
  );
};
const deleteArtist = async (req, res) => {
  const artistID = req.params.artistID;
  const sql = `UPDATE artist SET isDeleted=true WHERE artistID = ${artistID}`;
  pool.query(
    "SELECT * FROM artist WHERE artistID = ?",
    [artistID],
    function (error, results, fields) {
      if (results.length < 1) {
        res.status(404).send({ error: "No user found with the given id" });
      } else {
        pool.query(sql, function (error) {
          if (error) {
            console.error(error);
            res.status(500).send({ error: "Internal Server Error" });
          } else {
            res.send("User Deleted Successfully (soft delete)");
          }
        });
      }
    }
  );
};
const deleteAllArtist = async (req, res) => {
  pool.query(
    "UPDATE artist SET isDeleted=true",
    function (error, results, fields) {
      if (error) throw error;
      res.send(" All Artist Deleted");
    }
  );
};
module.exports = {
  upload,
  getAllArtist,
  getSingleArtist,
  createArtist,
  updateArtist,
  deleteArtist,
  deleteAllArtist,
};

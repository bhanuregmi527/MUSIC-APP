const mysql = require('mysql');
const {upload}= require('../Routes/artist');

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME
});

const getAllArtist = async (req, res) => {
  pool.query('SELECT * FROM artist', function (error, results, fields) {
    if (error) throw error;
    res.send(results);

  });
}

const getSingleArtist = async (req, res) => {
  const artistID = req.params.artistID
  pool.query('SELECT * FROM artist WHERE artistID = ?', [artistID], function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
}

//create artist
const createArtist = async (req, res) => {
  const artistPhoto = req.file.path;
const { artistID, artistName, artistBio, year,status} = req.body;
pool.query('INSERT INTO artist (artistID,artistName,artistBio,year,artistPhoto,status) VALUES (?,?,?,?,?,?)', [artistID, artistName, artistBio, year,artistPhoto,status], function (error, results, fields) {
if (error) throw error;
res.send('aritist added to the database');
});

}
const updateArtist = async (req, res) => {
  const artistID = req.params.id
  const { artistName, artistBio, year, artistPhoto, status } = req.body;
  pool.query('UPDATE artist SET artistName=?, artistBio=?,year=?,artistphoto=?,status=? WHERE artistID = ?', [artistID, artistName, artistBio, year, artistPhoto, status], function (error, results, fields) {
    if (error) throw error;
    res.json(results);
  });
}

const deleteArtist = async (req, res) => {
  const artistID = req.params.artistID
  pool.query('DELETE FROM artist WHERE artistID = ?', [artistID], function (error, results, fields) {
    if (error) throw error;
    res.send('Artistdeleted from the database');
  });
}
const deleteAllArtist = async (req, res) => {
  pool.query('DELETE  FROM artist', function (error, results, fields) {
    if (error) throw error;
    res.send(" All Artist Deleted");

  });
}

module.exports = {
  getAllArtist, getSingleArtist, createArtist, updateArtist, deleteArtist, deleteAllArtist}
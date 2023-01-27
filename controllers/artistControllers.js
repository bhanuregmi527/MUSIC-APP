
const multer = require("multer");
const path = require('path');
const mysql = require("mysql");
const AppError = require("../middlewares/appErrors");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const artistStorage=multer.diskStorage({
  destination: (req,file,cb)=>{
    cb(null,'public/img/artist');
  },
  filename:(req,file,cb)=>{
    const artistID=req.body.artistID;
    const ext=file.mimetype.split('/')[1];
    cb(null,file.fieldname + "-" + Date.now() +"-"+artistID+"-"+path.extname(file.originalname));
    console.log(req.body)

  }

})
const artistFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('audio')){
    cb(null,true)
  }else{
    cb(new AppError('not an audio ! please upload only audio',400),false)
  }
}

const upload=multer({
  storage:artistStorage,
  fileFilter:artistFilter
});



const getAllArtist = async (req, res) => {
  pool.query("SELECT * FROM artist WHERE isDeleted=false", function (error, results, fields) {
    if (error) throw error;
    res.send(results);
  });
};

const getSingleArtist = async (req, res) => {
  const artistID = req.params.artistID;
  pool.query(
    "SELECT * FROM artist WHERE isDeleted=false AND artistID = ?",
    [artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send(results);
    }
  );
};

const createArtist = async (req, res) => {
const { artistID, artistName, artistBio, year,status} = req.body;
const artistPhoto =req.file.path;
pool.query('INSERT INTO artist (artistID,artistName,artistBio,year,artistPhoto,status) VALUES (?,?,?,?,?,?)', [artistID, artistName, artistBio, year,artistPhoto,status], function (error, results, fields) {
if (error) throw error;
res.send('aritist added to the database');
});

}
const updateArtist = async (req, res) => {
  const artistID = req.params.id;
  const { artistName, artistBio, year, artistPhoto, status } = req.body;
  pool.query(
    "UPDATE artist SET artistName=?, artistBio=?,year=?,artistPhoto=?,status=? WHERE artistID = ?",
    [artistName, artistBio, year, artistPhoto, status, artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("artist updated in the database");
    }
  );
};

const deleteArtist = async (req, res) => {
  const artistID = req.params.artistID;
  pool.query(
    "UPDATE artist SET isDeleted=true WHERE artistID = ?",
    [artistID],
    function (error, results, fields) {
      if (error) throw error;
      res.send("Artistdeleted from the database");
    }
  );
};
const deleteAllArtist = async (req, res) => {
  pool.query("UPDATE artist SET isDeleted=true ", function (error, results, fields) {
    if (error) throw error;
    res.send(" All Artist Deleted");
  });
}

module.exports = {
  upload,getAllArtist, getSingleArtist, createArtist, updateArtist, deleteArtist, deleteAllArtist}

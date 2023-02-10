const mysql = require("mysql2");
const express=require("express");
const multer = require('multer');
const path=require("path");
const AppError = require("../middlewares/appErrors");


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});
const songStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/playlist");
  },
  filename: (req, file, cb) => {
    const playlist_id = req.params.playlist_id;
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        playlist_id +
        "-" +
        path.extname(file.originalname)
    );
    
  },
});
const songFilter = (req, file, cb) => {
  console.log(file)
  if (file.mimetype.startsWith('audio')) {
    cb(null, true);
  } else {
    cb(new AppError("not an audio ! please upload only audio", 400), false);
  }
};

const upload = multer({
  storage: songStorage,
  fileFilter: songFilter,
});
const addSongsToPlaylistID=upload.single('song');

const getAllPlaylist = async (req, res) => {
    pool.query(
      "SELECT * FROM playlists WHERE isDeleted='false'",
      function (error, results, fields) {
          if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length===0) {
          res.status(404).send({ error: "Sorry! the Playlist is Empty, Please  create Playlist first" });
      } else {
          res.send(results);
      }
      }
    );
  };

  const getSinglePlaylist = async (req, res) => {
    // to handle empty
    const playlistID = req.params.playlistID;
    pool.query(
      "SELECT p.playlistID, p.name, p.created_at, ps.song FROM playlists p JOIN playlist_songs ps ON p.playlistID = ps.playlist_id WHERE p.isDeleted='false' AND p.playlistID=? AND ps.isDeleted='false'  ",
      [playlistID],
      function (error, results, fields) {
        if (error) {
            console.error(error);
           return  res.status(500).send({ error: "Internal Server Error" });
        }
        if (results.length === 0) {
           return  res.status(404).send({ error: "No playlist found with the given id" });
        } else {
            res.send(results);
        }
      }
    );
   };
   
   const createPlaylist = async (req, res) => {
    const {name} = req.body;
    pool.query('INSERT INTO playlists ( name) VALUES(?)',[name], function (error, results, fields) {
      // 'INSERT INTO artist (artistID,artistName,artistBio,year,artistPhoto,status) VALUES (?,?,?,?,?,?)', [artistID, artistName, artistBio, year,filename,status]
      if (error) {
        return res.status(500).send({ error});
      } else {
        res.send('Playlist Created Succesfully to  database');
      }
    
    });
    }

  const addSongsToPlaylist= async (req,res)=>{
    const playlist_id=req.params.playlist_id;
    // const playlistName= pool.query(`SELECT FROM playlists WHERE playlistID=${playlist_id}`)
    // console.log(playlistName.data);
    const song=req.file.filename;
    console.log(req.file);
    pool.query(`INSERT INTO playlist_songs (playlist_id,song) VALUES(?,?)`,[playlist_id,song],function(error,results,fields){
      if(error){
        return res.status(500).send({error});
      }else{
        res.send(`Song added to Playlist successfully`)
      }
    });

  }

  const updateplaylist = async (req, res) => {
    const playlistID = req.params.playlistID;
    const  name = req.body;
    const sql=pool.query(`UPDATE playlists SET isDeleted='false' ,name=${name} WHERE playlistID = ${playlistID} `)
   
    pool.query(
      "SELECT * FROM playlists WHERE isDeleted=false AND playlistID = ? LIMIT 1",
      [playlistID],
      function (error, results, fields) {
        
        if (error) {
            console.error(error);
            res.status(500).send({ error: "Internal Server Error" });
        }
        if (results.length<1) {
            res.status(404).send({ error: "No genre found with the given id" });
        } else {
          pool.query(sql)        
            res.send("playlist Updated Sucessfully");
        }
      }
    );
  };

  const deletePlaylist = async (req, res) => {
    const playlistID = req.params.playlistID;
    const sql=pool.query(`UPDATE playlists SET isDeleted='true' WHERE playlistID = ${playlistID} `)
   
    pool.query(
      "SELECT * FROM genre WHERE isDeleted=false AND playlistID = ? LIMIT 1",
      [playlistID],
      function (error, results, fields) {
        
        if (error) {
            console.error(error);
            res.status(500).send({ error: "Internal Server Error" });
        }
        if (results.length<1) {
            res.status(404).send({ error: "No playlist found with the given id" });
        } else {
          pool.query(sql)        
            res.send("Playlist Deleted Sucessfully");
        }
      }
    );
  };
  const deleteSongFromPlaylist = async (req, res) => {
    const id = req.params.id;
    const sql=pool.query(`UPDATE playlist_songs SET isDeleted='true' WHERE id = ${id} `)
   
    pool.query(
      "SELECT * FROM playlist_songs WHERE isDeleted='false' AND id = ? LIMIT 1",
      [id],
      function (error, results, fields) {
        
        if (error) {
            console.error(error);
            res.status(500).send({ error: "Internal Server Error" });
        }
        if (results.length<1) {
            res.status(404).send({ error: "No songs found in the playlist" });
        } else {
          pool.query(sql)        
            res.send("songs  Deleted Sucessfully");
        }
      }
    );
  };
    

  module.exports={
    addSongsToPlaylistID,
    getAllPlaylist,
    getSinglePlaylist,
    createPlaylist,
    addSongsToPlaylist,
    updateplaylist,
    deletePlaylist,
    deleteSongFromPlaylist

  }
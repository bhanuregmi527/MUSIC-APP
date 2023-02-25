const mysql = require("mysql2");
const express=require("express");

const AppError = require("../middlewares/appErrors");
const { async } = require("q");


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});


const AddLikedSongByUser = async(req, res) => {
  const userID = req.body.userID;
  const songID = req.body.songID;

  // Check if the song has already been liked by the user
  const result = await pool.query(`SELECT * FROM liked_songs WHERE userID=${userID} AND songID=${songID}`);

  if (result.length > 0) {
    // If the song has already been liked, return an error message
    res.status(400).send({ error: "You have already liked this song" });
  } else {
    // Otherwise, add the song to the liked table in the database
    const query = `INSERT INTO liked (userID, songID) VALUES (${userID}, ${songID})`;
    pool.query(query, (error, results) => {
      if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
      } else {
        res.send({ message: "Song added to liked list" });
      }
    });
  }
};

const getAllLiked = async (req, res) => {
  const userID=req.user.id;
    pool.query(
      `SELECT * FROM liked_songs WHERE isDeleted='false'AND userID=${userID}`,
      function (error, results, fields) {
          if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length===0) {
          res.status(404).send({ error: "Sorry! You havent liked any videos" });
      } else {
          res.send(results);
      }
      }
    );
  };

    
  const deleteLiked = async (req, res) => {
    const id = req.params.id;
    const sql=pool.query(`UPDATE liked_songs SET isDeleted='true' WHERE id = ${id} `)
   
    pool.query(
      "SELECT * FROM playlist_songs WHERE isDeleted='false' AND id = ? LIMIT 1",
      [id],
      function (error, results, fields) {
        
        if (error) {
            console.error(error);
            res.status(500).send({ error: "Internal Server Error" });
        }
        if (results.length<1) {
            res.status(404).send({ error: "No songs found in the Liked" });
        } else {
          pool.query(sql)        
            res.send("songs  Deleted Sucessfully");
        }
      }
    );
  };
  
  
  
    

  module.exports={
    getAllLiked,
    deleteLiked,
    AddLikedSongByUser
      }
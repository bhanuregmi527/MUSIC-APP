const mysql = require("mysql2");
const express=require("express");

const AppError = require("../middlewares/appErrors");


const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});


const getAllLiked = async (req, res) => {
  const userID=req.user.id;
    pool.query(
      `SELECT * FROM liked WHERE isDeleted='false'AND userID=${userID}`,
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
    const sql=pool.query(`UPDATE liked SET isDeleted='true' WHERE id = ${id} `)
   
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
    deleteLiked
      }
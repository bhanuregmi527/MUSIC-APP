const mysql= require('mysql');
const pool= mysql.createPool({
    host: process.env.DB_HOST,
    user:process.env.DB_USER,
    database:process.env.DB_NAME
  });

const getGenre= async (req,res)=>{
    pool.query('SELECT * FROM genre', function (error, results, fields) {
         if (error) throw error;
        res.send(results);
    
      });
}

const getSingleGenre= async (req,res)=>{
    const genreID= req.params.genreID
    pool.query('SELECT * FROM genre WHERE genreID = ?',[genreID], function (error, results, fields) {
        if (error) throw error;
        res.send(results);
      });
  }


const addGenre= async (req,res)=>{
    const {genreID,genreName,Description,artistID}= req.body;
    pool.query('INSERT INTO genre (genreID,genreName,Description,artistID) VALUES (?,?,?,?)', [genreID,genreName,Description,artistID], function (error, results, fields) {
        if (error) throw error;
        res.send('Song Genre added to the database');
      });
      
}
const updateGenre= async (req,res)=>{
    const genreID= req.params.id
    const {genreName,Description,artistID}= req.body;
    pool.query('UPDATE genre SET genreName=?, description=?,artistID=? WHERE genreID = ?', [genreID,genreName,Description,artistID], function (error, results, fields) {
      if (error) throw error;
      res.send('Genre updated in the database');
    });
}

const deleteGenre= async (req,res)=>{
    const genreID= req.params.genreID
    pool.query('DELETE FROM genre WHERE genreID = ?',[genreID], function (error, results, fields) {
        if (error) throw error;
        res.send('genre deleted from the database');
      });
    }
 const deleteAllGenre= async (req,res)=>{
        pool.query('DELETE  FROM genre', function (error, results, fields) {
          if (error) throw error;
         res.send(" All Genre Deleted");
      
       });
      }

module.exports={
    getGenre,getSingleGenre,addGenre,updateGenre,deleteGenre,deleteAllGenre
}
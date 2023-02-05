const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const getGenre = async (req, res) => {
  pool.query("SELECT * FROM genre WHERE isDeleted=false", function (error, results, fields) {
    if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
        res.status(404).send({ error: "Sorry! the Genre is Empty, Please  add Genre first" });
    } else {
        res.send(results);
    }
  })
};

const getSingleGenre = async (req, res) => {

  // to handle empty
  const genreID = req.params.genreID;
  pool.query(
    "SELECT * FROM genre WHERE isDeleted=false AND genreID = ?",
    [genreID],
    function (error, results, fields) {
      if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length === 0) {
          res.status(404).send({ error: "No genre found with the given id" });
      } else {
          res.send(results);
      }
    }
  );

  
  // pool.query(
  //   "SELECT * FROM genre WHERE isDeleted=false AND genreID = ?",
  //   [genreID],
  //   function (error, results, fields) {
  //     if (error) throw error;
  //     res.send(results);
  //   }
  // );
};

const addGenre = async (req, res) => {
  const { genreID, genreName, Description} = req.body;
  pool.query(
    "INSERT INTO genre (genreID,genreName,Description) VALUES (?,?,?,?)",
    [genreID, genreName, Description],
    function (error, results, fields) {
      if (error) {
          console.error(error);
          res.status(500).send({ error});
      }
       else {
          res.send("Genre added succesfully");
      }
    }
  );
};
const updateGenre = async (req, res) => {
  const genreID = req.params.genreID;
  const { genreName, Description} = req.body;
  const sql=pool.query(`UPDATE genre SET isDeleted=false ,genreName=${genreName}, Description=${Description} WHERE genreID = ${genreID} `)
 
  pool.query(
    "SELECT * FROM genre WHERE isDeleted=false AND genreID = ? LIMIT 1",
    [genreID],
    function (error, results, fields) {
      
      if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length<1) {
          res.status(404).send({ error: "No genre found with the given id" });
      } else {
        pool.query(sql)        
          res.send("Genre Updated Sucessfully");
      }
    }
  );
};

const deleteGenre = async (req, res) => {
  const genreID = req.params.genreID;
  const sql=pool.query(`UPDATE genre SET isDeleted=true WHERE genreID = ${genreID} `)
 
  pool.query(
    "SELECT * FROM genre WHERE isDeleted=false AND genreID = ? LIMIT 1",
    [genreID],
    function (error, results, fields) {
      
      if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length<1) {
          res.status(404).send({ error: "No genre found with the given id" });
      } else {
        pool.query(sql)        
          res.send("Genre Deleted Sucessfully");
      }
    }
  );
};
const deleteAllGenre = async (req, res) => {
  const sql=pool.query(`UPDATE genre SET isDeleted=true `)
  
  pool.query("SELECT * FROM genre WHERE isDeleted=false", function (error, results, fields) {
    if (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
  }
  if (results.length<1) {
      res.status(404).send({ error: "Genre is Empty" });
  } else {
    pool.query(sql)        
      res.send("All Genre Deleted Sucessfully");
  }
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

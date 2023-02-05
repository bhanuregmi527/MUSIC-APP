const multer = require('multer');
const path =require("path");
const mysql = require("mysql");
const AppError = require("../middlewares/appErrors");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  database: process.env.DB_NAME,
});

const artistStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.file)
    cb(null, "public/img/artist/");
  },
  filename: (req, file, cb) => {
    const artistName = req.body.artistName;
    console.log(artistName)
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        artistName +
        "-" +
        path.extname(file.originalname)
    );
  }
});

const artistFilter=(req,file,cb)=>{
  if(file.mimetype.startsWith('image')){
    cb(null,true)
  }else{
    cb(new AppError('not an image ! please upload only audio',400),false)
  }
}

const upload=multer({
  storage:artistStorage,
  fileFilter:artistFilter
});

const getAllArtist = async (req, res) => {
  pool.query("SELECT * FROM artist WHERE isDeleted=false", function (error, results, fields) {
    if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
        res.status(404).send({ error: "Sorry! the artist is Empty, Please  add Artist first" });
    } else {
        res.send(results);
    }
  })
  
  
  
  
};

const getSingleArtist = async (req, res) => {
  const artistID = req.params.artistID;
    // to handle empty
        pool.query(
      "SELECT * FROM artist WHERE isDeleted=false AND artistID = ?",
      [artistID],
      function (error, results, fields) {
        if (error) {
            console.error(error);
            res.status(500).send({ error: "Internal Server Error" });
        }
        if (results.length === 0) {
            res.status(404).send({ error: "No Artist found with the given id" });
        } else {
            res.send(results);
        }
      }
    );
};

const createArtist = async (req, res) => {
const { artistID, artistName, artistBio, year,status} = req.body;


if(!req.file){ 
  return res.status(400).send({error:"no photo uploaded"})
}else{
  const artistPhoto= req.file.filename;
pool.query('INSERT INTO artist (artistID, artistName, artistBio, year, artistPhoto) VALUES(?,?,?,?,?)',[artistID, artistName, artistBio, year,artistPhoto], function (error, results, fields) {
  // 'INSERT INTO artist (artistID,artistName,artistBio,year,artistPhoto,status) VALUES (?,?,?,?,?,?)', [artistID, artistName, artistBio, year,filename,status]
  if (error) {
    res.status(500).send({ error});
  } else {
    res.send('aritist added to the database');
  }

});
}
//
//INSERT INTO artist (artistID, artistName, artistBio, year, artistPhoto, status) 
//VALUES (10, 'bhanu', 'jfsakldfjklasdf', 2019, 'artistPhoto-1675499447139-bhanu-.jpg', 'active');
//

}
const updateArtist = async (req, res) => {
  const artistID = req.params.artistID;
  const artistPhoto= req.filename;
  const { artistName, artistBio, year,status } = req.body;
  const sql=pool.query(`UPDATE artist SET artistName=${artistName}, artistBio=${artistBio},year=${year},artistPhoto=${artistPhoto},status=${status} WHERE artistID = ${artistID} `)
 
  pool.query(
    "SELECT * FROM artist WHERE isDeleted=false AND artistID = ? LIMIT 1",
    [artistID],
    function (error, results, fields) {
      
      if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length<1) {
          res.status(404).send({ error: "No artist found with the given id" });
      } else {
        pool.query(sql)        
          res.send("artist Updated Sucessfully");
      }
    }
  );


};

const deleteArtist = async (req, res) => {
  const artistID = req.params.artistID;
  const sql=pool.query(`UPDATE artist SET isDeleted=true WHERE artistID = ${artistID} `)
 
  pool.query(
    "SELECT * FROM artist WHERE isDeleted=false AND artistID = ? LIMIT 1",
    [artistID],
    function (error, results, fields) {
      
      if (error) {
          console.error(error);
          res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length<1) {
        console.log(results.length)
          res.status(404).send({ error: "No artist found with the given id" });
      } else {
        pool.query(sql)        
          res.send("artist Deleted Sucessfully");
      }
    }
  );
  

};
const deleteAllArtist = async (req, res) => {
  const sql=pool.query(`UPDATE artist SET isDeleted=true `)
  
  pool.query("SELECT * FROM artist WHERE isDeleted=false", function (error, results, fields) {
    if (error) {
      console.error(error);
      res.status(500).send({ error: "Internal Server Error" });
  }
  if (results.length<1) {
      res.status(404).send({ error: "Artist  is Empty" });
  } else {
    pool.query(sql)        
      res.send("All artist Deleted Sucessfully");
  }
  });





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

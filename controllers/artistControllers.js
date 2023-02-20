const multer = require('multer');
const path =require("path");
const mysql = require("mysql2");
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
    // console.log(artistName)
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now()+
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
};
const upload = multer({
  storage: artistStorage,
  fileFilter: artistFilter,
});

const getAllArtist = async (req, res) => {
  pool.query(
    "SELECT * FROM artist WHERE isDeleted='false'",
    function (error, results, fields) {
        if (error) {
        console.error(error);
        res.status(500).send({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
        res.status(404).send({ error: "Sorry! the Genre is Empty, Please  add Genre first" });
    } else {
        res.send(results);
    }
    }
  );
};
const getSingleArtist = async (req, res) => {
 // to handle empty
 const artistID = req.params.artistID;
 pool.query(
   "SELECT * FROM artist WHERE isDeleted='false' AND artistID = ?",
   [artistID],
   function (error, results, fields) {
     if (error) {
         console.error(error);
        return  res.status(500).send({ error: "Internal Server Error" });
     }
     if (results.length === 0) {
        return  res.status(404).send({ error: "No genre found with the given id" });
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
pool.query('INSERT INTO artist ( artistName, artistBio, year, artistPhoto) VALUES(?,?,?,?)',[ artistName, artistBio, year,artistPhoto], function (error, results, fields) {
  // 'INSERT INTO artist (artistID,artistName,artistBio,year,artistPhoto,status) VALUES (?,?,?,?,?,?)', [artistID, artistName, artistBio, year,filename,status]
  if (error) {
    return res.status(500).send({ error});
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
  const [result] = await pool.promise().query(`SELECT artistPhoto FROM artist WHERE artistID=${artistID} AND isDeleted='false' LIMIT 1`);
  const artistImage = result[0].artistPhoto;
   const { artistName, artistBio, year,status } = req.body;
  let artistPhoto = req.file ? req.file.filename :artistImage;
 
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
  const sql=pool.query(`UPDATE artist SET isDeleted='true' WHERE artistID = ${artistID} `)
 
  pool.query(
    "SELECT * FROM artist WHERE isDeleted='false' AND artistID = ? LIMIT 1",
    [artistID],
    function (error, results, fields) {
      
      if (error) {
          console.error(error);
          return res.status(500).send({ error: "Internal Server Error" });
      }
      if (results.length<1) {
        console.log("result:",results)
        return  res.status(404).send({ error: "No artist found with the given id" });
      } else {
        pool.query(sql)        
           res.send("artist Deleted Sucessfully");
      }
    }
  );
};
const deleteAllArtist = async (req, res) => {
  pool.query("UPDATE artist SET isDEleted='true'", function (error, results, fields) {
    if (error) throw error;
    res.send(" All Artist Deleted");
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

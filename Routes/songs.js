<<<<<<< HEAD
const express= require('express');
const router= express.Router();
const checkUserAuth = require('../middlewares/auth-middleware')
const {getSongs,addSong,updatesong,deleteSong,deleteAllSong,getSingleSong, addPlaylist}=require('../controllers/musicControllers')
const restrictTo= require('../middlewares/restrict')
=======
const express = require("express");
const router = express.Router();
const checkUserAuth = require("../middlewares/auth-middleware");
// const uploadSong=require('../controllers/musicControllers');
const {
  upload,
  getSongs,
  addSong,
  updatesong,
  deleteSong,
  deleteAllSong,
  getSingleSong,
} = require("../controllers/musicControllers");
const restrictTo = require("../middlewares/restrict");
>>>>>>> 5d378009512858437aa96aaa90706c71b559830d

//Routes

router.get("/songs", getSongs);
router.get("/getSingleSong/:songID", getSingleSong);
router.post(
  "/addSong",
  checkUserAuth,upload.single('song'),
  addSong
);
router.put("/songs/:id", checkUserAuth, updatesong);
router.put("/deleteSong/:songID", checkUserAuth, deleteSong);
router.put(
  "/deleteAllSong",
  checkUserAuth,
  restrictTo("admin"),
  deleteAllSong
);

//playlists
router.post('/addPlaylist/:userID', addPlaylist)
module.exports=router

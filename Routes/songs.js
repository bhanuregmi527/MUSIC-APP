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
  getSongsByArtistID,
} = require("../controllers/musicControllers");
const restrictTo = require("../middlewares/restrict");

//Routes

router.get("/songs", getSongs);
router.get("/getSingleSong/:songID", getSingleSong);
router.get("/getSongsByArtistID/:artistID",getSongsByArtistID);
router.post(
  "/addSong",
  checkUserAuth,upload.single('song'),
  addSong
);
router.put("/songs/:id", checkUserAuth, updatesong);
router.delete("/deleteSong/:songID", checkUserAuth, deleteSong);
router.delete(
  "/deleteAllSong",
  checkUserAuth,
  restrictTo("admin"),
  deleteAllSong
);

//playlists

module.exports=router

const express = require("express");
const router = express.Router();
const checkUserAuth = require("../middlewares/auth-middleware");
// const uploadSong=require('../controllers/musicControllers');
const {
  upload,
  getSongs,
  getMostPlayedSongs,
  getSongsByArtistID,
  addSong,
  updatesong,
  updateplay,
  deleteSong,
  deleteAllSong,
  getSingleSong,
  getSongsByGenre,
} = require("../controllers/musicControllers");
const restrictTo = require("../middlewares/restrict");

//Routes

router.get("/songs", getSongs);
router.get("/getMostPlayedSongs", getMostPlayedSongs);
router.get("/getSongsByArtistID/:artistID", getSongsByArtistID);
router.get("/songsByGenre/:genreName", getSongsByGenre);
router.get("/getSingleSong/:songID", getSingleSong);
router.post(
  "/addSong",
  checkUserAuth,
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "coverphoto", maxCount: 1 },
  ]),
  addSong
);
router.put(
  "/updateSong/:songID",
  checkUserAuth,
  upload.fields([
    { name: "song", maxCount: 1 },
    { name: "coverphoto", maxCount: 1 },
  ]),
  updatesong
);
router.put("/updateplay/:songID", updateplay);
router.delete("/deleteSong/:songID", checkUserAuth, deleteSong);
router.delete(
  "/deleteAllSong",
  checkUserAuth,
  restrictTo("admin"),
  deleteAllSong
);

//playlists

module.exports = router;

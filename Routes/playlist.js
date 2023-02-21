const express = require("express");
const router = express.Router();
const multer = require("multer");

const checkUserAuth = require("../middlewares/auth-middleware");
// const uploadSong=require('../controllers/musicControllers');
const {
  addSongsToPlaylistID,
  getAllPlaylist,
  getAPlaylist,
  getSinglePlaylist,
  createPlaylist,
  addSongsToPlaylist,
  updateplaylist,
  deletePlaylist,
  deleteSongFromPlaylist,
} = require("../controllers/playlistControllers");
const restrictTo = require("../middlewares/restrict");
router.get("/getAllPlaylist/:userID", getAllPlaylist);
router.get("/getAPlaylist/:playlistID", getAPlaylist);
router.get("/getSinglePlaylist/:playlistID", getSinglePlaylist);
router.post(
  "/addSongsToPlaylist/:playlist_id",
  checkUserAuth,
  addSongsToPlaylistID,
  addSongsToPlaylist
);
router.post("/createPlaylist", checkUserAuth, createPlaylist);
router.put("/updateplaylist/:playlistID", checkUserAuth, updateplaylist);
router.delete("/deletePlaylist/:playlistID", checkUserAuth, deletePlaylist);
router.delete("/deleteSongFromPlaylist", checkUserAuth, deleteSongFromPlaylist);

module.exports = router;

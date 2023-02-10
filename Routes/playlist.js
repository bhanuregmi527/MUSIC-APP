const express = require("express");
const router = express.Router();
const multer = require('multer');

const checkUserAuth = require("../middlewares/auth-middleware");
// const uploadSong=require('../controllers/musicControllers');
const {
  addSongsToPlaylistID,
  getAllPlaylist,
  getSinglePlaylist,
  createPlaylist,
  addSongsToPlaylist,
  updateplaylist,
  deletePlaylist,
  deleteSongFromPlaylist
} = require("../controllers/playlistControllers");
const restrictTo = require("../middlewares/restrict");  
router.get("/getAllPlaylist",checkUserAuth,getAllPlaylist);
router.get("/getSinglePlaylist/:playlistID",checkUserAuth,getSinglePlaylist);
router.post("/addSongsToPlaylist/:playlist_id",checkUserAuth,addSongsToPlaylistID,addSongsToPlaylist);
router.post("/createPlaylist",checkUserAuth,createPlaylist);
router.put("/updateplaylist/:playlistID",checkUserAuth,updateplaylist);
router.put("/deletePlaylist/:playlistID",checkUserAuth,deletePlaylist);
router.put("/deleteSongFromPlaylist/:id",checkUserAuth,deleteSongFromPlaylist);



module.exports = router;
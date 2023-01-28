const express= require('express');
const router= express.Router();
const checkUserAuth = require('../middlewares/auth-middleware')
const {getSongs,addSong,updatesong,deleteSong,deleteAllSong,getSingleSong, addPlaylist}=require('../controllers/musicControllers')
const restrictTo= require('../middlewares/restrict')

//Routes

router.get("/songs", getSongs);
router.get("/getSingleSong/:songID", getSingleSong);
router.post(
  "/addSong",
  // checkUserAuth,
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
router.post('/addPlaylist/:userID', addPlaylist)
module.exports=router

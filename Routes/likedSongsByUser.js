const express = require("express");
const router = express.Router();
const multer = require('multer');

const checkUserAuth = require("../middlewares/auth-middleware");
// const uploadSong=require('../controllers/musicControllers');
const {
   getAllLiked,
 deleteLiked,
 AddLikedSongByUser,
  } = require("../controllers/likedController");
router.get("/getAllLiked",checkUserAuth,getAllLiked);
router.post("/addSongToLikedList",AddLikedSongByUser);
router.put("/deleteLiked/:id",checkUserAuth,deleteLiked);



module.exports = router;
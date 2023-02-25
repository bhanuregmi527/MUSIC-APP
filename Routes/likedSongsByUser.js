const express = require("express");
const router = express.Router();
const multer = require('multer');

const checkUserAuth = require("../middlewares/auth-middleware");
// const uploadSong=require('../controllers/musicControllers');
const {
   getAllLiked,
 deleteLiked,
  } = require("../controllers/likedController");
router.get("/getAllLiked",checkUserAuth,getAllLiked);
router.delete("/deleteLiked/:id",checkUserAuth,deleteLiked);



module.exports = router;
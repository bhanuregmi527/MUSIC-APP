const express= require('express');
const router= express.Router();
const {getSongs,addSong,updatesong,deleteSong,deleteAllSong,getSingleSong}=require('../controllers/musicControllers')


//Routes
router.get('/songs',getSongs)
router.get('/getSingleSong/:songID',getSingleSong)
router.post('/addSong',addSong)
router.put('/songs/:id',updatesong)
router.delete('/deleteSong/:songID',deleteSong)
router.delete('/deleteAllSong',deleteAllSong)


module.exports=router
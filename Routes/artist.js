const express= require('express');
const router= express.Router();
const checkUserAuth= require('../middlewares/auth-middleware')
const {uploadArtistPhoto,getAllArtist,getSingleArtist,createArtist,updateArtist,deleteArtist,deleteAllArtist}=require('../controllers/artistControllers')
const restrictTo= require('../middlewares/restrict')


router.get('/getAllArtist',getAllArtist)
router.get('/getSingleArtist/:artistID',getSingleArtist)
router.post('/createArtist',checkUserAuth,uploadArtistPhoto ,createArtist)
router.put('/updateArtist/:artistID',checkUserAuth,updateArtist)
router.delete('/deleteArtist/:artistID',checkUserAuth,restrictTo('admin'),deleteArtist)
router.delete('/deleteAllArtist',checkUserAuth,restrictTo('admin'),deleteAllArtist)


module.exports=router



const express= require('express');
const router= express.Router();
const {getAllArtist,getSingleArtist,createArtist,updateArtist,deleteArtist,deleteAllArtist}=require('../controllers/artistControllers')


router.get('/getAllArtist',getAllArtist)
router.get('/getSingleArtist/:artistID',getSingleArtist)
router.post('/createArtist',createArtist)
router.put('/updateArtist',updateArtist)
router.delete('/deleteArtist/:artistID',deleteArtist)
router.delete('/deleteAllArtist',deleteAllArtist)




module.exports=router



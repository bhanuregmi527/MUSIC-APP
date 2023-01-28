const express= require('express');
const router= express.Router();
const multer = require('multer');
const checkUserAuth= require('../middlewares/auth-middleware')
const {upload,getAllArtist,getSingleArtist,createArtist,updateArtist,deleteArtist,deleteAllArtist}=require('../controllers/artistControllers')
const restrictTo= require('../middlewares/restrict')
const AppError = require('../middlewares/appErrors')

  

router.get('/getAllArtist',getAllArtist)
router.get('/getSingleArtist/:artistID',getSingleArtist)
router.post('/createArtist',checkUserAuth,upload.single('artistPhoto') ,createArtist)
router.put('/updateArtist/:artistID',checkUserAuth,updateArtist)
router.delete('/deleteArtist/:artistID',checkUserAuth,restrictTo('admin'),deleteArtist)
router.delete('/deleteAllArtist',checkUserAuth,restrictTo('admin'),deleteAllArtist)


module.exports=router


// module.exports = router;

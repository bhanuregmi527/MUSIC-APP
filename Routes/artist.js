const express= require('express');
const router= express.Router();
const multer = require('multer');
const checkUserAuth= require('../middlewares/auth-middleware')
const {getAllArtist,getSingleArtist,createArtist,updateArtist,deleteArtist,deleteAllArtist}=require('../controllers/artistControllers')
const restrictTo= require('../middlewares/restrict')
const AppError = require('../middlewares/appErrors')
//Image Upload
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/img/artist');
    },
    filename: function (req, file, cb) {
      const  artistName  = req.body.artistName;
      const ext = file.mimetype.split('/')[1];
      cb(null, `user-${req.user.artistName}-${Date.now()}.${ext}`);
    }
  });
  const multerFiletr = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true)
    } else {
      cb(new AppError('Not an image ! Please Upload only Image', 400), false)
    }
  }
  
  const upload = multer({
    storage,
    fileFilter: multerFiletr
  });
  

router.get('/getAllArtist',getAllArtist)
router.get('/getSingleArtist/:artistID',getSingleArtist)
router.post('/createArtist',checkUserAuth,upload.single('artistPhoto') ,createArtist)
router.put('/updateArtist/:artistID',checkUserAuth,updateArtist)
router.delete('/deleteArtist/:artistID',checkUserAuth,restrictTo('admin'),deleteArtist)
router.delete('/deleteAllArtist',checkUserAuth,restrictTo('admin'),deleteAllArtist)


module.exports=router


module.exports = router;

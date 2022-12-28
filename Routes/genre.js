const express= require('express');
const router= express.Router();

const {getGenre,getSingleGenre,addGenre,updateGenre,deleteGenre,deleteAllGenre}=require('../controllers/genreController')

router.get('/genre',getGenre)
router.get('/getSingleGenre/:genreID',getSingleGenre)
router.post('/addGenre',addGenre)
router.put('/genre/:id',updateGenre)
router.delete('/deleteGenre/:genreID',deleteGenre)
router.delete('/deleteAllGenre',deleteAllGenre)

module.exports= router
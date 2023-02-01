const  express=require("express");
const router = express.Router();
const  UserController=require('../controllers/userController');
const checkUserAuth =require ('../middlewares/auth-middleware'); 
const restrictTo= require('../middlewares/restrict')

// Route Level Middleware -to protect
router.use('/changepassword',checkUserAuth)
router.use('/loggedUser',checkUserAuth)
router.use('/deleteUser',checkUserAuth)


//Publice Routes
router.post('/register',UserController.userRegistration)
router.post('/login',UserController.userLogin)

//private routes
router.post('/changePassword',UserController.changeUserPassword)
router.post('/changeUserDetails',UserController.changeUserDetails)
router.post('/changeUserProfile', UserController.changeUserProfilePhoto)
router.get('/loggedUser',UserController.loggedUser)
router.delete('/deleteUser/:id',restrictTo('admin'),UserController.deleteUserById)
router.get("/allusers", UserController.loadAllUsers)

//playlists routes

module.exports=router
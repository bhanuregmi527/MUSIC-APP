const  express=require("express");
const router = express.Router();
const  UserController=require('../controllers/userController');
const checkUserAuth =require ('../middlewares/auth-middleware'); 

// Route Level Middleware -to protect
router.use('/changepassword',checkUserAuth)
router.use('/loggedUser',checkUserAuth)


//Publice Routes
router.post('/register',UserController.userRegistration)
router.post('/login',UserController.userLogin)

//private routes
router.post('/changePassword',UserController.changeUserPassword)
router.get('/loggedUser',UserController.loggedUser)



module.exports=router
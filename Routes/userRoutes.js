const express = require("express");
const router = express.Router();
const path = require("path");

const multer = require("multer");
const UserController = require("../controllers/userController");
const checkUserAuth = require("../middlewares/auth-middleware");
const restrictTo = require("../middlewares/restrict");

////////

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/img/user");
  },
  filename: (req, file, cb) => {
    const userId = req.user.id;
    const ext = file.mimetype.split("/")[1];
    cb(
      null,
      file.fieldname +
        "-" +
        Date.now() +
        "-" +
        userId +
        "-" +
        path.extname(file.originalname)
    );
  },
});
const userFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("not an image ! please upload only image", 400), false);
  }
};
const upload = multer({
  storage: userStorage,
  fileFilter: userFilter,
});

//////

// Route Level Middleware -to protect
router.use("/changepassword", checkUserAuth);
router.use("/loggedUser", checkUserAuth);
router.use("/deleteUser", checkUserAuth);
router.use("/changeUserProfile",checkUserAuth);

//Publice Routes
router.post("/register", UserController.userRegistration);
router.post("/login", UserController.userLogin);

//private routes
router.post("/changePassword", UserController.changeUserPassword);
router.post("/changeUserDetails", UserController.changeUserDetails);
router.post(
  "/changeUserProfile/:id",
  upload.single("userProfilePhoto"),

  UserController.changeUserProfilePhoto
);
router.get("/loggedUser", UserController.loggedUser);
router.delete(
  "/deleteUser/:id",
  restrictTo("admin"),
  UserController.deleteUserById
);
router.get("/allusers", UserController.loadAllUsers);

//playlists routes

module.exports = router;

const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const passport = require('passport');
const wrapAsync = require('../utils/wrapAsync'); 

router.get("/signup", userController.renderSignup);
router.post("/signup", wrapAsync(userController.signup));

router.get("/login", userController.renderLogin);
router.post("/login", passport.authenticate("local", { failureRedirect: '/login', failureFlash: true }), userController.login);

router.get("/logout", userController.logout);

module.exports = router;
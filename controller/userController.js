// controllers/userController.js

const User = require("../models/user.js");
const passport = require('passport');


const userController = {
    renderSignup: (req, res) => {
        res.render("users/signup.ejs", { errmsg: req.flash("error") });
    },

    signup: async (req, res, next) => {
        try {
            const { username, email, password, phoneNumber } = req.body;
            
            const existingUser = await User.findOne({ $or: [{ username }, { email }] });
            if (existingUser) {
                req.flash("error", "Username or email already exists");
                return res.redirect("/signup");
            }

            const newUser = new User({ 
                username, 
                email, 
                phoneNumber 
            });

            // Add profile picture if uploaded
            if (req.file) {
                newUser.profilePicture = {
                    url: req.file.path,
                    filename: req.file.filename
                };
            }

            const registeredUser = await User.register(newUser, password);
             
            req.login(registeredUser, (err) => {
                if (err) return next(err);
                req.flash("success", "You have successfully registered");
                res.redirect("/complaints");
            });
        } catch (e) {
            console.error("Signup Error:", e);
            req.flash("error", e.message);
            res.redirect("/signup");
        }
    },

    renderLogin: (req, res) => {
        res.render("users/login.ejs", { errmsg: req.flash("error") });
    },

    login: (req, res) => {
        req.flash("success", "You are logged in");
        res.redirect("/complaints");
    },

    logout: (req, res, next) => {
        req.logout((err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "You have logged out");
            res.redirect("/complaints");
        });
    }
};

module.exports = userController;
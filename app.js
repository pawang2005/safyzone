if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

const express = require("express");
const app= express();
const route = require('./routes/complain.js')
const userRoute = require('./routes/user.js')
const mongoose = require("mongoose");
const User = require("./models/user.js");
const serverless = require('serverless-http');
// const ejs = require('ejs');
const path = require("path");
const ejsMate = require("ejs-mate");
const {Incident} = require("./models/incident.js");
const bodyParser = require('body-parser')

const flash = require("connect-flash");
const session = require('express-session')
const passport = require('passport');
const LocalStrategy = require('passport-local');

// const MONGO_URL ="mongodb://127.0.0.1:27017/acehack";
const dbUrl = process.env.ATLASDB_URL;

main().then(() =>{
   console.log("connected to db");
}).catch((err) =>{
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
};

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(bodyParser.json())


// app.use(methodOverride("_method"));

app.engine('ejs', ejsMate);

app.use(session({
    secret: 'sahilk',
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    }
  }));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.post("/api/report-incident", async (req, res) => {
    try {
        const {location, type, severity} = req.body;
        const newIncident = new Incident({
            location,
            type,
            severity,
            user: req.user._id
        });
        await newIncident.save();
        res.json({ success: true, message: "Incident reported!" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.use('/', route)
app.use('/', userRoute)
 
 app.use((err, req ,res , next)=>{
  let{status=500, message="Something went wrong"} = err;  
  res.render("error.ejs",{message});
  //res.status(status).send(message);
 });
 
 app.listen(8080, ()=>{
     console.log("server is listening to port 8080");
 }); 
module.exports.handler = serverless(app);
module.exports = {Incident};
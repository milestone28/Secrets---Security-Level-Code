//jshint esversion:6
require("dotenv").config(); //should be put top 1st to secure your passwords
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const md5 = require("md5"); //obsolete can easily hack this if for the level 3
//const SHA256 = require("crypto-js/sha256"); // its a popular packages for extra security for level 3
//const bcrypt = require("bcrypt"); // level 4 security level
//const saltRounds = 10; // level 4 security level

//Import the main Passport and Express-Session library
const session = require("express-session"); // level 5 security level
const passport = require("passport"); // level 5 security level
const passportLocalMongoose = require("passport-local-mongoose"); // level 5 security level

const app = express();
const uri = "mongodb://127.0.0.1:27017/userDB";
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

//Initialize Middleware
app.use(
  session({
    secret: "Our Little Secret.",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize()); // init passport on every route call.
app.use(passport.session()); // allow passport to use "express-session".



mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to Database...");
  })
  .catch((err) => {
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const userCollection = mongoose.model("User", userSchema);

passport.use(userCollection.createStrategy());
passport.serializeUser(userCollection.serializeUser());
passport.deserializeUser(userCollection.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/login")
  .get(async (req, res) => {
    res.render("login");
  })
  .post(passport.authenticate("local"), async function(req, res) {
    const user = new userCollection({
        username: req.body.username,
        password: req.body.password     
    });
    req.login(user, function(err) {
        if(err) {
            console.log(err);
        } else {
            res.redirect("/secrets");
        }
    });


    //it was remove during level 5 security to apply passport.js

    // try {
    //   const foundUser = await userCollection.findOne({ email: _username });
    //   if (foundUser) {
    //     if (bcrypt.compareSync(_password, foundUser.password)) {
    //       res.render("secrets");
    //     } else {
    //       res.send("Incorrect Password");
    //     }
    //   } else {
    //     res.send("User not found!");
    //   }
    // } catch (error) {
    //   res.send(error);
    // }
  });

app
  .route("/register")
  .get(async (req, res) => {
    await res.render("register");
  })
  .post(async (req, res) => {
    const _username = req.body.username;
    const _password = req.body.password;
    await userCollection.register({username: _username },_password, async (err, user) =>{
        if(err) {
            console.log(err);
            res.redirect("/register");
        } else {
            passport.authenticate("local")(req,res, function() {
                res.redirect("/secrets");
            });
        }
    });



    //it was remove during level 5 security to apply passport.js
    // const _username = req.body.username;
    // const _password = req.body.password;
    // const hash = bcrypt.hashSync(_password, saltRounds);
    // try {
    //   const user = new userCollection({
    //     email: _username,
    //     password: hash,
    //   });
    //   await user.save();
    //   res.render("secrets");
    // } catch (error) {
    //   res.send(error);
    // }
  });

  app.get("/secrets", (req, res) => {
     // The below line was added so we can't display the "/secrets" page
    // after we logged out using the "back" button of the browser, which
    // would normally display the browser cache and thus expose the 
    // "/secrets" page we want to protect. Code taken from this post.
    res.set(
        'Cache-Control', 
        'no-cache, private, no-store, must-revalidate, max-stal e=0, post-check=0, pre-check=0'
    );
    if(req.isAuthenticated()){
       res.render("secrets")
    } else {
        res.redirect("/login");
    }
  });

  app.get("/logout", function(req,res) {
    req.logout((err)=>{
        if(err){
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
    
});

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started...");
});

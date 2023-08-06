//jshint esversion:6
require("dotenv").config(); //should be put top 1st
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const md5 = require("md5"); //obsolete can easily hack this if for the level 3
const SHA256 = require("crypto-js/sha256"); // its a popular packages for extra security for level 3
const app = express();
const uri = "mongodb://127.0.0.1:27017/userDB";
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to Database...");
  })
  .catch((err) => {
    console.log(err);
  });

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});



const userCollection = mongoose.model("User", userSchema);

app.get("/", function (req, res) {
  res.render("home");
});

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(async function (req, res) {
    const _username = req.body.username;
    const _password = SHA256(req.body.password).toString();

    await userCollection.findOne({email : _username})
    .then((result) => {
        if(result.password === _password){
            res.render("secrets");
        } else {
            res.send("Username is invalid.")
        }
    })
    .catch(err => {
        console.log(err);
    })

  });

app
  .route("/register")
  .get(async function (req, res) {
    await res.render("register");
  })
  .post(async function (req, res) {
    const _username = req.body.username;
    const _password = req.body.password;

    const user = new userCollection({
      email: _username,
      password: SHA256(_password).toString()
    });
    await user
      .save()
      .then(() => {
        res.render("secrets");
      })
      .catch((err) => {
        console.log(err);
      });
  });

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started...");
});

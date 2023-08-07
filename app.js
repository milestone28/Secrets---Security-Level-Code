//jshint esversion:6
require("dotenv").config(); //should be put top 1st to secure your passwords
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const md5 = require("md5"); //obsolete can easily hack this if for the level 3
//const SHA256 = require("crypto-js/sha256"); // its a popular packages for extra security for level 3
const bcrypt = require("bcrypt"); // level 4 security level
const saltRounds = 10; // level 4 security level
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
  .get(async (req, res) => {
    res.render("login");
  })
  .post(async (req, res) => {
    const _username = req.body.username;
    const _password = req.body.password;

    try {
      const foundUser = await userCollection.findOne({ email: _username });
      if (foundUser) {
        if (bcrypt.compareSync(_password, foundUser.password)) {
          res.render("secrets");
        } else {
          res.send("Incorrect Password");
        }
      } else {
        res.send("User not found!");
      }
    } catch (error) {
      res.send(error);
    }
  });

app
  .route("/register")
  .get(async (req, res) => {
    await res.render("register");
  })
  .post(async (req, res) => {
    const _username = req.body.username;
    const _password = req.body.password;
    const hash = bcrypt.hashSync(_password, saltRounds);
    try {
      const user = new userCollection({
        email: _username,
        password: hash,
      });
      await user.save();
      res.render("secrets");
    } catch (error) {
      res.send(error);
    }
  });

app.listen(process.env.PORT || 3000, function () {
  console.log("Server started...");
});

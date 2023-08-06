//jshint esversion:6
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
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

const userSchema = mongoose.Schema({
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
    const _password = req.body.password;

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
      password: _password,
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

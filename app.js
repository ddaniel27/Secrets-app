import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import encrypt from "mongoose-encryption";
import ejs from "ejs";

mongoose.connect("mongodb://localhost:27017/secretsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: "The email field can't be empty",
  },
  password: {
    type: String,
    required: "The password field can't be empty",
  },
});

const secret = process.env.SECRET;
userSchema.plugin(encrypt, {
  secret: secret,
  encryptedFields: ["password"]
});

const User = mongoose.model("User", userSchema);

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (_, res) {
  res.render("home");
});
app
  .route("/register")
  .get(function (_, res) {
    res.render("register");
  })
  .post(function (req, res) {
    new User({
      email: req.body.username,
      password: req.body.password,
    }).save(function (err) {
      if (err) console.log(err);
      else res.render("secrets");
    });
  });
app
  .route("/login")
  .get(function (_, res) {
    res.render("login");
  })
  .post(function (req, res) {
    User.findOne(
      { email: req.body.username },
      function (err, user) {
        if (err) console.log(err);
        else if (!user) console.log("User doesn't exist");
        else user.password == req.body.password ? res.render("secrets") : console.log("Password doesn't match");
      }
    );
  });

app.listen(3000, function () {
  console.log("The server is running");
});

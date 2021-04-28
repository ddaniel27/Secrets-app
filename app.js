import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose";
import ejs from "ejs";
import session from "express-session";
import passport from "passport";
import passportLocalMongoose from "passport-local-mongoose";

const app = express();

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/secretsDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.set("useCreateIndex", true);
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
userSchema.plugin(passportLocalMongoose);
const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (_, res) {
  res.render("home");
});
app
  .route("/register")
  .get(function (_, res) {
    res.render("register");
  })
  .post(function (req, res) {
    User.register({username: req.body.username}, req.body.password, function(err, user){
      if(err) res.redirect("/register");
      else passport.authenticate("local")(_, resp, function(){
        resp.redirect("/secrets");
      });
    });
    
  });
app.route("/login")
  .get(function (_, res) {
    res.render("login");
  })
  .post(passport.authenticate("local", { failureRedirect: "/login" }),function (req, res) {
    res.redirect("/secrets");
  });

app.route("/secrets")
  .get(function(_,res){
    res.render("secrets");
  });

app.listen(3000, function () {
  console.log("The server is running");
});

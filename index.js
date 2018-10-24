require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const AuthStrategy = require("passport-auth0");
const { DOMAIN, CLIENT_ID, CLIENT_SECRET, SESSION_SECRET, PORT } = process.env;
const port = PORT || 3001;
const students = require("./students.json");

const app = express();

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 365 }
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new AuthStrategy(
    {
      domain: DOMAIN,
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: "/login",
      scope: "openid email profile"
    },
    (accessToken, refreshToken, extraParams, profile, done) =>
      done(null, profile)
  )
);

passport.serializeUser((user, done) =>
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  })
);
passport.deserializeUser((obj, done) => done(null, obj));

app.get(
  "/login",
  passport.authenticate("auth0", {
    successRedirect: "/students",
    failureRedirect: "/login",
    connection: "github"
  })
);

app.get("/students", (req, res, next) => {
  res.status(200).send(students);
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

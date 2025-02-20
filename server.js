const dotenv = require('dotenv').config();
const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const app = express();
const port = 3000;

const CLIENT_ID_GITHUB = process.env.CLIENT_ID_GITHUB;
const CLIENT_SECRET_GITHUB = process.env.CLIENT_SECRET_GITHUB;
const CLIENT_ID_GOOGLE = process.env.CLIENT_ID_GOOGLE;
const CLIENT_SECRET_GOOGLE = process.env.CLIENT_SECRET_GOOGLE;

passport.use(new GitHubStrategy({
  clientID: CLIENT_ID_GITHUB,
  clientSecret: CLIENT_SECRET_GITHUB,
  callbackURL: "http://localhost:3000/auth/github/callback"
}, (accessToken, refreshToken, profile, done) => {
  return done(null, profile);
}));

passport.use(new GoogleStrategy({
    clientID: CLIENT_ID_GOOGLE,
    clientSecret: CLIENT_SECRET_GOOGLE,
    callbackURL: "http://localhost:3000/auth/google/callback"
  }, (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

app.use(session({
    secret: "secret",
    resave: false,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/");
};

app.get("/", (req, res) => {
    const html = "<a href='/auth/github'>Login with GitHub</a>";
    const html2 = "<a href='/auth/github'>Login with GitHub</a>";
    res.send(html + "<br>" + html2);
});

app.get("/auth/github", 
    passport.authenticate("github", { scope: ["user:email"] }));

app.get("/auth/google", 
    passport.authenticate("google", { scope: ["user:email"] }));

app.get("/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/profile");
    });

app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => {
        res.redirect("/profile");
    });

app.get("/profile", ensureAuthenticated, (req, res) => {
    res.send(`Hola ${req.user.displayName || req.user.username}`);
});

app.get("/logout", (req, res) => {
    req.logout(done => {
        console.log("Logout");
    });
    res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
const passport = require("passport");
const User = require("../model/userModel");
const GoogleStrategy = require("passport-google-oauth2").Strategy;
const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = (id, expiresIn, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3005/auth/google/callback",
      passReqToCallback: true,
    },
    async (request, accessToken, refreshToken, profile, done) => {
      try {
        const roleUser = request.query.state;
        const avatarUrl =
          profile.photos && profile.photos[0] ? profile.photos[0].value : null;
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          console.log("Creating user with data:", {
            googleId: profile.id,
            fullName: profile._json.name,
            email: profile.emails[0].value,
            role: roleUser,
            avatar: avatarUrl,
          });

          user = await User.create({
            googleId: profile.id,
            fullName: profile._json.name,
            email: profile.emails[0].value,
            avatar: avatarUrl,
            role: roleUser,
          });
        } else if (!user.googleId) {
          user.googleId = profile.id;
          user.fullName = profile._json.name;
          user.role = roleUser;
          user.avatar = avatarUrl;
          await user.save();
        }

        const refreshToken = generateToken(user._id, "7d", user.role);
        user.refreshToken = refreshToken;
        await user.save();

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;

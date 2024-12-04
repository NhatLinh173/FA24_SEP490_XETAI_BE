const passport = require("passport");
const User = require("../model/userModel");
const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();
const jwt = require("jsonwebtoken");

const generateToken = (id, expiresIn, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: expiresIn,
  });
};
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3005/auth/facebook/callback",
      profileFields: ["id", "emails", "name", "photos"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const roleUser = "customer";

        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          user = new User({
            facebookId: profile.id,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            email: profile.emails[0].value,
            role: roleUser,
            avatar: profile.photos[0]?.value || "",
          });
          await user.save();
        } else if (!user.facebookId) {
          user.facebookId = profile.id;
          user.role = roleUser;
          user.avatar = profile.photos[0]?.value || "";
          await user.save();
        }

        const refreshToken = generateToken(user._id, "7d", user.role);
        user.refreshToken = refreshToken;
        await user.save();

        done(null, user);
      } catch (error) {
        done(error, null);
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

const passport = require("passport");
const User = require("../model/userModel");
const FacebookStrategy = require("passport-facebook").Strategy;
require("dotenv").config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "http://localhost:3005/auth/facebook/callback",
      profileFields: ["id", "emails", "name"], // Đảm bảo bạn yêu cầu các trường cần thiết
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        let user = await User.findOne({ facebookId: profile.id });

        if (!user) {
          user = new User({
            facebookId: profile.id,
            name: `${profile.name.givenName} ${profile.name.familyName}`,
            email: profile.emails[0].value,
          });

          await user.save();
        }

        return cb(null, user);
      } catch (error) {
        return cb(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

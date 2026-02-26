import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../Models/userSchema.js";
import env from "dotenv";
env.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLINT_ID,
      clientSecret: process.env.CLINT_SECRET,
      callbackURL: "http://localhost:3000/google/authenticate",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        let user = await User.findOne({ email });
        if (user) {
          if (!user.googleId) {
            user.googleId = profile.id;
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          userName: profile.displayName,
          email,
          googleId: profile.id,
        });
        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    },
  ),
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, { user });
});

export default passport;

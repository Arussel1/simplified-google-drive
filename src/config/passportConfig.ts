import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcryptjs from 'bcryptjs';
import { UserQueries, User } from './queries';

const userQueries = new UserQueries();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await userQueries.getUser(username);
      
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const isMatch = await bcryptjs.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: 'Incorrect password.' });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, (user as User).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await userQueries.getUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

export default passport;

const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const Models = require('./models.js');
const passportJWT = require('passport-jwt');

let Users = Models.User;
let jwtStrategy = passportJWT.Strategy;
let extractJWT = passportJWT.ExtractJwt;

passport.use(
  new localStrategy(
    {
      usernameField: 'Username',
      passwordField: 'Password'
    },
    (username, password, callback) => {
      console.log(username + ' ' + password);
      Users.findOne({ Username: username })
        .then((user) => {
          if (!user) {
            console.log('incorrect username');
            return callback(null, false, {
              message: 'Incorrect username or password.'
            });
          }

          if (!user) {
            console.log('incorrect password');
            return callback(null, false, { message: 'Incorrect password.' });
          }

          if (!user.validatePassword(password)) {
            console.log('Incorrect password');
            return callback(null, false, { message: 'Incorrect password.' });
          }

          console.log('finished');
          return callback(null, user);
        })
        .catch((error) => {
          console.error(error);
          return callback(error);
        });
    }
  )
);

passport.use(
  new jwtStrategy(
    {
      jwtFromRequest: extractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: 'your_jwt_secret'
    },
    (jwtPayload, callback) => {
      return Users.findById(jwtPayload._id)
        .then((user) => {
          return callback(null, user);
        })
        .catch((error) => {
          return callback(error);
        });
    }
  )
);
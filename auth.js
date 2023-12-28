// This has to be the same key used in the JWT Strategy (in passports.js)
/**
 * JSON Web Token for login
 */
const jwtSecret = 'your_jwt_secret';

const jwt = require('jsonwebtoken'),
    passport = require('passport');

/**
 * local passport file
 */
require('./passport');

let generateJWTToken = (user) => {
    return jwt.sign(user, jwtSecret, {
        subject: user.Username, //username encoding in JWT
        expiresIn: '7d', //token will expire in 7 days
        algorithm: 'HS256' //algorithn used to "sign" or encode values of JWT
    });
}


// module.exports = (router) => {
//     router.post('/login',
//   // wrap passport.authenticate call in a middleware function
//   function (req, res, next) {
//     // call passport authentication passing the "local" strategy name and a callback function
//     passport.authenticate('local', function (error, user, info) {
//       // this will execute in any case, even if a passport strategy will find an error
//       // log everything to console
//       console.log(error);
//       console.log(user);
//       console.log(info);

//       if (error) {
//         res.status(401).send(error);
//       } else if (!user) {
//         res.status(401).send(info);
//       } else {
//         next();
//       }

//       res.status(401).send(info);
//     })(req, res);
//   },

//   // function to call once successfully authenticated
//   function (req, res) {
//     res.status(200).send('logged in!');
//   });
// }


/**
 *  * POST login - authenticate login and return error message if error or not recognized
*/ 
module.exports = (router) => {
    router.post('/login', (req, res) => {
        passport.authenticate('local', {session: false}, (error, user, info) => {
            if (error || !user) {
                return res.status(400).json({
                    message: 'Something is not right',
                    user: user
                    
                });
            }
            req.login(user, {session: false}, (error) => {
                if (error) {
                    res.send(error);
                }
                let token = generateJWTToken(user.toJSON());
                return res.json({ user, token }); //this returns the token
            });
        })(req, res);
    })
}
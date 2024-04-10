const jwtSecret = 'your_jwt_secret'; //Must be the same key used in the JWTStrategy

const jwt = require('jsonwebtoken'),
  passport = require('passport'); //local passport file with defined strategies

require('./passport');

let generateJWTToken = (user) => {
  return jwt.sign(user, jwtSecret, {
    subject: user.Username, //This is the username being encoded in the JWT
    expiresIn: '7d', //Token will expire in 7 days
    algorithm: 'HS256' //Algorithm used to "sign" or encode the values of the JWT
  });
}

//POST endpoint /login for user authentication. Uses Passport.js and generates a JSON Web Token (JWT) upon successful authentication.
module.exports = (router) => {
  router.post('/login', (req, res) => {
    passport.authenticate('local', { session: false }, (error, user, info) => {//session:false ensures it won't save the user in the session
      if (error || !user) {
        return res.status(400).json({
          message: 'Something is not right',
          user: user
        });
      }
      req.login(user, { session: false }, (error) => {
        if (error) {
          res.send(error);
        }
        let token = generateJWTToken(user.toJSON());
        return res.json({ user, token });
      });
    })(req, res);
  });
}
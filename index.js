require('dotenv').config();

const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  morgan = require("morgan");

const mongoose = require('mongoose');
const Models = require('./models.js');
  
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect( process.env.CONNECTION_URI );

const app = express();

const { check, validationResult } = require('express-validator');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['http://localhost:1234'];

app.use(cors({
  origin: (origin, callback) => {
    if(!origin) return callback(null, true);
    if(allowedOrigins.indexOf(origin) === -1){ // If a specific origin isn’t found on the list of allowed origins
      let message = 'The CORS policy for this application doesn’t allow access from origin ' + origin;
      return callback(new Error(message ), false);
    }
    return callback(null, true);
  }
}));

let auth = require('./auth')(app);
const passport = require('passport');require('./passport');

app.use(morgan("common"));

//Mongoose - Get all movies and all their data (2a)
app.get('/movies', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.find()
  .then((movie) => {
    res.status(200).json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

/*app.get('/', (req, res) => {
  res.send('The website is under development');
});*/

//Mongoose - Get movie by title (2b)
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.status(200).json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Get genre by genre name (2c)
app.get("/movies/genre/:genreName", passport.authenticate('jwt', { session: false }), async (req, res) => {
  console.log(req.params.genreName);
  await Movies.findOne({ "Genre.Name": req.params.genreName })
  .then((movie) => {
    res.status(200).json(movie.Genre);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});  

//Mongoose - Get data about a director (2d)
app.get('/movies/director/:directorName', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Movies.findOne({ "Director.Name": req.params.directorName })
    .then((movie) => {
      res.status(200).json(movie.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Get all users
app.get('/users', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Add a user (2e)
app.post('/users', [
  check('Username', 'Username must be at least 5 characters long').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  check('Email', 'Email does not appear to be valid').isEmail()
], async (req, res) => {
  let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOne({ Username: req.body.Username })//Query Users model to check if username from client already exists. If so, alert them.
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + 'already exists');
      } else {
        Users
          .create({//if user does not exist, use Mongoose .create command to set up new user matching schema from models.js file
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday
          })
          .then((user) =>{ res.status(201).json(user) })//callback sends a response and displays the new user to the client
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
});

//Mongoose - Allow users to update their info (2f)
app.put('/users/:Username', [
  check('Username', 'Username must be at least 5 characters long').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  check('Email', 'Email does not appear to be valid').isEmail()
], passport.authenticate('jwt', { session: false }), async (req, res) => {
  let errors = validationResult(req); //check validation object for errors
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
  }
  //Condition to check that username in request matches username in request params
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }
  let hashedPassword = Users.hashPassword(req.body.Password);
  await Users.findOneAndUpdate({ Username: req.params.Username }, //Condition ends, finds user and updates their info
  { $set:
    {
      Username: req.body.Username,
      Password: hashedPassword,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
  },
  { new: true }) //This line makes sure that the updated document is returned
  .then((updatedUser) => {
    res.json(updatedUser);
  })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Allow users to add movie to their favorites (2g)
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $push: { FavoriteMovies: req.params.MovieID }
   },
   { new: true })
  .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Allow users to delete movie from their favorites (2h)
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
     $pull: { FavoriteMovies: req.params.MovieID }
   },
   { new: true })
   .then((updatedUser) => {
    res.json(updatedUser);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Delete user (2i)
app.delete('/users/:Username', passport.authenticate('jwt', { session: false }), async (req, res) => {
    if(req.user.Username !== req.params.Username){
    return res.status(400).send('Permission denied');
  }
  await Users.findOneAndDelete({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0',() => {
 console.log('Listening on Port ' + port);
});

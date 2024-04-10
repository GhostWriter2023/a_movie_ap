const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  morgan = require("morgan");

const mongoose = require('mongoose');
const Models = require('./models.js');
  
const Movies = Models.Movie;
const Users = Models.User;

mongoose.connect('mongodb://127.0.0.1:27017/projectDB'/*, { useNewUrlParser: true, useUnifiedTopology: true }*/);

const app = express();

const { check, validationResult } = require('express-validator');

//app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const cors = require('cors');
let allowedOrigins = ['*'];

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

//Module 2.2.5 Endpoints - Get movie by title (2b)
/*app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("Title not found!");
  }
});*/

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

//Module 2.2.5 Endpoints - Get genre by genre name (2c)
/*app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;

  const genre = movies.filter((movie) => movie.Genre.Name === genreName);

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("Genre not found!");
  }
});*/

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

//Module 2.2.5 Endpoints - Get data about a director (2d)
/*app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.filter((movie) => movie.Director.Name === directorName);

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("Director not found!");
  }
});*/

//Mongoose - Add a user (2e)
app.post('/users', [
  check('Username', 'Username must be at least 5 characters long').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  check('Email', 'Email does not appear to be valid').isEmail(),
  check('Birthday', 'Birthday must be in DD-MM-YYYY format').matches(/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/)
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

//Module 2.2.5 Endpoints - Add a user (2e)
/*app.post("/users", (req, res) => {
  let newUser = req.body;

  if (!newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  } else {
    res.status(400).send("Users must provide a name in request body");
  }
});*/

//Mongoose - Get all users (not a task req't)
app.get('/users', async (req, res) => {
  await Users.find()
    .then((user) => {
      res.status(201).json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Get a user by username (not a task req't)
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
  });
});

//Mongoose - Allow users to update their info (2f)
app.put('/users/:Username', [
  check('Username', 'Username must be at least 5 characters long').isLength({min: 5}),
  check('Username', 'Username contains non alphanumeric characters - not allowed.').isAlphanumeric(),
  check('Password', 'Password is required').not().isEmpty(),
  check('Password', 'Password must be at least 8 characters long').isLength({ min: 8 }),
  check('Email', 'Email does not appear to be valid').isEmail(),
  check('Birthday', 'Birthday must be in MM-DD-YYYY format').matches(/^([0-9]{2})-([0-9]{2})-([0-9]{4})$/)
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
      Password: req.body.Password,
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

//Module 2.2.5 Endpoints - Allow users to update their info (2f)
/*app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.Name = updatedUser.Name;
    res.status(200).json(user);
  } else {
    res.status(400).send("No user with that ID was found.");
  }
});*/

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

//Module 2.2.5 Endpoints - Allow users to add movie to their favorites (2g)
/*app.post("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.FavoriteMovies.push(movieTitle);
    res
      .status(200)
      .send(`${movieTitle} has been added to the array of user id: ${id}`);
  } else {
    res.status(400).send("No user with that ID was found.");
  }
});*/

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

//Module 2.2.5 Endpoints - Allow users to delete movie from their favorites (2h)
/*app.delete("/users/:id/:movieTitle", (req, res) => {
  const { id, movieTitle } = req.params;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.FavoriteMovies = user.FavoriteMovies.filter(
      (title) => title !== movieTitle,
    );
    res
      .status(200)
      .send(`${movieTitle} has been deleted from the array of user id: ${id}`);
  } else {
    res.status(400).send("No user with that ID was found.");
  }
});*/

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


//Module 2.2.10 - Created this endpoint to delete all documents in the Users Collection
/*app.delete('/users', async (req, res) => {
  try {
    const result = await Users.deleteMany({});
    console.log(`${result.deletedCount} documents deleted.`);
    res.status(200).json({ message: `${result.deletedCount} documents deleted.` });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error: ' + err.message);
  }
});*/

//Module 2.2.5 Endpoints - Delete user (2i)
/*app.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  //const deregisterUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    //user.Name = deregisterUser.Name;
    users = users.filter((user) => user.id != id);
    //res.json(users);
    res
      .status(200)
      .send(`user id: ${user.id}, name: ${user.Name} has been removed from the users array.`);
  } else {
    res.status(400).send("No user with that ID was found.");
  }
});*/

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(27017, () => {
  console.log("Your app is listening on port 27017.");
});

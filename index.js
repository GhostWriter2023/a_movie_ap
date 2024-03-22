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

//app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("common"));

//Mongoose - Get all movies and all their data (2a)
app.get('/movies', async (req, res) => {
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
app.get('/movies/:Title', async (req, res) => {
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

//Mongoose - Get genre by genre name (2c) "CODE NOT WORKING - error 404"
app.get("/movies/genre/:genreName", async (req, res) => {
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
app.get('/movies/director/:directorName', async (req, res) => {
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
app.post('/users', async (req, res) => {
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: req.body.Password,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) =>{ res.status(201).json(user) })
          .catch((error) => {
            console.error(error);
            res.status(400).send('Error: Missing information & ' + error);
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

//Mongoose - Allow users to update their info (2f) "NOT WORKING - Code 200 and Null response, and user parameters don't get updated"
app.put('/users/:Username', async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username },
  { $set:
    {
      Username: req.body.Username,
      Password: req.body.Password,
      Email: req.body.Email,
      Birthday: req.body.Birthday
    }
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
app.post('/users/:Username/movies/:MovieID', async (req, res) => {
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
app.delete('/users/:Username/movies/:MovieID', async (req, res) => {
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
app.delete('/users/:Username', async (req, res) => {
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

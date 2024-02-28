const express = require("express"),
  bodyParser = require("body-parser"),
  uuid = require("uuid"),
  morgan = require("morgan");

const app = express();

app.use(bodyParser.json());

let users = [
  {
    id: 1,
    Name: "John",
    FavoriteMovies: [],
  },
  {
    id: 2,
    Name: "Pat",
    FavoriteMovies: ["Jack Reacher"],
  },
];

let movies = [
  {
    Title: "The Equalizer",
    Description: "TBP for The Equalizer",
    Genre: {
      Name: "Action",
    },
    Director: {
      Name: "Antoine Fuqua",
      Bio: "An American film director known for his work in the action and thriller genres. He was originally known as a director of music videos, and made his film debut in 1998 with The Replacement Killers. His critical breakthrough was the 2001 crime thriller Training Day.",
      Birth: "May 30, 1965",
    },
    ImageURL: "TBP for The Equalizer",
  },
  {
    Title: "Mission: Impossible dead reckoning",
    Description: "TBP for Mission: Impossible dead reckoning",
    Genre: {
      Name: "Action",
    },
    Director: {
      Name: "Christopher McQuarrie",
    },
    ImageURL: "TBP for Mission: Impossible dead reckoning",
  },
  {
    Title: "Guardians of the Galaxy",
    Description: "TBP for Guardians of the Galaxy",
    Genre: {
      Name: "Action",
    },
    Director: {
      Name: "James Gunn",
    },
    ImageURL: "TBP for Guardians of the Galaxy",
  },
  {
    Title: "Jack Reacher",
    Description: "TBP for Jack Reacher",
    Genre: {
      Name: "Action",
    },
    Director: {
      Name: "Christopher McQuarrie",
    },
    ImageURL: "TBP for Jack Reacher",
  },
  {
    Title: "Top Gun",
    Description: "TBP for Top Gun",
    Genre: {
      Name: "Action",
    },
    Director: {
      Name: "Tony Scott",
    },
    ImageURL: "TBP for Top Gun",
  },
/*  {
    title: "Gladiator",
  },
  {
    title: "Extraction",
  },
  {
    title: "Lord of the Rings",
  },
  {
    title: "Black Widow",
  },
  {
    title: "Avengers: Endgame",
  },*/
];

app.use(morgan("common"));

app.get("/", (req, res) => {
  res.send("The <strong>myFlix</strong> web page is in development!");
});

app.post("/users", (req, res) => {
  let newUser = req.body;

  if (!newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).send(newUser);
  } else {
    res.status(400).send("Users must provide a name in request body");
  }
});

app.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const updatedUser = req.body;

  let user = users.find((user) => user.id == id);

  if (user) {
    user.Name = updatedUser.Name;
    res.status(200).json(user);
  } else {
    res.status(400).send("No user with that ID was found.");
  }
});

app.post("/users/:id/:movieTitle", (req, res) => {
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
});

app.delete("/users/:id/:movieTitle", (req, res) => {
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
});

app.delete("/users/:id", (req, res) => {
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
});

app.get("/movies", (req, res) => {
  res.status(200).json(movies);
});

app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = movies.find((movie) => movie.Title === title);

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send("Title not found!");
  }
});

app.get("/movies/genre/:genreName", (req, res) => {
  const { genreName } = req.params;

  const genre = movies.filter((movie) => movie.Genre.Name === genreName);

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send("Genre not found!");
  }
});

app.get("/movies/directors/:directorName", (req, res) => {
  const { directorName } = req.params;
  const director = movies.filter((movie) => movie.Director.Name === directorName);

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send("Director not found!");
  }
});

app.use(express.static("public"));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});

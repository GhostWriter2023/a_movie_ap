const express = require("express"),
  morgan = require("morgan");

const app = express();

let topTenMovies = [
  {
    title: "Mission: Impossible Dead Reckoning",
  },
  {
    title: "Guardians of the Galaxy",
  },
  {
    title: "Jack Reacher",
  },
  {
    title: "The Equalizer",
  },
  {
    title: "Top Gun",
  },
  {
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
  },
];

app.use(morgan("common"));

app.get("/movies", (req, res) => {
  res.json(topTenMovies);
});

app.get("/", (req, res) => {
  res.send("myFlix web page is in development!");
});

app.use(express.static('public'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log("Your app is listening on port 8080.");
});

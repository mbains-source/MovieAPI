const express = require("express");
const app = express();
const morgan = require("morgan");
const uuid = require("uuid");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const Models = require("models.js");
const cors = require("cors");
const { check, validationResult } = require("express-validator");

const Movies = Models.Movie;
const Users = Models.User;
const Director = Models.Director;
const Genre = Models.Genre;

let allowedOrigins = [
  "https://myflixmantajbains.herokuapp.com",
  "http://localhost:1234",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        let message =
          "The CORS policy for this application doesnt allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(morgan("common"));
app.use(express.static("public"));

let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

mongoose
  .connect(process.env.CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to db");
  });

app.get("/", (req, res) => {
  res.send("Welcome to FilmForge");
});

// GET: ALL MOVIES
app.get("/movies",  passport.authenticate("jwt", { session: false }),async (req, res) => {
  try {
    const movies = await Movies.find({}).populate("director").populate("genre");
    res.status(200).json(movies);
  } catch (error) {
    console.error(error);
    res.status(404).send("No movies found!");
  }
});

//GET:MOVIE BY TITLE
app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const movie = await Movies.findOne({
        title: req.params.title,
      });
      if (!movie) {
        res.status(404).send("Movie not found!");
      } else {
        res.status(200).json(movie);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
);

// RETURN: GENRE BY TITLE
app.get(
  "/genres/:genre",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const genre = await Genre.findOne({ name: req.params.genre });
      if (!genre) {
        res.status(404).send("Genre not found!");
      } else {
        res.status(200).json(genre);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

// READ: RETURN DATA ABOUT DIRECTOR
app.get(
  "/directors/:director",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const director = await Director.find({ name: req.params.director });

      if (!director) {
        res.status(404).send("Director not found!");
      } else {
        res.status(200).json(director);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

//CREATE:NEW USER
app.post(
  "/users",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    // check the validation object for errors
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    let hashedPassword = Users.hashPassword(req.body.Password);
    try {
      const user = await Users.findOne({ Username: req.body.Username });
      if (user) {
        return res.status(400).send(req.body.Username + " already exists");
      }

      const newUser = await Users.create({
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
      });

      res.status(201).json(newUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

// UPDATE:UPDATE USERNAME
app.put(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed."
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        {
          $set: {
            Username: req.body.Username,
            Password: req.body.Password,
            Email: req.body.Email,
          },
        },
        { new: true } // This line makes sure that the updated document is returned
      );

      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

//CREATE:ADD MOVIE TO USER'S FAVORITE MOVIES LIST
app.post(
  "/users/:/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $addToSet: { favoriteMovies: req.params.movieId } },
        { new: true }
      );
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

//DELETE:MOVIE FROM USER'S FAVORITES
app.delete(
  "/users/:/movies/:movieId",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const updatedUser = await Users.findOneAndUpdate(
        { Username: req.params.Username },
        { $pull: { favoriteMovies: req.params.movieId } },
        { new: true }
      );
      res.json(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).send(error);
    }
  }
);

//DELETE:USER
app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    try {
      const userToDelete = await Users.findOneAndDelete({
        Username: req.params.Username,
      });
      if (!userToDelete) {
        res.status(400).send(`user ${req.params.Username} was not found`);
      } else {
        res.status(200).json(userToDelete);
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Error: " + error);
    }
  }
);

app.use((err, req, res, next) => {
  console.log(err.stack);
  res.status(500).send("Something broke!");
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Listening on port " + PORT);
});

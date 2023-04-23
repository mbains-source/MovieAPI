//require express + morgan
const express = require('express');
  morgan = require('morgan');

const app = express();

//topMovies sourced from IMDB top 10 movies list

let topMovies = [
  {
      title: 'The Shawshank Redemption',
      director: 'Frank Darabont'
  },
  {
      title: 'The Godfather',
      director: 'Francis Ford Coppola'
  },
  {
      title: 'The Dark Knight',
      director: 'Christopher Nolan'
  },
  {
      title: 'The Godfather Part II',
      director: 'Francis Ford Coppola'
  },
  {
      title: 'Schindlers List',
      director: 'Steven Spielberg'
  },
  {
      title: 'The Lord of the Rings: The Return of the King',
      director: 'Peter Jackson'
  },
  {
      title: 'Pulp Fiction',
      director: 'Quentin Tarantino'
  },
  {
      title: 'The Lord of the Rings: The Fellowship of the Ring',
      director: 'Peter Jackson'
  },
  {
      title: 'Forrest Gump',
      director: 'Robert Zemeckis'
  },
  {
      title: 'Fight Club',
      director: 'David Fincher'
  },
];

//GET REQUEST FOR JSON TOPMOVIES
app.get('/movies', (req,res) => {
  res.json(topMovies);
});


//GET REQUEST ENDPOINT FOR '/'
app.get('/', (req,res) => {
  res.send('This text message is to be generated at the endpoint "/" ')
});

//express.Static and Morgan common
app.use(express.static('public'));

app.use(morgan('common'));

//error handling middleware function
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

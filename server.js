const express = require('express'),
      app = express,
      bodyParser = require('body-parser'),
      uuid = require('uuid');

app.use(bodyParser.json());

let users = []

let movies = []

//READ
app.get('/movies'), (req,res) => {
  res.status(200).json(movies);
})

app.listen(8080, () => console.log("listening on 8080"))

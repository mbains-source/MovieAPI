const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const movieSchema = new mongoose.Schema({
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    director:  [{type: mongoose.Schema.Types.ObjectId, ref: 'Director'}],
    
    genre: [{type: mongoose.Schema.Types.ObjectId, ref: 'Genre'}]
  });

  const genreSchema = mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    }
  });
  
  const directorSchema = mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    bio: {
      type: String,
      required: true
    },
    birth: {
      type: Date,
      required: true
    }
    
  });
  

const userSchema = mongoose.Schema({
    Username: {type: String, required: true},
    Password: {type: String, required: true},
    Email: {type: String, required: true},
    favoriteMovies: [{type: mongoose.Schema.Types.ObjectId, ref: 'Movie'}]
});

userSchema.statics.hashPassword = (password) => {
  return bcrypt.hashSync(password, 10)
}

userSchema.methods.validatePassword = function(password) {
  return bcrypt.compareSync(password, this.Password)
}

let Movie = mongoose.model('Movie', movieSchema);
let User = mongoose.model('User', userSchema);
let Genre = mongoose.model('Genre', genreSchema);
let Director = mongoose.model('Director', directorSchema);

module.exports.Movie = Movie;
module.exports.User = User;
module.exports.Director = Director;
module.exports.Genre = Genre;
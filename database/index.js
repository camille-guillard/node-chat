const mongoose = require('mongoose');

exports.clientPromise = mongoose.connect('mongodb+srv://camille:DS6QDGANnpKJOFwH@cluster0.gvcwc.mongodb.net/chat?retryWrites=true&w=majority', {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('connexion db ok!'))
.catch( err => console.log(err))
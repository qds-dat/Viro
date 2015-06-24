var mongoose = require('mongoose');
mongoose.connect(ENUM.DatabaseConnection);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function (callback) {
  // yay!
});

module.exports = mongoose;
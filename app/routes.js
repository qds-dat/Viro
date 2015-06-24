// routes.js
var auth = require('../Auth/auth.js');
var express = require('express');
// Setting up the required frameworks here

// Ready?


module.exports = function (app) {
  
    var user = require('../routes/UserRoute.js');
    var video = require('../routes/VideoRoute.js');
    // Setting up Routes
        
     app.use('/api/User/', user);
     app.use('/api/Video/', auth, video);






};

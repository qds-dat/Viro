// server.js 

// Setting up and loading the all frameworks that we need
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var http = require('http');

var ENUM = require('./Config.js');

var app = express();
var multer = require('multer');
var ActionResult = require('./ActionResult.js');
// Setting up the port right now at 5858

var port = process.env.PORT || 5858;

// config app
app.use(morgan('dev'));                                 // log every request to the console
app.use(bodyParser.json());                             // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));     // parse application/x-www-form-urlencoded
app.use(methodOverride());                              // simulate DELETE and PUT
app.use('/assets', express.static('assets'));           // access and use files from assets
app.use('/resource', express.static('resource'));       // access and use files from resource
app.use(multer());                                      // use of the multer - multipart framework here
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    res.ActionResult = new ActionResult(res);
    next();
});

// Global scope
var LocalStorage = require('node-localstorage').LocalStorage;
global.localStorage = new LocalStorage('../TokenStorage');
global.ENUM = ENUM;

global.__base = __dirname;
// routes ======================================================================
require('./app/routes.js')(app); // load our routes 

//Creating the server with the app
http.createServer(app).listen(port, function () {
    console.log("Scooper BackEnd In Development On Port: " + port);
});

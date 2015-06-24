var express = require('express');
var VideoServices = require('../Services/VideoService.js');
var router = express.Router();
var auth = require('../Auth/auth.js');
var Underscore = require('underscore');
//********* PATH : /api/Video ***********

//-- get video by id
// # GET
// url : [host]/[path]/[video_id]
router.get('/:id', function (req, res) {  
    var video_id = req.params.id;
    VideoServices
    .GetById(req.user.id,video_id)
    .then(function (data) {    
        res.ActionResult._success(data);        
    }, function (err) {
        res.ActionResult._400(err.message);
    });
  
});

//-- search video by kind
// # POST
// url : [host]/[path]/search/[amount]
// data : kind , title
router.post('/search/:amount', function (req, res) {

    VideoServices
    .Search(req.body.data,req.params.amount)
    .then(function (data) {      
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });
  
});

//-- vote video
// #GET
// url : [host]/[path]/vote/[video_id]
router.get("/vote/:id", function (req, res) {   

    VideoServices
    .VoteVideo(req.user.id, req.params.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

//-- inform video
// #GET
// url : [host]/[path]/inform/[video_id]
router.get("/inform/:id", function (req, res) {
    
    VideoServices
    .Dangerous(req.user.id, req.params.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

//-- count view video
// #GET
// url : [host]/[path]/view/[video_id]
router.get('/view/:id', function (req, res) {
    
    VideoServices
    .CountView(req.params.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    }); 
  
});

//-- follow video
// #GET
// url : [host]/[path]/follow/[video_id]
router.get('/follow/:id', function (req, res) {   
    
    VideoServices
    .Follow(req.user.id , req.params.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    }); 

});

//-- get rank board
// #GET
// url : [host]/[path]/rankboard/[pageNumber]
router.get('/rankboard/:pageNumber', function (req, res) {
    
    VideoServices
    .RankBoard(req.params.pageNumber)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});







module.exports = router;
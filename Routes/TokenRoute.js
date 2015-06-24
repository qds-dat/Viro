//var express = require('express');
//var Student = require('../database/StudentSchema.js');
//var StudentModel = new Student();
//var moment = require('moment');
//var jwt = require('jwt-simple');
//var secret = 'quodisys';

//var router = express.Router();
//router.post('/Get', function (req, res) {
//    var username = req.body.username;
//    var password = req.body.password;

//    StudentModel.FindOne({ username: username }, function (err, student) {
//        if (err || student == null) {

//            res.writeHead(404, { 'Content-Type': 'application/json' });
//            res.end(JSON.stringify({ msg: 'Token is expr' }));
//        }
//        else {
//            if (student.password != password) {
//                res.json({ msg: 'Password invalid' });
//            }

//            var expires = moment().add('days', 7).valueOf();
//            var token = jwt.encode({
//                iss: student.username,
//                exp: expires
//            }, secret);

//            res.json({
//                token : token,
//                expires: expires,
//                user: {
//                    username : student.username,
//                    profile: student.profile
//                }
//            }); 

//        }
        
//    })

//});

//router.get('/Refresh', function (req, res) {
    
//});

//module.exports = router;
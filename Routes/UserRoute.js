var express = require('express');
var UserServices = require('../Services/UserService.js');
var router = express.Router();
var auth = require('../Auth/auth.js');
var cf = require('../CommonFunction.js');
//************* PATH : /api/User ****************

//-- create new user
// #POST
// url : [host]/[path]/
// data : email,password,name
router.post('/', function (req, res) {       

    UserServices
    .Insert(req.body.data)
    .then(function (data) {
        res.ActionResult._success("Register successfull", {});
    }, function (err) {
        res.ActionResult._400( err.message);
    });
    
});

//-- token
// #POST 
// url : [host]/[path]/token
// data : email , password
router.post('/token', function (req, res) {
    UserServices
    .Login(req.body.data).then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

//-- get user's information by user_id
// #GET
// url : [host]/[path]/profile
router.get('/profile', auth, function (req, res) {

    UserServices
    .GetProfile(req.user.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });
    
});

//-- update user's information by user_id
// #POST
// url : [host]/[path]/profile
// data : name , avatarurl , birthday , joindate
router.post('/profile', auth, function (req, res) {
    
    UserServices
    .UpdateProfile(req.user.id, req.body.data)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400( err.message);
    });

});

//-- get user's setting 
// #GET
// url : [host]/[path]/setting
router.get('/setting', auth, function (req, res) {

    UserServices
    .GetSetting(req.user.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

//-- update user's setting by user_id
// #POST
// url : [host]/[path]/setting
router.post('/setting', auth, function (req, res) {
    UserServices
    .UpdateSetting(req.user.id,req.body.data)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });
});

//-- get user's videos 
// #GET
// url : [host]/[path]/myvideo/[video_type]
//type code :
//+ 0:get all
//+ 1:public
//+ 2:private
//+ 3:follow
router.get('/video/get/:type?', auth, function (req, res) {
    var typecode = req.params.type || "0";
    UserServices.MyVideo(req.user.id, typecode)
    .then(function (data) {     
        res.ActionResult._success(data);
    }, function (err) { 
        res.ActionResult._400(err.message);
    });   
});

// upload avatar
// #POST
// url : [host]/[path]/avarta
// data : title , [video_file] , kind , pub , fileUpload
router.post('/avatar', auth, function (req, res) {
    
    UserServices.UploadAvatar(req.user.id, req.files.photoFile)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

// upload videos 
// #POST
// url : [host]/[path]/video/upload
// data : title , kind , pub
// fileUpload : [videoFile] , [videoThumbnail]  (videoThumbnail's extension is alway .jpg) 
router.post('/video/upload', auth, function (req, res) {
    
    req.body.data = {
        title: req.body.title || "",
        pub: cf.parseBooleanWithDefault(req.body.pub,true),
        kind: req.body.kind || ENUM.VIDEO_KIND.traditional,
    }
    
    UserServices.UploadVideo(req.user.id, req.body.data, req.files.videoFile, req.files.videoThumbnail)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

// get user's video with rank 
// #GET
// url : [host]/[path]/video/rank
router.get('/video/rank', auth, function (req, res) {   
    UserServices.MyRank(req.user.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });
});

//-- edit videos info (title,kind,pub)
// #POST
// url : [host]/[path]/video/edit/[video_id]
// data : title,kind , pub
router.post('/video/edit/:id', auth, function (req, res) {
    UserServices.UpdateVideo(req.user.id,req.params.id , req.body.data)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });
});

//-- delete videos
// #DELETE
// url : [host]/[path]/video/delete/[video_id]
router.get('/video/delete/:id', auth, function (req, res) {
    
    UserServices.DeleteVideo(req.user.id, req.params.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

/* test */

//-- comment video
// #POST
// url : [host]/[path]/comment/video_id
// data : content
router.post('/comment/:id', auth, function (req, res) {
    
    req.body.data.video_id = req.params.id;
    UserServices
    .Comment(req.user.id , req.body.data)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });
  
});

// update user's comment 
// #POST
// url : [host]/[path]/comment
// data :comment_id , content
router.post('/comment/edit/:id', auth, function (req, res) {
    
    UserServices.UpdateComment(req.user.id,req.params.id, req.body.data)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});

// delete user's comment 
// #DELETE
// url : [host]/[path]/comment/[comment_id]
router.get('/comment/delete/:id', auth, function (req, res) {
    
    UserServices.DeleteComment(req.params.id)
    .then(function (data) {
        res.ActionResult._success(data);
    }, function (err) {
        res.ActionResult._400(err.message);
    });

});



module.exports = router;
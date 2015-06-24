var schema = require('../DataObject/Schema.js');
var userModel = schema.User;
var videoModel = schema.Video;
var jwt = require('jwt-simple');
var cf = require('../CommonFunction.js');
var Promise = require('promise');
var Underscore = require('underscore');
var ValidationSchema = require('../ValidationSchema.js');
var DTO = require('../DTO.js');
var fs = require('fs');
// config qiniu
var qiniu = require('node-qiniu');
var qn = qiniu.config(ENUM.QINIU.Config);
var ViroBucket = new qn.Bucket(ENUM.QINIU.Bucket);
// declare UserService object
var UserService = {};

UserService.Insert = function (data) {
    
    return new Promise(function (resolve, reject) {
        try {
            
            var valid = cf.validation(ValidationSchema.User, data);
            if (valid != true)
                return reject(valid);
            
            // encrypt pass and create salt                
            data.salt = cf.CreateSalt();
            var password = cf.Encrypt(data.password + data.salt);
            data.password = password;
            // fill missing data default
            var user = cf.updateObjectData(data, DTO.user());
            cf.updateObjectData(data, user.profile);
            
            user.email = user.email.trim().toLowerCase();
            user.profile.name = user.profile.name.trim();
            
            // new user           
            var newUser = new userModel(user);
            //save
            newUser.save(function (err, retVal) {
                if (err)
                    return reject(err);
                else
                    return resolve(retVal);
            });

        } catch (ex) {
            return reject(ex);
        }
    })
              
},

UserService.Login = function (user) {
    
    return new Promise(function (resolve, reject) {
        try {
            var data = cf.updateObjectData(user, DTO.login());
            data.email = data.email.trim().toLowerCase();
            //Find user by user'sid
            userModel.findOne({ email: data.email }, function (err, user_return) {
                if (err)
                    return reject(err);
                if (user_return == null)
                    return reject({ message: 'User not exist' });
                //compare password after encrypt
                if (user_return.password !== cf.Encrypt(data.password + user_return.salt))
                    return reject({ message: 'Password invalid' });
                //create token
                var token = cf.CreateToken();
                // store token
                localStorage.setItem(user_return.id, JSON.stringify({ token: token, email: user_return.email }));
                // encrypt user's id
                var encryptId = jwt.encode(user_return.id, ENUM.SECRECTKEY);
                
                return resolve({
                    token: encryptId + token,
                    user: user_return
                });
                
            });
        } catch (ex) {
            return reject(ex);
        }
                   
    });
        
},

UserService.GetProfile = function (user_id) {
    
    return new Promise(function (resolve, reject) {
        
        try {
            //Find user by user's id
            userModel.findOne({ _id: user_id }, function (err, user_return) {
                if (err)
                    return reject(err);
                if (user_return == null)
                    return reject({ message: 'User not exist' });
                // return profile                   
                return resolve(user_return.profile);
            });
        } catch (ex) {
            return reject(ex);
        }

            
    });

},
    
UserService.UpdateProfile = function (user_id, profile) {
    
    return new Promise(function (resolve, reject) {
        
        try {
            // fill missing data by default         
            userModel.findOne({ _id: user_id }, function (err, user_return) {
                if (err)
                    return reject(err);
                if (user_return == null)
                    return reject({ message: 'User not exist' });
                
                //update data
                if (!cf.isNullOrUndefine(profile.birthday)) {
                    if (cf.isDate(profile.birthday))
                        profile.birthday = new Date(profile.birthday);
                    else
                        return reject({ message: 'Birthday invalid' });
                }
                
                if (!cf.isNullOrUndefine(profile.joindate))
                    delete profile.joindate;
                
                cf.updateObjectData(profile, user_return.profile);
                
                var valid = cf.validation(ValidationSchema.Profile, user_return.profile);
                if (valid != true)
                    return reject(valid);
                
                user_return.profile.name = user_return.profile.name.trim();
                //save                
                user_return.save(function (err, user_return1) {
                    if (err)
                        return reject(err);
                    
                    //videoModel
                    //.update({ "comments.user_id": user_return1.id }
                    //    , { "$set": { "comments.$.name": user_return1.profile.name } }
                    //    , { multi: true }
                    //    , function (err, arrVideo) { 
                    //    var a = err;
                    //});
                    

                    videoModel
                    .find({ "comments.user_id": user_return1.id })
                    .exec(function (err, arrVideo) {
                        //var url = err;                               
                        for (var i = 0; i < arrVideo.length; i++) {
                            var obj = arrVideo[i];
                            Underscore.map(obj.comments, function (comment) {
                                if (comment.user_id === user_return1.id)
                                    comment.name = user_return1.profile.name;
                            });
                            obj.save(function (err2) {
                                if (err2)
                                    console.log("Update video's comment fail");
                            });
                        }                                                            
                    });

                    return resolve(user_return1.profile);
                });
               
            });
        } catch (ex) {
            reject(ex);
        }
           
    });

},

UserService.GetSetting = function (user_id) {
    
    return new Promise(function (resolve, reject) {
        
        try {
            // find user by user's id
            userModel.findOne({ _id: user_id }, function (err, user_return) {
                if (err)
                    return reject(err);
                if (user_return == null)
                    return reject({ message: 'User does not exist' });
                // return user's setting
                return resolve(user_return.setting);
            });

        } catch (ex) {
            reject(ex);
        }
            
    });

},
    
UserService.UpdateSetting = function (user_id, setting) {
    
    return new Promise(function (resolve, reject) {
        
        try {
            // fill missing data by default         
            userModel.findOne({ _id: user_id }, function (err, user_return) {
                if (err)
                    return reject(err);
                if (user_return == null)
                    return reject({ message: 'User not exist' });
                
                // valid data
                var valid = cf.validation(ValidationSchema.Setting, setting);
                if (valid != true)
                    return reject(valid);
                // update data
                cf.updateObjectData(setting, user_return.setting);
                
                //save   
                user_return.save(function (err, data) {
                    if (err)
                        return reject(err);
                    return resolve(data.setting);
                });
                                   
            });
        } catch (ex) {
            reject(ex);
        }
           
    });
},

UserService.UploadVideo = function (user_id, info, videoFile, videoThumbnail) {
    
    return new Promise(function (resolve, reject) {
        
        try {
            if (cf.isNullOrUndefine(videoFile))
                return reject({ message: "Video missing" });
            
            if (cf.isNullOrUndefine(videoThumbnail))
                return reject({ message: "Video thumbnail missing" });
            
            if (videoThumbnail.size > 1000000)
                return reject({ message: "Thumbnail's maximum size is 1Mb" });
            
            if (videoThumbnail.extension != "jpg")
                return reject({ message: "Thumbnail's extension must be jpg" });
            
            if (cf.isNullOrUndefine(info))
                return reject({ message: "Video's info invalid" });
            
            userModel.findOne({ _id: user_id }, function (err, user_return) {
                if (err)
                    return reject(err);
                if (user_return == null)
                    return reject({ message: 'User not exist' });
                
                // fill missing data
                var videoInfo = cf.updateObjectData(info, DTO.video());
                videoInfo.user_id = user_return._id;
                videoInfo.kind = videoInfo.kind.trim().toLowerCase();
                
                //valid data
                var valid = cf.validation(ValidationSchema.Video, videoInfo);
                if (valid != true)
                    return reject(valid);
                
                videoInfo.kind = ENUM.VIDEO_KIND[videoInfo.kind];
                
                var newVideo = new videoModel(videoInfo);
                
                //save
                newVideo.save(function (err, video_return) {
                    if (err)
                        return reject(err);
                    
                    // put File to qiniu cloud                         
                    var UploadFileToQiniu = new Promise(function (resolve1, reject1) {
                        ViroBucket.putFile(video_return.id, videoFile.path)
                           .then(function (reply) {
                            if (fs.existsSync(videoFile.path))
                                fs.unlinkSync(videoFile.path);
                            resolve1(ENUM.QINIU.ResourcePage + video_return.id);
                        }, function (err) {
                            reject1(err);
                        });

                    });
                    
                    // Save thumbnail 
                    var SaveThumbnail = new Promise(function (resolve1, reject1) {
                        fs.readFile(videoThumbnail.path, function (err, fileData) {
                            var photoName = video_return.id + "." + videoThumbnail.extension;
                            var path = ENUM.HostName + ENUM.DIR.Thumbnail + photoName;
                            var photoPath = __base + path;
                            // write file to project
                            fs.writeFile(photoPath, fileData, function (err) {
                                if (err)
                                    reject1({ message: "Upload fail" });
                                
                                if (fs.existsSync(videoThumbnail.path))
                                    fs.unlinkSync(videoThumbnail.path);
                                
                                resolve1(path);
                            });
                        });
                    });
                    
                    //Result
                    Promise.all([UploadFileToQiniu, SaveThumbnail]).then(function (data) {
                        video_return.url = data[0];
                        video_return.thumbnail = data[1];
                        
                        video_return.save(function (err, result) {
                            if (err)
                                return reject({ message : "Upload Fail" });
                            
                            return resolve(result);
                        })

                    }, function (err) {
                        videoModel.find({ id: video_return.id }).remove().exec();
                        return reject({ message : "Upload Fail" });
                    })


                });
                
            });
                
        } catch (ex) {
            return reject(ex);
        }
    });
},

UserService.UpdateVideo = function (user_id, video_id, videoInfo) {
    return new Promise(function (resolve, reject) {
        try {
            videoModel.findOne({ "_id": video_id }, function (err, video_return) {
                if (err)
                    return reject(err);
                
                if (video_return == null)
                    return reject({ message: 'Video does not exist' });
                
                if (video_return.user_id != user_id)
                    return reject({ message: "You dont have update permission" });
                
                videoInfo.kind = videoInfo.kind = videoInfo.kind.trim().toLowerCase();
                //Update data
                cf.updateObjectData(videoInfo, video_return, ["id", "_id"]);
                
                var valid = cf.validation(ValidationSchema.Video, video_return);
                if (valid != true)
                    return reject(valid);
                
                video_return.kind = ENUM.VIDEO_KIND[video_return.kind];
                
                
                //Save
                video_return.save(function (err1, data) {
                    if (err1)
                        return reject(err1);
                    
                    return resolve(data);
                })

            });
        } catch (ex) {
            return reject(ex);
        }
    });
},
    
UserService.DeleteVideo = function (user_id, video_id) {
    return new Promise(function (resolve, reject) {
        try {
            videoModel.findOne({ "_id": video_id }, function (err, video_return) {
                if (err)
                    return reject(err);
                if (video_return == null)
                    return reject({ message: 'Video does not exist' });
                
                if (video_return.user_id != user_id)
                    return reject({ message: "You dont have delete permission" });
                
                // Remove video from cloud
                var RemoveFromCloud = new Promise(function (resolve1, reject1) {
                    ViroBucket.key(video_return.id).remove(function (err) {
                        if (err)
                            reject1();
                        resolve1();
                    });
                });
                
                // Remove from database
                var RemoveFromDatabase = new Promise(function (resolve1, reject1) {
                    videoModel.remove({ "_id": video_return.id }, function (err, data) {
                        if (err)
                            reject1();
                        resolve1();
                    })
                });
                
                // Result
                Promise.all([RemoveFromCloud, RemoveFromDatabase]).then(function (result, a, b) {
                    return resolve({});
                }, function (err) {
                    return reject({ message: "Delete video fail" });
                });

            });
                                             
        } catch (ex) {
            return reject(ex);
        }
    });
},
   
UserService.UploadAvatar = function (user_id, photoFile) {
    
    return new Promise(function (resolve, reject) {
        try {
            if (cf.isNullOrUndefine(photoFile))
                return reject("Photo is missing");
            
            if (photoFile.size > 1000000)
                return reject("Photo's maximum size is 1Mb");
            
            //Find user by user'sid
            userModel.findOne({ _id: user_id }, function (err, user_return) {
                if (err)
                    return reject(err);
                
                if (user_return == null)
                    return reject({ message: 'User not exist' });
                
                // read file
                fs.readFile(photoFile.path, function (err, fileData) {
                    var photoName = user_id + "." + photoFile.extension;
                    var path = ENUM.HostName + ENUM.DIR.Photo + photoName;
                    var photoPath = __base + path;
                    // write file to project
                    fs.writeFile(photoPath, fileData, function (err) {
                        if (err)
                            return reject({ message: "Upload fail" });
                        
                        if (fs.existsSync(photoFile.path))
                            fs.unlinkSync(photoFile.path);
                        
                        user_return.profile.avatarurl = path;
                        
                        user_return.save(function (err1, user_return1) {
                            if (err1)
                                return reject({ message: "Update avatar fail" });
                            
                            videoModel.find({ "comments.user_id": user_return1.id })
                            .exec(function (err, arrVideo) {
                                //var url = err;                               
                                for (var i = 0; i < arrVideo.length; i++) {
                                    var obj = arrVideo[i];
                                    Underscore.map(obj.comments, function (comment) {
                                        if (comment.user_id === user_return1.id)
                                            comment.avatarurl = user_return1.profile.avatarurl;
                                    });
                                    obj.save(function (err2) {
                                        if (err2)
                                            console.log("Update video's comment fail");
                                    });
                                }
                                                             
                            });
                            return resolve({ path: path });
                        });

                    });
                });
                
            });
                
        } catch (ex) {
            return reject(err);
        }
    });
        
},

//typecode :0:all , 1:public , 2:private , 3:follow
UserService.MyVideo = function (user_id, typecode) {
    
    return new Promise(function (resolve, reject) {
        try {
            
            // find user by id
            userModel.findOne({ _id: user_id })
            .exec(function (err, user_return) {
                if (err)
                    return reject(err);
                
                if (user_return == null)
                    return reject({ message : "User does not exist" });
                // get user's video uploaded
                var GetMyVideo = new Promise(function (resolve1, reject1) {
                    videoModel.find({ user_id: user_id }, function (err, data) {
                        if (err)
                            reject1();
                        resolve1(data);
                    });
                });
                // get user's video followed
                var GetMyFollowVideo = new Promise(function (resolve1, reject1) {
                    videoModel.find({ follows: user_id }, function (err, data) {
                        if (err)
                            reject1();
                        resolve1(data);
                    });
                });
                // Result
                Promise.all([GetMyVideo, GetMyFollowVideo]).then(function (result) {
                    var retVal = {};
                    var mv = result[0];
                    var mf = result[1];
                    // Get by type
                    switch (typecode) {
                        case "0":
                            //public
                            retVal.public = Underscore.filter(mv, function (video) {
                                return video.pub == true;
                            });
                            //private
                            retVal.private = Underscore.filter(mv, function (video) {
                                return video.pub == false;
                            });
                            //follow
                            retVal.follow = mf;
                            break;
                        case "1":
                            //public
                            retVal.public = Underscore.filter(mv, function (video) {
                                return video.pub == true;
                            });
                            break;
                        case "2":
                            //private
                            retVal.private = Underscore.filter(mv, function (video) {
                                return video.pub == false;
                            });
                            break;
                        case "3":
                            // follow
                            retVal.follow = mf;
                            break;
                    }
                    return resolve(retVal);
                }, function (err) {
                    return reject({ message: "Error occured while process" });
                });

            });

        } catch (ex) {
            reject(ex);
        }
    
    });
                    
},

UserService.Comment = function (user_id, data) {
    return new Promise(function (resolve, reject) {
        try {
            if (cf.isNullOrUndefine(data.video_id))
                return reject({ message : "Video not exist" });
            //Find user by user's id
            
            videoModel
                .findOne({ "_id": data.video_id })
                .exec(function (err, video_return) {
                if (err)
                    return reject({ message : "Video does not exist" });
                
                if (video_return == null)
                    return reject({ message : "Video does not exist" });
                
                userModel
                .findOne({ "_id": user_id })
                .exec(function (err1, user_return) {
                    if (err1)
                        return reject({ message : "User invalid" });
                    
                    if (user_return == null)
                        return reject({ message : "User invalid" });
                    
                    var valid = cf.validation(ValidationSchema.Comment, data);
                    if (valid != true)
                        return reject(valid);
                    
                    data.user_id = user_return.id;
                    data.name = user_return.profile.name;
                    data.avatarurl = user_return.profile.avatarurl;
                    
                    video_return.comments.push(data);
                    
                    video_return.save(function (err, ret) {
                        if (err)
                            return reject(err);
                        return resolve({});
                    });

                });

            });
        } catch (ex) {
            return reject(ex);
        }
    });
},

UserService.DeleteComment = function (comment_id) {
    return new Promise(function (resolve, reject) {
        try {
            //Find user by video_id
            comment_id = comment_id || "";
            videoModel.findOne({ "comments._id": comment_id })
                .exec(function (err, video_return) {
                if (err)
                    return reject(err);
                
                if (video_return == null)
                    return reject({ message : "Comment does not exist" });
                
                //Find comment index in comment list
                
                var indexComment = -1;
                Underscore.find(video_return.comments, function (obj, index, arr) {
                    if (obj.id == comment_id)
                        indexComment = index;
                    return obj.id == comment_id;
                });
                // Remove comment                  
                video_return.comments.splice(indexComment, 1);
                // Save                  
                video_return.save(function (err, ret) {
                    if (err)
                        return reject(err);
                    
                    return resolve({});
                });
                 
            });
        } catch (ex) {
            return reject(ex);
        }

    });
},

UserService.UpdateComment = function (user_id_request, comment_id, data) {
    
    return new Promise(function (resolve, reject) {
        try {
            //Find user by video_id
            data = data || {};
            var commentInfo = Underscore.extend(DTO.updateComment(), data);
            
            videoModel
                .findOne({ "comments._id": comment_id })
                .exec(function (err, video_return) {
                if (err)
                    return reject(err);
                
                if (video_return == null)
                    return reject({ message : "Comment does not exist" });
                
                //if (user_id_request != video_return.user_id)
                //    return reject({ message : "This comment not yours" });
                
                //Find comment index in comment list               
                var indexComment = -1;
                Underscore.find(video_return.comments, function (obj, index, arr) {
                    if (obj.id == comment_id)
                        indexComment = index;
                    return obj.id == comment_id;
                });
                
                // edit comment content               
                video_return.comments[indexComment].content = commentInfo.content;
                
                // Save                      
                video_return.save(function (err, ret) {
                    if (err)
                        return reject(err);
                    
                    return resolve({});
                });
                 
            });
        } catch (ex) {
            return reject(ex);
        }

    });

},

UserService.MyRank = function (user_id_request) {
    
    return new Promise(function (resolve, reject) {
        try {
            
            var MyPubVideo = new Promise(function (resolve1, reject1) {
                videoModel
                .find({ "pub": true , "user_id": user_id_request })
                .sort({
                    totalvote : "desc"
                })
                .exec(function (err, video_return) {
                    if (err)
                        reject1({ message : "Video does not exist" });
                    
                    if (video_return === null)
                        reject1({ message : "Video does not exist" });
                    
                    resolve1(video_return);
                });
            });
            
            var AllVideo = new Promise(function (resolve1, reject1) {
                videoModel
                .find({ "pub": true })
                .sort({
                    totalvote : "desc"
                })
                .exec(function (err, video_return) {
                    if (err)
                        reject1({ message : "Video does not exist" });
                    
                    if (video_return === null)
                        reject1({ message : "Video does not exist" });
                    
                    resolve1(video_return);
                });
            });
            
            Promise.all([MyPubVideo, AllVideo]).then(function (result) {
                result[0].forEach(function (video) {
                    video._doc.rank = Underscore.findIndex(result[1], { id: video.id }) + 1;
                });
                return resolve(result[0]);
            }, function (err) {
                return reject({ message : "Video does not exist" });
            })


        } catch (ex) {
            return reject(ex);
        }

    });

},


module.exports = UserService;
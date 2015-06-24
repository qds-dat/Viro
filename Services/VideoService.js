var schema = require('../DataObject/Schema.js');
var userModel = schema.User;
var videoModel = schema.Video;

var cf = require('../CommonFunction.js');
var Promise = require('promise');
var Underscore = require('underscore');
var DTO = require('../DTO.js');

var VideoService = {};

VideoService.GetById = function (user_id_request, video_id) {
    try {
        return new Promise(function (resolve, reject) {
            // Get user upload's info and video's info
            videoModel
                     .findOne({ "_id": video_id })
                     .populate("user_id", "profile")
                     .exec(function (err, video_return) {
                if (err)
                    return reject({ message : "Video does not exist" });
                
                if (video_return === null)
                    return reject({ message : "Video does not exist" });
                
                var retVal = {
                    user: {
                        id: video_return.user_id.id,
                        name: video_return.user_id.profile.name,
                        avatarurl : video_return.user_id.profile.avatarurl
                    },
                    video: {
                        id: video_return.id,
                        url: video_return.url,
                        thumbnail : video_return.thumbnail,
                        view: video_return.view || 0,
                        followed : video_return.follows.indexOf(user_id_request) > -1,
                        totalfollow : video_return.totalfollow || 0,                          
                        voted: video_return.votes.indexOf(user_id_request) > -1,
                        totalvote: video_return.totalvote || 0,
                        dangerous: video_return.dangerous.indexOf(user_id_request) > -1,
                        comment : video_return.comments
                    }
                }
                
                return resolve(retVal);
            });

                      
        });
            
    } catch (ex) {
        return reject(ex);
    }

},

VideoService.VoteVideo = function (user_id_request, video_id) {
    
    return new Promise(function (resolve, reject) {
        try {
            //Find video by video_id
            video_id = video_id || "";
            videoModel
                .findOne({ "_id": video_id })
                .exec(function (err, video_return) {
                if (err)
                    return reject({ message : "Video does not exist" });
                
                if (video_return === null)
                    return reject({ message : "Video does not exist" });
                
                // Update vote and total vote . If user's id in vote list : remove  , else : push user's id                
                var voted = false;
                var indexUser = video_return.votes.indexOf(user_id_request);
                if (indexUser > -1) {
                    video_return.votes.splice(indexUser, 1);
                } else {
                    video_return.votes.push(user_id_request);
                    voted = true;
                }
                video_return.totalvote = video_return.votes.length;
                
                // Save               
                video_return.save(function (err, result) {
                    if (err)
                        return reject(err);
                    
                    return resolve({ voted : voted , totalvote : result.totalvote });
                });
                 
            });
        } catch (ex) {
            return reject(ex);
        }

    });
},

VideoService.Dangerous = function (user_id_request, video_id) { 

    return new Promise(function (resolve, reject) {
        try {
            //Find video by video_id
            video_id = video_id || "";
            videoModel
                .findOne({ "_id": video_id })
                .exec(function (err, video_return) {
                if (err)
                    return reject({ message : "Video does not exist" });
                
                if (video_return === null)
                    return reject({ message : "Video does not exist" });
                
                // Update dangerous and total dangerous . If user's id in dangerous list : remove  , else : push user's id                
                var dangerous = false;
                var indexUser = video_return.dangerous.indexOf(user_id_request);
                if (indexUser > -1) {
                    video_return.dangerous.splice(indexUser, 1);
                } else {
                    video_return.dangerous.push(user_id_request);
                    dangerous = true;
                }
                video_return.totaldangerous = video_return.dangerous.length;
                
                // Save               
                video_return.save(function (err, result) {
                    if (err)
                        return reject(err);
                    
                    return resolve({ dangerous : dangerous , totaldangerous : result.totaldangerous });
                });
                 
            });
        } catch (ex) {
            return reject(ex);
        }

    });

},

VideoService.CountView = function (video_id) {
    return new Promise(function (resolve, reject) {
        try {
            //Find user has video with video id
            video_id = video_id || "";
            videoModel
                .findOne({ "_id": video_id })
                .exec(function (err, video_return) {
                if (err)
                    return reject({ message : "Video does not exist" });
                
                if (result === null)
                    return reject({ message : "Video does not exist" });
                // Count View
                video_return.view++;
                // Save
                video_return.save(function (err, result) {
                    if (err)
                        return reject(err);
                    
                    return resolve({ view: result.view });
                });
                   
            });

        } catch (ex) {
            return reject(ex);
        }
    });
},

VideoService.Follow = function (user_id_request , video_id) {
    return new Promise(function (resolve, reject) {
        try {
            //Find user by video_id
            video_id = video_id || "";
            videoModel
                .findOne({ "_id": video_id })
                .exec(function (err, video_return) {
                if (err)
                    return reject({ message : "Video does not exist" });
                
                if (video_return === null)
                    return reject({ message : "Video does not exist" });
                
                // Find user index in user's follows list . If index > -1 : remove , else : push user id
                
                var followed = false;
                var indexUser = video_return.follows.indexOf(user_id_request);
                if (indexUser > -1) {
                    video_return.follows.splice(indexUser, 1);
                } else {
                    video_return.follows.push(user_id_request);
                    followed = true;
                }
                
                video_return.totalfollow = video_return.follows.length;
                
                // Save
                
                video_return.save(function (err, result) {
                    if (err)
                        return reject(err);
                    
                    return resolve({ followed : followed, follow : result.totalfollow });
                });
                 
            });
        } catch (ex) {
            return reject(ex);
        }

    });
},

VideoService.Search = function (dataSearch, videoAmount) {
    return new Promise(function (resolve, reject) {
        try {
            dataSearch = dataSearch || {};
            // config video kind
            if (!cf.isNullOrUndefine(dataSearch.kind))
                if (cf.isNullOrUndefine(ENUM.VIDEO_SEARCH[dataSearch.kind.trim().toLowerCase()]))
                    delete dataSearch.kind;
                else
                    dataSearch.kind = dataSearch.kind.trim().toLowerCase();
            
            videoAmount = cf.parseIntWithDefault(videoAmount, 1);
            
            var search = cf.updateObjectData(dataSearch, DTO.searchVideo());
            
            var searchTitle = new RegExp(search.title, "i");
            search.kind = ENUM.VIDEO_SEARCH[search.kind];
            //var skip = (pageNumber - 1) * ENUM.VIDEO_PER_PAGE;
            
            if (search.kind !== ENUM.VIDEO_SEARCH.mostpopular) {
                videoModel
                .find({ "title": searchTitle, "pub": true, "kind": { $in : search.kind } })
               // .limit(ENUM.VIDEO_PER_PAGE)
               // .skip(skip)
                .exec(function (err, video_return) {
                    if (err)
                        return reject({ message : "Video does not exist" });
                    
                    if (video_return === null)
                        return reject({ message : "Video does not exist" });
                    
                    var retVal = {
                        //page : pageNumber,
                        //video: video_return
                        videoAmount : videoAmount,
                        video: Underscore.sample(video_return, videoAmount)
                    }
                    
                    return resolve(retVal);
                });

            } else {
                videoModel
                .find({ "title": searchTitle, "pub": true })
                //.limit(ENUM.VIDEO_PER_PAGE)
                //.skip(skip)
                .sort({
                    totalvote : "desc"
                })
                .exec(function (err, video_return) {
                    if (err)
                        return reject({ message : "Video does not exist" });
                    
                    if (video_return === null)
                        return reject({ message : "Video does not exist" });
                    
                    var retVal = {
                        //page : pageNumber,
                        //video: video_return
                        videoAmount : videoAmount,
                        video: Underscore.sample(video_return, videoAmount)
                    }
                    
                    return resolve(retVal);
                });
            }
                

        } catch (ex) {
            return reject(ex);
        }
            
    });
},

VideoService.RankBoard = function (pageNumber) {
    return new Promise(function (resolve, reject) {
        try {
            pageNumber = cf.parseIntWithDefault(pageNumber, 1);
            pageNumber = pageNumber < 1 ? 1 : pageNumber;
            var skip = (pageNumber - 1) * ENUM.VIDEO_PER_PAGE;
            
            videoModel
                .find({ "pub": true })
                .limit(ENUM.VIDEO_PER_PAGE)
                .skip(skip)
                .sort({
                totalvote : "desc"
            })
            .exec(function (err, video_return) {
                if (err)
                    return reject({ message : "Video does not exist" });
                
                if (video_return === null)
                    return reject({ message : "Video does not exist" });
                
                var FristRank = skip + 1;
                Underscore.map(video_return, function (video) {
                    video._doc.rank = FristRank;
                    FristRank++;
                    return video;
                });
                
                var retVal = {
                    page : pageNumber,
                    video: video_return
                }
                
                return resolve(retVal);
            });

        } catch (ex) {
            return reject(ex);
        }
            
    });
},

module.exports = VideoService;
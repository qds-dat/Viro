var mongoose = require('./db.js');
var Schema = mongoose.Schema;
var ObjectIdSchema = Schema.ObjectId;
var ObjectId = mongoose.Types.ObjectId;

var userSchema = new Schema({
    email : {
        type: String,
        unique: true,
        trim: true,
        require: true
    },
    password : {
        type: String,
        trim: true,
        require: true,
        minlength: 5,
        maxlength: 30
    },
    salt: {
        type: String,
        trim: true,
        require: true
    }, 
    profile: {
        name : { type: String, minlength: 3, maxlength: 20 , default:'N/A' },
        avatarurl: { type: String, default: 'N/A' },
        birthday: { type: Date , default : null },
        joindate: { type: Date , default : Date.now()}
    },
    setting: {
        hideprofile : { type: Boolean, default: false }
    }
});

var videoSchema = new Schema( {
    user_id: {
        type: mongoose.Schema.Types.ObjectId ,
        ref: 'User'
    },
    title: {
        type: String,
        minlength: 3,
        maxlength: 80,
        default: ""
    },
    kind: String,
    pub: {
        type: Boolean,
        default: true
    },
    url: {
        type: String,
        require: true,
        default: ""
    },
    thumbnail: {
        type: String,
        require: true,
        default: ""
    },
    view: {
        type: Number,
        default: 0
    },
    votes: [String],
    totalvote : {
        type: Number,
        default: 0
    },
    follows: [String],      
    totalfollow: {
        type: Number,
        default: 0
    },
    dangerous: [String],
    totaldangerous: {
        type: Number,
        default: 0
    },
    comments: [{
            _id: { type: mongoose.Schema.ObjectId , default: mongoose.Types.ObjectId },
            user_id : String,
            name: String,
            avatarurl:String,
            content: { type: String, trim: true, require: true, default: "" },
            date: { type: Date, default: Date.now() }
        }],            
});

module.exports = { 
    User : mongoose.model('User', userSchema),
    Video :  mongoose.model('Video', videoSchema),
} 


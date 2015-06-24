var Underscore = require('underscore');

module.exports = {
    login : function () {
        return {
            email: "",
            password:""
        }
    },
    video: function () { 
        return {
            title: "",
            url: "",
            thumbnail: "",
            kind: ENUM.VIDEO_KIND.traditional,
            pub: true,
            view: 0,
            votes: [],
            follows: [],
            dangerous: [],
        }
    },
    user: function () {
        return {
            email: "",
            password: "",
            salt: "",
            profile: {
                name: "n/a",
                avatarurl: ENUM.DIR.Photo + "avatar_default.jpg",
                birthday: null,
                joindate : Date.now()
            },
            setting: {
                hideprofile:false
            }
        }
    },
    profile: function () {
        return {
            name: "N/A",
            avatarurl: "N/A",
            birthday: null,
        }
    },
    searchVideo: function () { 
        return {
            title: "",
            kind: "mostpopular",
        }
    },
    updateComment : function () { 
        return {
            comment_id: "",
            content: "",
        }
    }

     
};

var ValidationSchema = {};

ValidationSchema.User = {
    email: {
        Require: true,
        RegExp: ENUM.REGEXP.Email
    },
    password: {
        Require: true
    },
},

ValidationSchema.Profile = {
    name: {
        Require: true,
        Length: [3, 20]
    },
    avatarurl: {
        Require: true,
    },
    birthday: {
        Type: ENUM.DATATYPE.Datetime
    },
    joindate: {
        Type: ENUM.DATATYPE.Datetime
    }
};

ValidationSchema.Setting = {
    hideprofile : {
     //   Require : true,
        Type : ENUM.DATATYPE.Boolean
    }
};

ValidationSchema.Video = {
    title : {
        Length: [0, 80]
    },
    url: {
       // Require: true,
    },
    thumbnail: {
       // Require: true,
    },
    kind: {
        Enum : ENUM.VIDEO_KIND
    },
    pub: {
        Type: ENUM.DATATYPE.Boolean
    },
    video_id: {
       // Require: true,
    },
};

ValidationSchema.Comment = {
    content: {
        Require: true,
    },
    date: {
        Type : ENUM.DATATYPE.Datetime
    }
};

ValidationSchema.SearchVideo = {
    title: {

    },
    kind: {
        Enum : ENUM.VIDEO_KIND
    }
}

module.exports = ValidationSchema;
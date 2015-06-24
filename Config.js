var ENUM = {};

ENUM.DatabaseConnection = "mongodb://localhost/Viro";

ENUM.HostName = "http://localhost:5858";

ENUM.SECRECTKEY = "DDD";

ENUM.VIDEO_PER_PAGE = 6;

ENUM.DIR = {
    Photo: "/Resource/Photos/",
    Thumbnail : "/Resource/Thumbnails/"
}


ENUM.QINIU = {
   Config : {
        access_key : "cBQNSuuOJxk_Dg4nK14Vbe0Yz9LktQM0Y2kqiRlY",
        secret_key : "ogMkl_DrP0SpOcra1snxBj4HRMI-XQ8hLjTuLkQA"
    },
   Bucket :"viro",
   ResourcePage: "http://7xjrjm.com1.z0.glb.clouddn.com/",
}

ENUM.PUB = {
    True: true,
    False: false
};

ENUM.HIDEPROFILE = {
    True: true,
    False: false
};

ENUM.VIDEO_KIND = {       
    love: "Love",
    dance: "Dance",
    traditional:"Traditional",    
    accidents: "Accidents",
    outrageous: "Outrageous",
    pranks: "Pranks",
}

ENUM.VIDEO_SEARCH = {
    mostpopular : ["MostPopular"],
    songs : ["Love", "Dance", "Traditional"],
    comedy : ["Accidents", "Outrageous", "Pranks"],
}

ENUM.REGEXP = {
    Email : /^\w+[\w-\.]*\@\w+((-\w+)|(\w*))\.[a-z]{2,3}$/ ,
    Date_YYYYMMDD : /^((\d{2}(([02468][048])|([13579][26]))[\-\/\s]?((((0?[13578])|(1[02]))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\-\/\s]?((0?[1-9])|([1-2][0-9])))))|(\d{2}(([02468][1235679])|([13579][01345789]))[\-\/\s]?((((0?[13578])|(1[02]))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(3[01])))|(((0?[469])|(11))[\-\/\s]?((0?[1-9])|([1-2][0-9])|(30)))|(0?2[\-\/\s]?((0?[1-9])|(1[0-9])|(2[0-8]))))))(\s(((0?[1-9])|(1[0-2]))\:([0-5][0-9])((\s)|(\:([0-5][0-9])\s))([AM|PM|am|pm]{2,2})))?$/,
}

ENUM.DATATYPE = {
    Datetime: "Datetime",
    Boolean: "Boolean",
    Number : "Number",
    Array:"Array",
}

module.exports = ENUM;

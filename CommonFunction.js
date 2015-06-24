var md5 = require('MD5');
var CF = {};

CF.CreateGUID = function () {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

CF.CreateSalt = function () {
    return 'xxxx-xxx-xxxx-xxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

CF.CreateToken = function (email) {
        
    return '4xyxxxxyxxxx3xxxyxx8xxxxxyxxxxxuxxxyxxxx'.replace(/[xy]/g, function (c) {
        var r = Math.random() * 16 | 0,
            v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

CF.CreateRandomNumber = function (from, to) {
    return Math.floor(Math.random() * (to - from)) + from;
};

CF.Encrypt = function (str) {
    return md5(str);
};

CF.isNullOrUndefine = function (obj) {
    return (obj === undefined || obj === null);
};

CF.isNumber = function (obj) {
    return typeof obj === 'number';
};

CF.isString = function (obj) {
    return typeof obj === 'string';
}

CF.isDate = function (str) {
    var rex = ENUM.REGEXP.Date_YYYYMMDD
    return rex.test(str);
}

CF.parseBooleanWithDefault = function (value, defaultValue) { 
    var defaultValue = defaultValue || false;
    if (CF.isNullOrUndefine(value)) 
        value = defaultValue;
    else
        value = (value + "").trim().toLowerCase() === "true" ? true : false;

    return value;
}

CF.parseIntWithDefault = function (value, defaultValue) {
    var defaultValue = defaultValue || 0;

    if (CF.isNullOrUndefine(value))
        value = defaultValue;
    else
        value = /^[0-9]{1,8}$/.test(value) ? Number(value) : defaultValue;

    return value;
}

CF.updateObjectData = function (dataObject, des , exception) {
    if (CF.isNullOrUndefine(dataObject))
        return des;
    
    var keys = Object.getOwnPropertyNames(dataObject);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        if (Object.prototype.toString.call(exception) === '[object Array]')
            if (exception.indexOf(key) > -1)
                continue; 
                   
        if (des[key] !== undefined)  //des.hasOwnProperty(key)
            if(!CF.isNullOrUndefine(dataObject[key]))
                des[key] = dataObject[key];
        
    }
    return des;

}

//Require
//Length
//Regexp
//Type
var errReturn = function (message) {
    return { message : message };
}

CF.validation = function (schema, obj) {
    if (CF.isNullOrUndefine(obj)) { 
        return new errReturn("Data invalid");
    }
    
    var keys = Object.getOwnPropertyNames(schema);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var valid = schema[key];
        var value = obj[key];
        //Require check
        var Require = valid["Require"];
        if (!CF.isNullOrUndefine(Require)) {                       
            if (value === undefined)
                return new errReturn(key + " is missing");
        }
        // if this field not require and value is undefine , check next field
        if (CF.isNullOrUndefine(Require) && CF.isNullOrUndefine(value)) {
            continue;
        }
        //Length check
        var Length = valid["Length"];
        if (!CF.isNullOrUndefine(Length) && Array.isArray(Length)) {
            if (Length.length == 2) {
                var min = Length[0];
                var max = Length[1];
                
                if ((value + "").length < min)
                    return new errReturn(key + "'s min length is " + min);
                
                if ((value + "").length > max)
                    return new errReturn(key + "'s max length is " + max);
            }
        }
        //Regexp check
        var RE = valid["RegExp"];
        if (!CF.isNullOrUndefine(RE)) {
            if (!RE.test(value))
                return new errReturn(key + " invalid .");
        }       
        //Type check   
        var Type = valid["Type"];
        if (!CF.isNullOrUndefine(Type)) {
            switch (Type){
                case ENUM.DATATYPE.Datetime:
                    if (Object.prototype.toString.call(value) !== '[object Date]')
                        return new errReturn(key + " must be a date");
                    break;
                case ENUM.DATATYPE.Array:
                    if (Object.prototype.toString.call(value) !== '[object Array]')
                        return new errReturn(key + " must be a array");
                    break;
                case ENUM.DATATYPE.Number:
                    if (typeof value !== "number" && !isNaN("" + value + ""))
                        return new errReturn(key + " must be a number");
                    break;
                case ENUM.DATATYPE.Boolean:
                    if (typeof value !== "boolean" && !Boolean(""+value+""))
                        return new errReturn(key + " must be a boolean");
                    break;
                default:
                    break;
            }         
        }
        //Enum
        var Enum = valid["Enum"];
        if (!CF.isNullOrUndefine(Enum)) {
            if (Object.prototype.toString.call(Enum) === '[object Array]') {
                if (Enum.indexOf(value) == -1) {
                    return new errReturn(key + "'s type not match");
                }             
            } else if(Object.prototype.toString.call(Enum) === '[object Object]') {
                if (CF.isNullOrUndefine(Enum[value])) 
                    return new errReturn(key + "'s type not match");               
            }             
        }
            
               
                                   
    }
    
    return true;
};



module.exports = CF;
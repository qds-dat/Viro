var cf = require("./CommonFunction.js");

var ActionResult = function (res) {
    this.res = res;
    this.message = '';
    this.data = {};
    this.status = 200;
    this.exec = function (state) 
    {
        return this.res
                    .status(this.status)
                    .json({
                        state: this.status == 200 ? "Success" : "Fail",
                        message: this.message,
                        result:this.data
                    });
    }
}

ActionResult.prototype = {
    _success: function () {
        var self = this;

        switch (arguments.length) {
            case 0:
                self.message = "Success";
                break;
            case 1:
                self.data = arguments[0];
                break;
            case 2:
                self.message = arguments[0];
                self.data = arguments[1];
                break;
        }
        
        self.exec();
    },

    _fail: function () {
        var self = this;
        self.status = 400;
        switch (arguments.length) {
            case 0:
                self.message = "Fail";
                break;
            case 1:
                self.data = arguments[0];
                break;
            case 2:
                self.message = arguments[0];
                self.data = arguments[1];
                break;
        }

        self.exec();
    },

    _400 : function (message) {
        var self = this;
        self.message = cf.isNullOrUndefine(message) ? 'Bad request' : message;
        self.status = 403;
        self.exec();

    },

    _403 : function (message){
        var self = this;
        self.message = cf.isNullOrUndefine(message) ? 'Token access invalid' : message;
        self.status = 403;
        self.exec();
    },
}

module.exports = ActionResult;
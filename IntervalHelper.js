
var DDD = function () { };
//timeCall : milisecond
//callback : function callback after timeCall
DDD.prototype.interval = function (timeCall , callback) {
    var inter = setInterval(function () {
        callback();
        clearInterval(inter);
    }, timeCall);
}
 
module.exports = DDD;

/*
 * var IH = require('IntervalHelper');
 * var newUser = new User({
 *      name:"DDD"
 * });
 * newUser.save(function(err,retVal){
 *      if(err)
 *          return err
 *          
 *      var ih = new IH();
 *      ih.interval(10000,function(){
 *          retVal.name = "DDD là trùm"
 *          retVal.save();
 *      })
 *      
 *      return "Success";
 * 
 * })

 * 
 * 
 * 
 * */
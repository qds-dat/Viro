var jwt = require('jwt-simple');
var secret = 'quodisys';

module.exports = function (req, res, next) {

    var token = req.headers['x-access-token'];
    if (token) {
        try {
            var id = token.substring(0,token.length - 40);
            
            var trueId = jwt.decode(id, ENUM.SECRECTKEY);
            var trueToken = token.substring(token.length - 40 , token.length);

            var user = localStorage.getItem(trueId);
            if (user == null)
                res.ActionResult._403();
                                              
            userJson = JSON.parse(user);
            if (userJson.token != trueToken)
                res.ActionResult._403();
            
            req.user = {
                email : userJson.email,
                id : trueId
            }

            return next();
        } catch (err) {
            res.ActionResult._403("Token invalid");
        }
    } else {
        res.ActionResult._403();
    }

};
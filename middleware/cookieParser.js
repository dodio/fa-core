var cookieParser = require('cookie-parser');
module.exports = function(conf){
    return cookieParser("conf.secret", conf);
};
var debuglog = require('debuglog')('fa/log');

module.exports = function (conf , server) {
    var app = [];
    if (server.ENV != "prod") {
        debuglog('start debug mode for not found page'.yellow);
        app.push(function(req,res,next){
            debuglog("404 Not Found : %s",req.url);
            next();
        });
    }
    app.push(conf.handler);
    return app;
};


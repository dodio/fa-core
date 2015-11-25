var debuglog = require('debuglog')('fa/log');
var express = require("express");
module.exports = function (conf,server) {
    var app = express.Router();
    // 不是开发模式，记录错误日志
    if ( !server.IS_DEV ) {
        var logger = server.module("log");
        app.use(function(error,req,res,next){
            logger.fatal(error);
            next(error);
        });
        app.use(conf.handler);
    } else {
        debuglog('start debug mode for error page'.yellow);
        app.use(function(error,req,res,next){
            console.log(error);
            next(error);
        });
        app.use(conf.handler);
    }
    return app;
};


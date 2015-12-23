var debuglog = require('debuglog')('fa/log');
var express = require("express");
module.exports = function (conf,server) {
    var app = [];
    // 不是开发模式，记录错误日志
    if ( !server.IS_DEV ) {
        var logger = server.module("log");
        app.push(function(error,req,res,next){
            if(error instanceof Error){
                logger.fatal(error);
            }else{
                logger.notice(error);
            }
            next(error);
        });
    } else {
        debuglog('start debug mode for error page'.yellow);
        app.push(function(error,req,res,next){
            console.log(error.stack || error);
            next(error);
        });
    }
    app.push(conf.handler);
    return app;
};


'use strict';

var dispatcher = require('./dispatcher.js');
var express = require('express');

module.exports = function (server, conf) {
    conf.appPath = [server.ROOT_PATH , 'app'].join("/");
    var dispatcherIns = new dispatcher(conf);
    
    // 添加一个内置的module
    server.module.setStatic("dispatcher" , dispatcherIns);

    //自动路由
    var autoRouter = dispatcherIns.middleware(conf.rootRouter);
    var middlewareFactory = function (opt) {
        
        return autoRouter;
    };
    server.middleware.setStatic("dispatcher", middlewareFactory ) ;
};
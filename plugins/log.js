var logger = require('yog-log');
var path = require('path');

var util = rootFa.module("util");
var _ = require("lodash");
module.exports = function(server, conf){
    var app = server.app;
    var conf = _.mapValues(conf,function(v){
        return util.dynamicConfig(v,server);
    });
    server.module.setStatic("log",logger.getLogger(conf));
    server.middleware.setStatic("log",function(){
        return logger(conf);
    });

};

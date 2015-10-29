var methodOverride = require('method-override');
var express = require("express");
module.exports = function(conf,server){
    var app = express.Router();

    if (conf instanceof Array){
        for (var i = 0; i < conf.length; i++) {
            app.use(methodOverride(conf[i]));
        }
    }else if (conf){
        app.use(methodOverride(conf));
    }
    return app;
};


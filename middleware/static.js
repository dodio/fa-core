
var express = require("express");
module.exports = function(options,server){

    var app = express.Router();
    var staticPath = (typeof options.staticPath === "function") ? options.staticPath(server) : options.staticPath;
    
    app.use(options.urlPattern, require('express').static( staticPath , options.options));
    //拦截404
    var notFound;
    if(typeof options.notFound === "function"){
        notFound = options.notFound;
    }else{
        notFound = function(req,res){
            res.sendStatus(404);
        }
    }
    app.use(options.urlPattern, notFound);
    return app;
};

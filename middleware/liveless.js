var less = require("less");
var express = require("express");
var p = require("path");

var fs = require("fs");

function liveless (options,server){
	var router = express.Router();
	var root = options.root = server.module("util").dynamicConfig( options.root, server );
	router.get("**.less",function(req,res,next){
		var path = req.path;
		var file = [root,path].join("/");
		fs.existsAsync(file)
		.then(function(){
			return fs.readFileAsync(file);
		})
		.then(function(input){
			var opt = {
				path:[root]
			};
			return less.render( input.toString() ,opt);
		})
		.then(function(output){
			res.type("css");
			res.send(output.css);
		})
		.catch(next);


	})
	
	return router;
}


module.exports = liveless;


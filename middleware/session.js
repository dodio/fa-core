var session = require("express-session");
var redis = require('connect-redis');
var file = require("session-file-store");
module.exports = function(conf,server) {
	if(conf.redis){
		var redisStore = redis(session);
		console.log("使用redis缓存session: http://%s:%s",conf.redis.host,conf.redis.port);
		conf.store = new redisStore(conf.redis);
	}else{
		var path = server.ROOT_PATH + "/session";
		console.log("使用文件保存session ,路径:%s",path);
		var fileStore =  file(session);
		conf.store = new fileStore({
			path:path
		});
	}
	return [ session(conf),checkSession ];
}

function checkSession(req,res,next){
	if(!req.session){
		next(new Error("GateWay Error"));
		return;
	}
	next();
}
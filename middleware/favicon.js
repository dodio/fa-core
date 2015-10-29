module.exports = function(conf,server){

	var path = (typeof conf.path == "function") ?  conf.path(server) : conf.path;

    if (require('fs').existsSync(path)){
    	return require('serve-favicon')(path);
    }else{
    	return function(req,res,next){
    		next();
    	}
    }
};


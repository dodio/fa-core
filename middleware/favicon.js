module.exports = function(conf,server){

	var path =  conf.path = server.module("util").dynamicConfig( conf.path, server );

    if (require('fs').existsSync(path)){
    	return require('serve-favicon')(path);
    }else{
    	return function(req,res,next){
    		next();
    	}
    }
};


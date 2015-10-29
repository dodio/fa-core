var Promise = require("bluebird");
global.Promise = Promise;
var fs = require("fs");
Promise.promisifyAll(fs);
setTimeout(function() {
	fs.existsAsync = function(path){
		return new Promise(function(resolve,reject){
			fs.exists(path,function(exists){
				exists ? resolve(true) : reject(false);
			})
		});
	}
});

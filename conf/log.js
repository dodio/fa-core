var path = require("path");
module.exports = {
    'app': function(server) {
    	return server.serverName;
    },
    'data_path': function(server){
    	return path.join(server.ROOT_PATH, 'tmp');
    },
    'log_path': function(server){
    	return path.join(server.ROOT_PATH, 'log')
    },
    'use_sub_dir': 1
};
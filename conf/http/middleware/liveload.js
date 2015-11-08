module.exports.liveload = {
	root : function(server) {
		return [server.ROOT_PATH,"/views"].join("/");
	},
	files : /.(js|css|html|less|tpl)$/,
	excludes: /^node_modules$/,
  port : function(server) {
    return parseInt( Math.random() * 1e4 + 2e4 ) ;
  }
}
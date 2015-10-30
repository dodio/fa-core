module.exports.liveload = {
	root : function(server) {
		return [server.ROOT_PATH,"/views"].join("/");
	},
	files : /.(js|css|html|less|tpl)$/,
	excludes: /^node_modules$/
}
var liveload = require("liveload");
var _ = require("lodash");
module.exports = function(conf,server) {
	conf.root = server.module("util").dynamicConfig(conf.root,server);
  conf.port = conf.port(server);
	return liveload(conf);
}
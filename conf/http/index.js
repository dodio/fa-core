var _ = require("lodash");
var fs = require("fs");


var middleware = [
    'favicon',
	"compression",
	"responseTime",
	"bodyParser",
	"cookieParser",
	"session",
	'data'
]
// 非开发模式开启日志
rootFa.IS_DEV && middleware.push('log');
// 开发模式下liveload支持
rootFa.IS_DEV && middleware.push('liveload');
// 开发模式开启liveless
rootFa.IS_DEV && middleware.push("liveless");
// 产品模式不开启静态资源模块
!rootFa.IS_PROD && middleware.push("static");

middleware = middleware.concat([
	// "ral",
	"views",
	"methodOverride",
	"dispatcher"
	]);

middleware.push('notFound');
middleware.push('error');


var mwConfDir = [__dirname,"middleware"].join("/");

var files = fs.readdirSync( mwConfDir );
var confs = {};
_.each(files,function(file) {
  _.extend(confs,require( [mwConfDir,file].join("/") ));
})
// 将中间件的配置放在 http 的配置上
_.extend( module.exports , confs);
module.exports.middleware = middleware;

var _ = require("lodash");
var fs = require("fs");

var DEV = rootFa.ENV == "dev" ;
var PROD = rootFa.ENV == "prod" ;

var middleware = [
    'favicon',
	"compression",
	"bodyParser",
	"responseTime",
	"cookieParser"
]
// 非开发模式开启日志
!DEV && middleware.push('log');
// 开发模式下liveload支持
DEV && middleware.push('liveload');

middleware = middleware.concat([
	// "ral",
	"views",
	"methodOverride",
	"dispatcher"
	]);
// 开发模式开启liveless
DEV && middleware.push("liveless");

// 产品模式不开启静态资源模块
!PROD && middleware.push("static");

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

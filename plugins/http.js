var _ = require('lodash');
var debuglog = require('debuglog')('fa/middleware');
var MIDDLEWARE_DEBUG = rootFa.MIDDLEWARE_DEBUG || rootFa.DEBUG ;

function core(server, conf){
    var app = server.app;
    var startTime = function(name){
        return function(req, res, next){
            req.__MIDDLEWARE_START__ = +(new Date());
            req.__CURRENT_MIDDLEWARE__ = name;
            next();
        };
    };

    var endTime = function(name){
        return function(req, res, next){
            debuglog(
                'middleware [%s] cost %d ms',
                name,
                new Date() - req.__MIDDLEWARE_START__
            );
            next();
        };
    };

    if (MIDDLEWARE_DEBUG){
        app.use(function(req, res, next){
            res.on('finish', function(){
                debuglog(
                    'middleware [%s] cost %d ms', 
                    req.__CURRENT_MIDDLEWARE__, 
                    new Date() - req.__MIDDLEWARE_START__
                );
            });
            next();
        });
    } 
    for (var i = 0; i < conf.middleware.length; i++) {
        var middlewareName = conf.middleware[i];
        var middlewareConf;
        var middlewareFactory ;
        
        // 如果是直接配置的中间件，则为直接的 middleware factory 配置为空
        if (typeof middlewareName === 'function'){
            middlewareFactory = middlewareName;
            middlewareConf = {};
        }else{
            middlewareFactory = server.middleware( middlewareName );
            middlewareConf = conf[middlewareName];
        }

        if (!middlewareFactory){
            throw new Error('middleware ' + middlewareName + ' not found');
        }
        var start = +(new Date());
        if (MIDDLEWARE_DEBUG){
            app.use(startTime(middlewareName));
        }
        // 给工厂方法传入 配置和 server
        app.use( middlewareFactory( middlewareConf , server )   );

        if (MIDDLEWARE_DEBUG){
            app.use(endTime(middlewareName));
        }
        debuglog('middleware [%s] loaded in %d ms', middlewareName, new Date() - start);
    }   
}


// http中间件加载  是一个动态依赖的过程，因有些中间件是插件提供的.需要等插件加载完毕后才能加载。
// 但又不能确定用户是否一定会加载 插件的中间件，于是先动态根据应用配置，获取依赖
module.exports.dynamicDependency = function(server){
    var conf = server.config("http");
    var middleware = conf.middleware;
    var dependency = [];

// 约定http 中间件的配置是二维数组，一维决定顺序，每一个元素是单个中间件配置：
// 单个中间件配置也是数组：
// 0 位为中间件名字
// 1 位为具体给中间件的配置
    middleware.forEach(function(ware){
        // 直接在配置里的中间件函数，就直接忽略咯
        if(_.isFunction(ware)){
            return;
        }
        // 如果中间件名字，在插件中存在，则添加插件依赖，并会优先使用插件提供的中间件
        if( server.plugin(ware) ){
            dependency.push(ware);
        }
    });

    dependency.push(core);
    return dependency;
}



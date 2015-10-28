var mapjson = require('./mapjson.js');
var yogView = require('yog-view');
var yogBigPipe = require('yog-bigpipe');
var _ = require('lodash');

module.exports =  function (server, conf) {

    var app = server.app;

    conf.viewsDir =  (typeof conf.viewsDir === "function") ? conf.viewsDir(server) : conf.viewsDir;
    conf.confDir =  (typeof conf.confDir === "function") ? conf.confDir(server) : conf.confDir;
    
    var middleware = [];
    var viewEngines = [];

    app.set('views', conf.viewsDir);

    app.set('view engine' , conf.defaultEngine || "tpl");

    if (conf.viewCache) {
        app.enable('view cache');
    }

    //初始化map.json API
    app.fis = new mapjson.ResourceApi(conf.confDir);

    middleware.push(function (req, res, next) {
        res.fis = app.fis;
        next();
    });

    //初始化bigpipe
    if (conf.bigpipe) {
        middleware.push(yogBigPipe(conf.bigpipeOpt));
    }
    _.forIn(conf.engine, function (engine, name) {
        //设置view engine
        var viewEngine = new yogView(app, engine, conf[name] || {});
        viewEngines.push(viewEngine);
        app.engine(name, viewEngine.renderFile.bind(viewEngine));
    });

    server.module.setStatic("view",{
        cleanCache: function () {
            // 清除FIS resourcemap缓存
            app.fis = new mapjson.ResourceApi(conf.confDir);
            _.forEach(viewEngines, function (viewEngine) {
                viewEngine.cleanCache();
            });
        }
    });

    server.middleware.setStatic('views',function () {
        return middleware;
    });
};


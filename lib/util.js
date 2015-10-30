var _ = require('lodash');

module.exports.wrapExclude = function (exclude, middleware) {
    if (!exclude) {
        return middleware;
    }
    return function (req, res, next) {
        var hit = false;
        if (!_.isArray(exclude)) {
            exclude = [exclude];
        }
        _.forEach(exclude, function (reg) {
            var match = req.path.match(reg);
            if (match && match[0] === req.path) {
                hit = true;
                return false;
            }
        });
        if (hit) {
            next();
        }
        else {
            middleware(req, res, next);
        }
    };
};

// 动态加载配置
module.exports.dynamicConfig = function(conf,server){
    if(!conf || !server){
        return;
    }
    if(typeof conf == "function"){
        if(conf.self){
            return conf;
        }else{
            return conf(server);
        }
    }else{
        return conf;
    }
}

module.exports.dynamicConfig.each = function(obj,server){
    _.forIn(obj,function(v,k){
        module.exports.dynamicConfig(v,server)
    });
}
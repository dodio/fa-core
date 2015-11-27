var fs = require('fs');
var path = require('path');
var _ = require("lodash");

var emptyMap = {
    res:{},
    pkg:{}
}

var expHttp = /^(\/\/)|(http:\/\/)|(https:\/\/)/;

function ResourceApi(config_dir,server) {
    this.config_dir = config_dir;
    this.server = server;
    var map = server.realConfig("mapJson.build") || emptyMap;

    // fis3的打包合并生成的文件uri，没有domain信息
    // _.forIn(map.pkg,function(pkg,p){
    //     pkg.uri = server.options.staticDomain + pkg.uri;
    // });
    this.maps = map;
}

/**
 * Conver source map id to source url.
 * @see /config/ns-map.json file.
 * @param  {[type]} id [description]
 * @return {[type]}    [description]
 */


ResourceApi.prototype.resolve = function(id,from) {
    var info = this.getInfo(id);
    return info ? info.uri : "";
};

ResourceApi.prototype.getInfo = function(id, ignorePkg) {
    if (!id) {
        return null;
    }
    //非开发环境 如果是以 /js /home  开头的资源，强行去掉 / ，因为resourceMap 生成的文件前面不带/
    if(!rootFa.IS_DEV && /^\/\w+/.test(id) ){
        id = id.substring(1);
    }
    // 如果是开发环境，则直接返回id对应的文件信息
    // 用于支持直接用http方式的引用,且为js或css,less,tpl
    if( ( expHttp.test(id) && /\.(js|less|css|tpl)$/.test( id.replace(/\?.*$/,"") ) ) || rootFa.IS_DEV ){
        var ext = path.extname(id).replace(".","");
        //开发时直接引用less，访问时自动编译后返回内容
        if(ext == 'less'){
            ext = "css";
        }
        return {
            uri:id,
            type:ext
        }
    }
    var info = this.maps['res'][id];
    if (!ignorePkg && info && info['pkg']) {
        info = this.maps['pkg'][info['pkg']];
    }
    return info;
};

ResourceApi.prototype.getPkgInfo = function(id) {
    if (!id ) {
        return null;
    }
    var info;
    info = this.maps['pkg'][id];
    return info;
};



ResourceApi.prototype.destroy = function (id) {
    this.maps = null;
};


module.exports = function (options) {
    options = options || {};

    var config_dir = options['config_dir'];
    var cache = options.cache;
    var singlon = new ResourceApi(config_dir);

    return function (req, res, next) {
        var destroy;

        res.fis = cache ? singlon : new ResourceApi(config_dir);

        destroy = function() {
            res.removeListener('finish', destroy);
            //res.removeListener('close', destroy);

            cache && res.fis.destroy();
            res.fis = null;
        };

        res.on('finish', destroy);
        //res.on('close', destroy);

        next();
    };
};

module.exports.ResourceApi = ResourceApi;
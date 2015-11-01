'use strict';
var debuglog = require("debuglog")("fa/require");
var p = require("path");
var _ = require("lodash");
var no_dot = /\.\./g;
var errorMsg = "不能使用'.'进行路径跳转";
function buildSearchPath(searchPath){
    if(_.isString(searchPath)){
        searchPath = [searchPath];
    }
    searchPath = _.isArray(searchPath) ? searchPath : [searchPath];

    // 只留string 路径
    searchPath = _.filter(searchPath,function(i) {
        return _.isString(i);
    });

    // 解析为绝对路径
    searchPath = _.map(searchPath,function(i){
        return p.resolve(i);
    })
    // 去重
    return _.unique(searchPath);
}

// 配置文件加载器，以路径逐级将配置文件加载进来
function requireConfig(searchPath){
    searchPath = buildSearchPath(searchPath);
    var cache = {};

    var requireFunc = function (name) {
        if(no_dot.test(name)){
            throw new Error(errorMsg);
        }
        var module = {};

        if (cache[name]) {
            return cache[name];
        }
        _.each(searchPath,function(rootPath){
            var path = [rootPath,name].join("/");
            try{
                require.resolve(path)
            }catch(e){
                debuglog("[%s] 目录中不存在[%s]的配置文件.",rootPath,name);
                return;
            }
            var tmp = require(path);
            // console.log(tmp);
            if(_.isPlainObject(tmp)){
                // 最先获取的最先保留
                // console.log(path);
                module = _.defaultsDeep(module,tmp);
            }
        });

        if(_.isEmpty(module)){
            debuglog("[%s] 配置信息不存在.",name);
        }

        cache[name] = module;
        return module;
    };

    requireFunc.cleanCache = function () {
        cache = {};
    };
    requireFunc.searchPath = function(){
        return searchPath;
    }
    
    // 扩展当前获取配置的搜索路径
    requireFunc.extend = function(subSearchPath) {
        subSearchPath = buildSearchPath(subSearchPath);
        var newPath = [].concat(subSearchPath,searchPath);
        var newRequire = requireConfig(newPath);
        return newRequire;
    }

    return requireFunc;
}


// 以生成模块加载器：按路径搜索，最近的模块返回
function requireModule(searchPath){
    searchPath = buildSearchPath(searchPath);

    var cache = {};
    // 静态模块
    var staticModule = {};

    var requireFunc = function (name) {
        if(no_dot.test(name)){
            throw new Error(errorMsg);
        }
        if(staticModule[name]){
            return staticModule[name];
        }
        if (cache[name]) {
            return cache[name];
        }
        var module;

        for(var i = 0 ; i < searchPath.length ; i++){
            var path = [ searchPath[i] ,name].join("/");
            try{
                require.resolve(path);
            }catch(e){
                continue;
            }
            module = require(path);
        }

        if(module){
            cache[name] = module;
            return module;
        }
        debuglog("[%s] 模块不存在.",name);
        debuglog("搜索路径为：\n%s",searchPath.join("\n"));
        return null;
    };

    requireFunc.cleanCache = function () {
        cache = {};
    };
    requireFunc.searchPath = function(){
        return searchPath;
    }
    requireFunc.setStatic = function(name,module) {
        if(_.isString(name)){
            staticModule[name] = module;
        }else if(_.isPlainObject(name) ) {
            _.extend(staticModule,name);
        }
    }
    /**
     * 从当前的搜索路径继承，生成一个新的加载器, 
     * onlyPath  true  仅仅扩展路径，即不包含静态模块
    **/
    requireFunc.extend = function(subSearchPath,onlyPath) {
        subSearchPath = buildSearchPath(subSearchPath);
        var newPath = [].concat(subSearchPath,searchPath);
        var newRequire = requireModule(newPath);
        // 不只是扩展路径
        if( onlyPath !== true){
            newRequire.setStatic(staticModule);
        }
        return newRequire;
    }
    return requireFunc;
}


module.exports.module = requireModule;
module.exports.config = requireConfig;
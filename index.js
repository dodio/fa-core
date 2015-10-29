var express = require("express");
var createRequire = require("./lib/require");
var path = require("path");
var _ = require("lodash");
var FaServer = require("./server");
require("./promise");

function Fa(){}

var servers = {};
// 根据当前配置情况生成一个 基于connect 的应用
Fa.prototype.createServer = function(options) {

    options = options || {};
    var rootPath = options.rootPath;

    if(!_.isString(options.serverName)){
        throw new Error("缺少应用名字参数:serverName");
    }

    if(servers[options.serverName]){
        throw new Error("已经有同名的应用");
    }

    if(!_.isString(rootPath)){
        throw new Error("缺少应用根路径参数:rootPath");
    }

    var pluginList = options.pluginList;
    if(!_.isArray(pluginList)){
        throw new Error("缺少插件列表参数:pluginList");
    }

    var fa = this.extend({
        pluginPath : [rootPath,"plugins"].join("/"),
        modulePath : [rootPath,"lib"].join("/"),
        configPath : [rootPath,"conf"].join("/"),
        middlewarePath : [rootPath,"middleware"].join("/")
    });

    return servers[options.serverName] = new FaServer(options,fa);
};

Fa.prototype.servers = function(){
    return servers;
}


Fa.prototype.extend = function(options) {

    if( !_.isPlainObject(options) ){
        return this;
    }

    var faObj = _.extend({},this);

    faObj  = _.mapValues(faObj,function(value,key) {
        if( _.isFunction(value) && _.isFunction(value.extend) ){

            var optKey = key+"Path";
            if(  options[ optKey ]  ){
                return value.extend( options[ optKey ] )
            }else{
                return value;
            }
        }else{
            return value;
        }
    });

    var fa = _.extend(new Fa(),faObj);

    return fa;
};


module.exports.init = function(options) {
    var fa = new Fa();

    fa.ENV = process.env.FA_ENV || "prod"; //默认生产环境

    fa.DEBUG = process.env.FA_DEBUG === 'true' || fa.ENV === "dev";  //调试模式，输出调试信息或者记录日志等
    fa.MERGED = fa.ENV !== "dev"; // 不是开发环境，默认静态资源是合并状态
    fa.MERGED = !(process.env.FA_NOT_MERGED === "true"); // 在不是生产环境， 又不是dev 环境时，可以通过 FA_NOT_MERGED=true 设置资源非合并状态

    if(fa.ENV === "prod"){
        fa.DEBUG = false;
        fa.MERGED = true; //生产环境 资源必须是合并状态，且不为debug模式
    }

    var module = fa.module = createRequire.module( [__dirname ,"lib"].join("/") ); //lib 或者组件，或者工具类加载器
    fa.plugin = createRequire.module( [ __dirname ,"plugins"].join("/" )  ); //plugins 插件类加载器
    fa.config = createRequire.config( [ __dirname ,"conf"].join("/")  ) //配置加载
    fa.middleware = createRequire.module( [__dirname ,"middleware"].join("/")); //中间件加载

    var rootFa = global.rootFa = fa.extend(options); //根FA

    return rootFa;
};

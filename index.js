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

    if(global[options.serverName] != undefined){
        throw new Error("全局变量:" + options.serverName + "已经被占用!");
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

    return global[options.serverName] = servers[options.serverName] = new FaServer(options,fa);

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
        // require 的特征是函数 且 函数上含有 extend 函数;
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
    //约定三种状态： 
    //dev , 开发环境
    //test , 测试环境
    //prod，生产环境（含UAT）
    fa.ENV = process.env.FA_ENV || "prod"; //默认生产环境
    fa.IS_PROD = fa.ENV === "prod"; //生产环境
    fa.IS_TEST = fa.ENV === "test"; //测试环境
    fa.IS_DEV = fa.ENV === "dev"  ; // 开发环境
    fa.DEBUG = process.env.FA_DEBUG === 'true' || fa.ENV === "dev";  //调试模式，输出调试信息或者记录日志等

    fa.IS_PROD && console.log("运行在【产品】模式下");
    fa.IS_TEST && console.log("运行在【测试】模式下");
    fa.IS_DEV && console.log("运行在【开发】模式下");
    if(fa.ENV === "prod"){
        fa.DEBUG = false; //生产环境 必须为debug模式
    }

    var module = fa.module = createRequire.module( [__dirname ,"lib"].join("/") ); //lib 或者组件，或者工具类加载器
    fa.plugin = createRequire.module( [ __dirname ,"plugins"].join("/" )  ); //plugins 插件类加载器
    fa.config = createRequire.config( [ __dirname ,"conf"].join("/")  ) //配置加载
    fa.middleware = createRequire.module( [__dirname ,"middleware"].join("/")); //中间件加载

    var rootFa = global.rootFa = fa.extend(options); //根FA

    return rootFa;
};

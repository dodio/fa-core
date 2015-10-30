var _ = require("lodash");
var express = require("express");
var async = require("async");
require("colors")

var util = require("util");

var debuglog = require("debuglog")("fa/createServer");

function FaServer(options,fa){
    //设置yog根目录，默认使用启动文件的目录
   
    var server = this;
    _.extend(this,fa);
    this.options = options;
    // 读取硬盘上的配置合并后的配置
    server.realConfig = server.config;
    // 储存被插件们处理后的配置信息.
    server.config = rootFa.module("require").module();

   	this.PLUGIN_TIMEOUT = options.pluginTimeout || 3000;
   	this.ROOT_PATH = options.rootPath;

    if( typeof options.serverName !== 'string' || options.serverName === "" ){
        throw new Error("lack of server name");
    }
    this.serverName = options.serverName;

    //设置app，未设置则直接使用express
    this.app = options.app || express();

    //设置启动期的拦截
    var started = false;
    this.app.use(function (req, res, next) {
        if (started) {
            next();
            return;
        }
        res.status(503).send('Server is starting...');
    });

    
 	function loadPlugins(cb) {
 		var pluginFactory={};
 		// 根据options pluginList 获取插件factory
 		getPluginFactory(options.pluginList);

	    //注入插件加载代码
	    pluginFactory = _.mapValues( pluginFactory , injectPluginFactory , server);
	    //执行插件初始化
	    async.auto( pluginFactory , cb);

        // 一个递归的过程根据插件依赖，获取所有的应该加载的factory
        function getPluginFactory(pluginList){
            _.each(pluginList,function(pluginName){
                // 已经获取了factory 
                if(pluginFactory[pluginName]){
                    return;
                }
                var plugin = fa.plugin(pluginName);
                if(plugin){
                    if( plugin.dynamicDependency ){
                        // 如果该插件需要根据配置动态依赖，则给生成动态依赖
                        plugin = plugin.dynamicDependency(server);
                    }
                    pluginFactory[pluginName] = plugin;
                    // 递归处理依赖
                    if(_.isArray(plugin)){
                        
                        var deps = _.take( plugin , plugin.length -1 );

                        getPluginFactory(deps);
                    }
                }else{
                    throw new Error( util.format("Server:[%s] plugin [%s] does not exist.", server.serverName ,pluginName) );
                }
            });
        }

	}

    //加载插件
    loadPlugins(function (err) {
        if (err) throw err;
        started = true;
    });

    return this;
}


function injectPluginFactory(factory, name) {
    var pluginLoadTimeout, depsLoadTimeout;
    var server = this;

    function runFactory(factory, cb) {
        var conf, start = +(new Date());
        var done = false;
        var loadedCallback = function (err, plugin) {
            //阻止多次回调
            if (done) {
                return;
            }
            done = true;
            pluginLoadTimeout && clearTimeout(pluginLoadTimeout);
            if (err) {
                debuglog('plugin [%s] loaded failed [%s] in %d ms'.red, name, err.message, new Date() - start);
            }
            else {
                debuglog('plugin [%s] loaded in %d ms'.green, name, new Date() - start);
            }
            // yog.plugins[name] = plugin;
            cb && cb(err, plugin);
        };
        //获取合并后的配置，复制这个配置对象（避免污染硬盘上的实际配置对象)
        
        conf = _.cloneDeep(server.realConfig(name));
        // 记录到server对象上
        server.config.setStatic(name,conf);
        
        // if (conf.FA_DISABLE) {
        //     debuglog('plugin [%s] was disabled'.red, name);
        //     cb && cb(null, null);
        //     return;
        // }
        
        debuglog('load plugin [%s] with conf %s', name, JSON.stringify(conf));
        if (factory.length >= 3) {
            pluginLoadTimeout = setTimeout(function () {
                loadedCallback(new Error('timeout'));
            }, server.PLUGIN_TIMEOUT);
            //三个参数 factory(app, conf, cb) 用于异步
            factory( server , conf, loadedCallback);
        }
        else {
            //factory(app, conf) 用于同步
            var plugin = factory( server ,conf);
            //同步初始化自动回调
            loadedCallback(null,plugin);
        }
    }

    if (typeof factory === 'function') {
        return function (cb) {
            debuglog('start load plugin [%s]', name);
            runFactory(factory, cb);
        };
    }

    else if (factory instanceof Array) {
        //抽取前置依赖
        var deps = _.take(factory, factory.length - 1);
        debuglog('wait to load plugin [%s] with deps [%s]', name, deps);
        //设置组件加载超时
        depsLoadTimeout = setTimeout(function () {
            throw new Error('plugin [' + name + '] load failed since dependecies are not ready.');
        }, server.PLUGIN_TIMEOUT);
        //封装factory function
        var func = function (cb) {
            debuglog('start load plugin [%s]', name);
            var realFactory = factory[factory.length - 1];

            runFactory(realFactory, function (err,plugin) {
                clearTimeout(depsLoadTimeout);
                depsLoadTimeout = null;

                // console.log(server.realConfig(name));
                // console.log(server.config(name));

                cb && cb(err,plugin);
            });
        };
        deps.push(func);
        return deps;
    }
    else {
        throw new Error('invalid middleware: ' + name);
    }
};


module.exports = FaServer;
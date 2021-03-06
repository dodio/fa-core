module.exports = {
    confDir:function(server){
            return [server.ROOT_PATH,"conf/fis"].join("/");
        },
    viewsDir:function(server){
            return [server.ROOT_PATH,"views"].join("/");
        },
    bigpipe: true,
    bigpipeOpt: {
        skipAnalysis: true
    },
    tpl: {
        cache: rootFa.DEBUG ? false : 'memory'
    },
    engine: {
        tpl: 'yog-swig'
    },
    
    defaultEngine: "tpl"
};
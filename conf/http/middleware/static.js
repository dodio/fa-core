module.exports.static = {
  options:{
    maxAge: 0
  },
  staticPath: function(server){
      if(rootFa.ENV == "dev"){
        return [server.ROOT_PATH,"views"].join("/");
      }else{
        return [server.ROOT_PATH,"static"].join("/");
      }
  },
  urlPattern: rootFa.ENV == "dev" ? '/' : "/static",
  notFound: function(req, res){
      res.status(404);
      res.send('404: Resource not Found');
  }
}
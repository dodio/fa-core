var middleware = [];

middleware.push(
		[
            "dispatcher",
            {}
        ]);
middleware.push(
    [
        "views",
        {}
    ]);


middleware.push(
    [
	   "static",
    	{
            options:{
            	maxAge: 0
            },
        	staticPath: function(server){
                return [server.ROOT_PATH,"static"].join("/");
            },
        	urlPattern: '/static',
        	notFound: function(req, res){
            	res.status(404);
            	res.send('404: Resource not Found');
        	}
    	}
    ]);


module.exports.middleware = middleware;
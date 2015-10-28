var should  = require("should");
var path = require("path");
var createRequire = require("../lib/require");


describe("lib/require",function(){
  describe("#config",function() {
    var  config
    it("create a config function",function() {
      config = createRequire.config();
      config.should.be.a.Function();
    })
   

    it("get an {} object",function() {
      should(config("http")).be.a.empty();
    })

    it("return s a new config",function() {
      var _c = config.extend( [__dirname, "conf"].join("/") )
      should.notEqual(config,_c);
      config = _c;
    })

    it("read a conf", function(){
      should(config("http")).be.have.property("hello").equal("haha");
    })

    it("extend a new config path", function(){

      config = config.extend( [__dirname , "plugin_test"].join("/") );
      config.searchPath().should.have.length(2);
    })

    it("merge http config",function() {
      config("http").should.have.properties(['hello','world','fuck']);
      config("http").hello.should.be.eql("hello");
      config("http").world.should.be.eql("this is world");
      config("http").fuck.should.be.eql("fuck");
    })

  })
})
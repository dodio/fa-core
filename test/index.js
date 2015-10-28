var facore = require("../index");
var should = require("should");


describe("fa-core",function() {

  var fa = facore.init();

  it("#init",function() {

    fa.should.have.property("module");
    fa.should.have.property("plugin");
    fa.should.have.property("middleware");
    fa.should.have.property("config");

  })

  describe("Fa",function() {


    describe("#module",function() {
      it("load correctly",function() {
        fa.module("require").should.be.eql(require("../lib/require"));
      });
    })


    describe("#extend",function() {
      var ex;
      it("return a new Fa object",function () {
        ex = fa.extend({
          pluginPath:[__dirname,"plugin_test"].join("/")
        });
        should.notEqual(fa,ex);
        ex.constructor.name.should.be.eql("Fa");
      });

      it("same keys",function() {
        var faKeys = Object.keys(fa);
        ex.should.have.keys(faKeys);
      })

      it("plugin module searchPath",function() {
        ex.plugin.searchPath().length.should.be.eql(2);
      })

      it("load plugin in plugin_test",function() {
        ex.plugin("test").should.be.eql(require("./plugin_test/test"))
      })


      // it("extended the static module also",function(){
      //   fa.module("createRequire").should.be.eql(require("../lib/require"));
      // })
    })


  })

   

})




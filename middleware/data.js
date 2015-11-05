module.exports = function () {
	return function(req,res,next){
		res.data = makeData();
		next();
	}
}

function makeData(){
	var data = {};
	function handle(key,value){
		//key 必须存在 且为字符串，防止客户代码使用变量作为key值时产生异常
		if( key !== undefined  &&  typeof key != "string"){
			throw new Error("invalid key");
		}
		
		// 如果要删除某个可以使用 (key,null);
		if(value === undefined){
			return data[key];
		}
		// 设置新值，返回旧值.
		var tmp = data[key];
		data[key] = value;
		return tmp;
	}

	handle.get = function(){
		return data;
	}

	return handle;
}
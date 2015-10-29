module.exports.error = {
	// 支持动态获取
    handler: function (error, req, res, next) {
        res.status(500);
        res.send('500: Internal Server Error');
    }
};
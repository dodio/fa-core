/**
 * 默认不开启redis
 * @type {Object}
 * 如果需要配置 redis 将 false 覆盖为：connect-redis 的配置项
 *
 * 其他属性为 express-session 的配置，也可以自行配置 store .
 */
module.exports.session = {
	redis : false,
	cookie : {
		secure:false
	},
	secret : "FA_SESSION",
	name : "FA_SID"
}
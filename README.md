# Fa-web-framework
从yog2-core fork 而来的 web ui层框架，优化前端工程。

yog2 基于fis，需要先启动一个运行时，然后开发应用发布到运行时。

fa-core 是运行时和开发一体的，目前在模板开发时是实时保存实时刷新，改了路由内的功能，还不是实时更新。
支持seajs模块加载 md5 文件 hash名。

#fa-core 强制制定了三种运行模式：

##开发模式
静态资源与views同目录并对views目录开启express的静态文件访问，方便在模板中引用.
less在url请求的时候实时进行编译并返回内容，最大化的方便开发。
会输出调试console信息。
不会记录accesslog等日志
##测试模式
使用fis3编译views目录下的内容，会发布到应用下的output目录，并对output目录开启静态资源访问
但编译并不压缩文件。
依然会输出console信息，并会记录accesslog日志
静态资源依然是在同域下进行访问的。
##线上产品模式
使用fis3编译views目录下的内容 后会发布到.output目录，并会部署到设置的 目录下以及打上静态资源域名的路径等信息，这个output 将可以发布到静态资源的服务器上。
fa-core 的产品模式会很少的输出console信息，会记录各种日志，也不会开启静态资源访问。

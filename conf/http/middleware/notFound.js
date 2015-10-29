module.exports.notFound = {
    handler: function (req, res, next) {
        res.status(404);
        res.send('404: Page not Found');
    }
};
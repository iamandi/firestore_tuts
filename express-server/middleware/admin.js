
module.exports = function (req, res, next) {
    // 401 Unauthorized - when you have wrong username/password
    // 403 Forbidden - when you do not have authority even if you have username/password

    if(!req.user.isAdmin) return res.status(403).send('Access denied.');
    next();
}
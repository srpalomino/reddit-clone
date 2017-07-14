module.exports = (req, res, next) => {
    if (!req.isAuthenticated()) { 
        return res.sendStatus(401)  
    }                                   
    next();
}

module.exports.isLoggedIn = (req, res, next )=>{
    if(!req.isAuthenticated()|| req.session.userType === 'user'){
       return res.redirect("/login");
    }
    next();
};
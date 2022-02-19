const checkIfAuthenticated = function(req,res,next){
    if (req.session.user) {
        next(); // go to the next middleware
                // if no more middleware, then go to the
                // route function
    } else {
        // no user has logged in
        req.flash('error_messages', 'Login required to view page');
        res.redirect('/users/login');
    }
}

module.exports = { checkIfAuthenticated}
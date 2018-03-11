module.exports = {
    ensureAuthenticated: (req, res, next) => {
        if (req.isAuthenticated()) {
            return next();
        }
        req.flash('error_msg', 'Non hai i permessi per entrare in questa pagina');
        res.redirect('/login');
    }
}
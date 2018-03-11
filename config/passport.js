var mongoose = require('mongoose'),
    bcrypt = require('bcryptjs');
var localStrategy = require('passport-local').Strategy;

require('../models/user');
var Users = mongoose.model('Users');

module.exports = function (passport) {
    passport.use(new localStrategy({ usernameField: 'email' }, (email, password, done) => {
        Users.findOne({ email: email })
            .then(user => {
                if (!user) {
                    return done(null, false, { message: 'Utente non trovato' })
                }

                bcrypt.compare(password, user.password, (err, isMatch) => {
                    if (err) throw err;
                    if (isMatch) {
                        return done(null, user)
                    } else {
                        return done(null, false, { message: 'Password non corretta' })
                    }
                });
            })
    }));

    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function (id, done) {
        Users.findById(id, function (err, user) {
            done(err, user);
        });
    });
};
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cryptoJS = require('crypto-js');
require('dotenv').config();


exports.signup = (req, res, next) => {
    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: cryptoJS.HmacSHA512(req.body.email, process.env.MAIL_SECRET_KEY).toString(),// Crypt email
                password: hash// Hash password
            });
            user.save()
                .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
                .catch(error => res.status(400).json({ error })); 
        })
        .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
    User.findOne({ email: cryptoJS.HmacSHA512(req.body.email, process.env.MAIL_SECRET_KEY).toString() })// Compare Emails
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé.' });
            }
            bcrypt.compare(req.body.password, user.password)// Compare passwords
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect' });
                    }
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(// Generate user token 
                            { userId: user._id },
                            process.env.TOKEN_SECRET_KEY,
                            { expiresIn: '24h' }
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
};
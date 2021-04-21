const express = require('express');
const router = express.Router();

const UserCtrl = require('../controllers/user');
const { check, validationResult } = require('express-validator');


router.post('/signup',
    [check('email').isEmail(),
    check('password').isLength({ min: 5 })],
    (req, res, next) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }
        next();
    },
    UserCtrl.signup);
router.post('/login', UserCtrl.login);

module.exports = router;
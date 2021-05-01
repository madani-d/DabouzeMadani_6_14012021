const express = require('express');
const router = express.Router();

const UserCtrl = require('../controllers/user');
const { check, validationResult } = require('express-validator');


router.post('/signup',
    [check('email').isEmail(),// Validate if is email pattern (express-validator)
    check('password').isLength({ min: 5 })],// Validate if passwordlength minimum 5 (express-validator)
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
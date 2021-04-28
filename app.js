const { json } = require('express');
const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const sauceRoutes = require('./routes/sauce');
const bodyParser = require('body-parser');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
require('dotenv').config();



const app = express();

const limiter = rateLimit({// Limit max 100 request in 15 minutes
    windowMs: 15 * 60 * 1000,
    max: 100
});

mongoose.connect(process.env.ACCESS_MONGO_DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true 
})
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

mongoose.set('useCreateIndex', true);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());


app.use(helmet());// Secure the App by setting various HTTP headers
app.use(limiter)
app.use(xss());// Filter input to prevent XSS attacks
app.use(hpp());// Protect against HTTP parameter pollution attack
app.use(mongoSanitize({ replaceWith: '_' }));// Sanitize the data by replace some '$' and '.' by '_'


app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', userRoutes);
app.use('/api/sauces', sauceRoutes);


module.exports = app;
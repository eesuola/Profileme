const express = require('express');
const axios = require('axios');
const router = express.Router();


//rate limiting & logging
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const winston = require('winston');
const { log } = require('console');

//logging setup
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
            return `${timestamp} [${level}] ${message}${metaStr}`;
        })
    ),
    transports: [
        new winston.transports.Console()
    ]
});

const user = {
    name: "Opeyemi Eesuola",
    email: "eesuolap@gmail.com",
    stack: "NodeJs, Express, MongoDB, PostgreSQL, Prisma"
};

//morgan 
router.use(morgan('combined', {
    stream: {
        write: (message) => logger.info(message.trim())
    }
}));

//rate limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn('Rate limit exceeded', { ip: req.ip, route: req.originalUrl });
        res.status(429).json({
            status: 'error',
            message: 'Too many requests, please try again later.'
        });
    }
});
//routes
router.get('/me', apiLimiter,  async (req, res) => {
    try {
        logger.debug('Handling /me request', { ip: req.ip, ua: req.get('User-Agent') });
        const factResponse = await axios.get('https://catfact.ninja/fact');
        const response = {
            status: 'success',
            user: user,
            timestamp: new Date().toISOString(),
            catFact: factResponse.data.text
        };
        logger.info('Successfully fetched cat fact', { ip: req.ip });
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(response);
    } catch (error) {
        logger.error(`Error fetching cat fact: ${error}`, { ip: req.ip });
        const errorResponse = {
            status: 'error',
            user: user,
            timestamp: new Date().toISOString(),
            fact: 'Could not fetch cat fact at this time.',
            error: error.message
        };
        res.setHeader('Content-Type', 'application/json');
        res.status(500).json(errorResponse);
    }
} );
module.exports = router;
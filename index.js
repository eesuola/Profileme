// server.js
const express = require("express");
const axios = require("axios");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const winston = require("winston");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS
app.use(cors());

// Logging setup with Winston
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
      return `${timestamp} [${level}] ${message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});

// Morgan logging through Winston
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// Rate limiter: max 100 requests per 15 mins
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    logger.warn("Rate limit exceeded", { ip: req.ip });
    res.status(429).json({
      status: "error",
      message: "Too many requests, please try again later.",
    });
  },
});

// User data
const user = {
  name: "Opeyemi Eesuola",
  email: "eesuolap@gmail.com",
  stack: "Node.js, Express, MongoDB, PostgreSQL, Prisma",
};

// Default route
app.get("/", (req, res) => {
  res.send("Hello from simple server :)");
});

// Main endpoint
app.get("/me", apiLimiter, async (req, res) => {
  try {
    logger.debug("Handling /me request", {
      ip: req.ip,
      ua: req.get("User-Agent"),
    });

    const factResponse = await axios.get("https://catfact.ninja/fact", { timeout: 5000 });

    const response = {
      status: "success",
      user,
      timestamp: new Date().toISOString(),
      fact: factResponse.data.fact, // ✅ matches required schema
    };

    logger.info("Successfully fetched cat fact", { ip: req.ip });
    res.setHeader("Content-Type", "application/json");
    res.status(200).json(response);
  } catch (error) {
    logger.error(`Error fetching cat fact: ${error.message}`, { ip: req.ip });
    res.status(500).json({
      status: "error",
      user,
      timestamp: new Date().toISOString(),
      fact: "Could not fetch cat fact at this time.",
      error: error.message,
    });
  }
});

app.listen(port, () => {
  console.log(`> Server is up and running on port: ${port}`);
});

const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require('cors');
const moviesRouter = require('./src/movies');
const reviewsRouter = require('./src/reviews');
const moment = require('moment');
require('dotenv').config();

const server = express();

const {PORT = 4000, NEW_URL} = process.env

const whitelist = ['http://localhost:4000',NEW_URL]
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

server.use(express.json())
server.use("/movies", cors(corsOptions), moviesRouter)
server.use("/reviews", cors(corsOptions), reviewsRouter)
server.use("test", () => console.log('hello from test router'))


server.listen(PORT, () => {
    console.log(`server running at port ${PORT} time stamp ${moment.formart('LLLL')}`)
})

console.log(expressListEndpoint(server))
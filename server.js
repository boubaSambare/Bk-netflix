const express = require("express");
const listEndpoints = require("express-list-endpoints");
const cors = require('cors');
const moviesRouter = require('./src/movies');
const reviewsRouter = require('./src/reviews');
const {join} = require('path')
const moment = require('moment');
require('dotenv').config();

const server = express();

const {PORT = 4000, NEW_URL} = process.env

const whitelist = ['http://localhost:4000',NEW_URL,'http://localhost:3000']
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}

server.use("/images", express.static(join(__dirname, "./public/images")))

server.use(express.json())
server.use("/media", cors(corsOptions), moviesRouter)
server.use("/reviews", cors(corsOptions), reviewsRouter)
server.get('/test', (req, res) => {
    console.log('hello from test route')
    res.status(200).send('hello from test route')
})


server.listen(PORT, () => {
    console.log(`server running at port ${PORT} time stamp ${moment().format('LLLL')}`)
})

console.log(listEndpoints(server))
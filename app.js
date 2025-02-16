const express = require('express');
const app = express();
const helmet = require('helmet')
const cors = require('cors');

const chatRoutes = require('./src/routes/apiCall')

app.use(cors(
    {
        origin: ["https://jaledbreyaui.github.io/smx_frontend/", 'http://127.0.0.1:5173', "http://localhost:5173"],
        credentials: true,
        methods: ["POST", "PUT", "GET", "OPTIONS", "HEAD", "DELETE"],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
))

app.use(express.static(__dirname))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(helmet());


app.use('/', chatRoutes)



module.exports = app 

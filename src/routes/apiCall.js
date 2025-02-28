const { Router } = require('express')
const chatRoutes = Router()

const upload = require("../middleware/multer");

const { handleResponse, handleAudio } = require('../controllers/chat.controller')

chatRoutes.post('/chat', upload.single("audio"), handleResponse)
// chatRoutes.post('/process-audio', upload.single("audio"), handleAudio)

module.exports = chatRoutes
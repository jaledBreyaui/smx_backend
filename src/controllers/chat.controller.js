const callOpenAI = require('../services/gptApiCall')
const callWhisperAPI = require('../services/whisperApiCall')
const fs = require("fs");
const axios = require('axios');

const handleResponse = async (req, res) => {
    try {
        const { message } = req.body

        if (!message) {
            return res.status(400).json({ error: "Message is required" });
        }


        const response = await callOpenAI(message)

        res.json({ res: response.res, readyToAction: response.readyToAction })

    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        res.status(500).json({ error: "Failed to get response from ChatGPT" });
    }
}

const handleAudio = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No se envió ningún archivo de audio" });
        }
        const audioPath = req.file.path;

        const transcribedText = await callWhisperAPI(audioPath);

        const gptResponse = await callOpenAI(transcribedText)

        res.json({ res: gptResponse })

    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        res.status(500).json({ error: "Failed to get response from ChatGPT" });
    }

}

module.exports = { handleResponse, handleAudio }
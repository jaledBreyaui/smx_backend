const callOpenAI = require('../services/gptApiCall')
const callWhisperAPI = require('../services/whisperApiCall')
const fs = require("fs");
const axios = require('axios');

const handleResponse = async (req, res) => {
    try {
        let { message } = req.body
        let response = ""
        if (!message && !req.file) {
            return res.status(400).json({ error: "Check headers" });
        }
        if (req.file) {
            const audioPath = req.file.path;
            message = await callWhisperAPI(audioPath);
            console.log(message)
        }

        response = await callOpenAI(message)
        console.log(response)
        res.json({ res: response.res, readyToAction: response.readyToAction })
    } catch (error) {
        console.error("Error fetching ChatGPT response:", error);
        res.status(500).json({ error: "Failed to get response from ChatGPT" });
    }
}

// const handleAudio = async (req, res) => {
//     try {

//         const { message } = req.body
//         if (!message && !req.file) {
//             return res.status(400).json({ error: "Verificar contenido de la peticiLn" });
//         }
//         if (message) {
//             const response = await callOpenAI(message)
//             res.json({ res: response.res, readyToAction: response.readyToAction })
//         }
//         const audioPath = req.file.path;

//         const transcribedText = await callWhisperAPI(audioPath);

//         const gptResponse = await callOpenAI(transcribedText)

//         res.json({ res: gptResponse })

//     } catch (error) {
//         console.error("Error fetching ChatGPT response:", error);
//         res.status(500).json({ error: "Failed to get response from ChatGPT" });
//     }
// }

module.exports = { handleResponse }




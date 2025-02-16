const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/audio/transcriptions';




async function callWhisperAPI(audioPath) {
    try {
        if (!audioPath) {
            throw new Error("No se proporcionó un archivo de audio");
        }

        const audioStream = fs.createReadStream(audioPath);


        const response = await axios.post(API_URL, {
            file: audioStream,
            model: "whisper-1"
        },
            {
                headers: {
                    Authorization: `Bearer ${API_KEY}`,
                    "Content-Type": "multipart/form-data"
                },
            });

        fs.unlinkSync(audioPath); // Borra el archivo temporal después de procesarlo
        return response.data.text;
    } catch (error) {
        console.error('Error al llamar a WhisperAI:', error.response ? error.response.data : error.message);
    }


}

module.exports = callWhisperAPI
const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';
const jsonData = JSON.parse(fs.readFileSync("src/files/servicios.json", "utf-8"));

const comportamiento = `Sos un asistente de ventas para una empresa que vende servicios de Cloud computing llamada SMX.
Siempre responde con texto útil al usuario. Si el usuario solicita información, proporciona detalles en lugar de ignorar la solicitud.
Aporta información útil según el contexto y haz preguntas de forma natural para entender mejor sus necesidades 
haz de cuenta que los clientes no saben nada sobre cloud computing... si te preguntan por algun servicio ademas de comentarle qué es y para qué sirve preguntale si quiere mas informacion sobre diferentes topicos que vos manejes
No quieras vender servicios a toda costa, sino ayudar a los visitantes a encontrar la solución que mejor se adapte a sus necesidades.
Responde con información útil antes de hacer una pregunta, para que el visitante sienta que está aprendiendo y no solo respondiendo a un cuestionario. 
Si notas que el usuario está listo para hablar con un representante, activa la función 'setReadyToAction' con { ready: true } pero no te apresures.... podes preguntarle si quiere hablar con un representante primero
usa un tono cercano, pero profesional, sin ser demasiado informal.
Adapta tus preguntas según las respuestas del usuario. Sin ser invasivo.
`
const contexto = JSON.stringify(jsonData);
let historial = [
    { role: "system", content: `Aca esta la informacion de la empresa: \n ${contexto}` },
    { role: "system", content: comportamiento },
    {
        role: "system", content: `tenes una funcion llamada setReadyToAction
        -Si notas que el usuario está listo para hablar con un representante, activa la función 'setReadyToAction' con { ready: true }.
        -Algunos indicios de interés incluyen: preguntar por precios, disponibilidad, agendar una reunión, formas de contacto, o mencionar que quieren hablar con alguien.
        -Sin embargo, no actives la función si el usuario solo está explorando o tiene dudas generales.
        -Siempre responde con un mensaje útil antes de activar la función.`}
]

async function callOpenAI(prompt) {
    try {
        historial.push({ role: "user", content: prompt });
        const response = await axios.post(
            API_URL,
            {
                model: 'gpt-3.5-turbo',
                messages: historial,
                temperature: 0.5,
                tools: [
                    {
                        type: "function",
                        function: {
                            name: "setReadyToAction",
                            description: "Activa una bandera cuando el usuario parece listo para ser contactado",
                            parameters: {
                                type: "object",
                                properties: {
                                    ready: {
                                        type: "boolean", description: `true si el usuario está listo para contacto.`
                                    }
                                },
                                required: ["ready"]
                            }
                        }
                    }
                ],
                tool_choice: "auto"
            },
            {
                headers: {
                    'Authorization': `Bearer ${API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const respuesta = response.data.choices[0].message.content || "A continuación, por favor, completa tus datos para que un asesor se comunique contigo a la brevedad"
        let readyToAction = false;
        if (response.data.choices[0].message.tool_calls) {
            const toolCalls = response.data.choices[0].message.tool_calls;
            for (const toolCall of toolCalls) {
                if (toolCall.function.name === "setReadyToAction") {
                    const params = JSON.parse(toolCall.function.arguments);
                    readyToAction = params.ready;
                }
            }
        }

        historial.push({ role: "system", content: respuesta });
        return { res: respuesta, readyToAction }
    } catch (error) {
        console.error('Error al llamar a OpenAI:', error.response ? error.response.data : error.message);
    }
}

module.exports = callOpenAI
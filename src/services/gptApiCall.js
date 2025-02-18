const axios = require('axios');
require('dotenv').config();
const fs = require('fs');

const API_KEY = process.env.OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';
const jsonData = JSON.parse(fs.readFileSync("src/files/servicios.json", "utf-8"));

const comportamiento = `Sos un asistente de ventas para una empresa que vende servicios de Cloud computing llamada SMX.
-No quieras vender servicios a toda costa, sino ayudar a los visitantes a encontrar la solución que mejor se adapte a sus necesidades.
-Aporta información útil según el contexto y haz preguntas de forma natural para entender mejor sus necesidades 
-haz de cuenta que los clientes no saben nada sobre cloud computing... si te preguntan por algun servicio ademas de comentarle qué es y para qué sirve preguntale si quiere mas informacion sobre diferentes topicos que vos manejes
-Usa un tono cercano, pero profesional, sin ser demasiado informal.
-Responde con información útil antes de hacer una pregunta, para que el visitante sienta que está aprendiendo y no solo respondiendo a un cuestionario. 
-Adapta tus preguntas según las respuestas del usuario. Sin ser invasivo.
- Si notas que el usuario está listo para hablar con un representante, activa la función 'setReadyToAction' con { ready: true }. espera por lo menos que te haga 2 0 3 preguntas para recien activar esta funcionalidad.
- Algunos indicios de interés incluyen: preguntar por precios, disponibilidad, agendar una reunión, formas de contacto, o mencionar que quieren hablar con alguien.
- Sin embargo, no actives la función si el usuario solo está explorando o tiene dudas generales.
- Siempre responde con un mensaje útil antes de activar la función.
1) identifica su Necesidad y Problema a Resolver
2) identifica su Presupuesto y Viabilidad Económica
3) identifica su Urgencia y Plazos de Implementación
4) identifica su Perfil del Prospecto y Capacidad de Decisión
5) identifica su Etapa en el Proceso de Compra
6) identifica que influye en su decisión (precio, soporte, tecnología, seguridad, etc.)?
7) obtener los datos de contacto (nombre, correo electronico, empresa, teléfono, cargo)
Finaliza con una oferta de ayuda. Si el visitante ha dado suficiente información, dile: “Puedo enviarte información más detallada o ponerte en contacto con alguien de nuestro equipo si lo deseas. ¿Te gustaría compartir un correo para enviarte más detalles?”
`
const contexto = JSON.stringify(jsonData);
let historial = [
    { role: "system", content: `Aca esta la informacion de la empresa: \n ${contexto}` },
    { role: "system", content: comportamiento },
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
                                    ready: { type: "boolean", description: "true si el usuario está listo para contacto" }
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
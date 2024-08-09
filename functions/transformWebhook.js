const fetch = require('node-fetch');

exports.handler = async (event) => {
  try {
    // Parsear el cuerpo del POST
    const data = JSON.parse(event.body);

    // Transformar el JSON para Google Chat
    const googleChatPayload = {
      text: `Nuevo mensaje: ${data.message}`
    };

    // URL del webhook de Google Chat
    const googleChatWebhookUrl = 'https://chat.googleapis.com/v1/spaces/XXX/messages?key=XXX&token=XXX';

    // Enviar el webhook a Google Chat
    const response = await fetch(googleChatWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleChatPayload),
    });

    // Verificar el resultado del envío
    if (!response.ok) {
      throw new Error(`Error al enviar el webhook a Google Chat: ${response.statusText}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Webhook enviado correctamente a Google Chat' }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

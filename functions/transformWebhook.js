const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const googleChatPayload = {
      text: `Nuevo mensaje: ${data.message}`
    };

    const googleChatWebhookUrl = 'https://chat.googleapis.com/v1/spaces/XXX/messages?key=XXX&token=XXX';

    const response = await fetch(googleChatWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleChatPayload),
    });

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

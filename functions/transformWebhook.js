const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    // Definimos las variables comunes que usaremos en ambos casos
    const buildNumber = data.buildInfo.id;
    const buildState = data.state;
    const creationDate = data.created;
    const finishedDate = data.finished;
    const appName = data.app.name;
    const mergeBy = data.commit.user.name;
    const downloadLinks = data.artifacts?.map(artifact => {
      return {
        "text": artifact.name,
        "url": artifact.url
      };
    }) || [];

    // Creación del payload para Google Chat con "cards"
    const googleChatPayload = {
      cards: [
        {
          header: {
            title: `Build ${buildNumber} - ${appName}`,
            subtitle: `Estado: ${buildState.toUpperCase()}`,
            imageUrl: data.app.icon || data.commit.user.picture,
            imageStyle: "AVATAR"
          },
          sections: [
            {
              widgets: [
                {
                  keyValue: {
                    topLabel: "Fecha de Creación",
                    content: new Date(creationDate).toLocaleString(),
                    icon: "CLOCK"
                  }
                },
                {
                  keyValue: {
                    topLabel: "Fecha de Finalización",
                    content: new Date(finishedDate).toLocaleString(),
                    icon: "CLOCK"
                  }
                },
                {
                  keyValue: {
                    topLabel: "Mergeado por",
                    content: mergeBy,
                    icon: "PERSON"
                  }
                }
              ]
            },
            ...(downloadLinks.length > 0 ? [{
              widgets: [
                {
                  buttons: downloadLinks.map(link => ({
                    textButton: {
                      text: link.text,
                      onClick: {
                        openLink: {
                          url: link.url
                        }
                      }
                    }
                  }))
                }
              ]
            }] : [])
          ]
        }
      ]
    };

    const googleChatWebhookUrl = 'https://chat.googleapis.com/v1/spaces/AAAAqTDcwSQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=0mMIFS2n1trg5Pgm9ftzJ4g2UID44t8VoRykxreN9cY';

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

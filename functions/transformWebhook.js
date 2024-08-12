const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);

    const buildNumber = data.buildInfo.id;
    const buildState = data.state;
    const creationDate = data.created;
    const finishedDate = data.finished;
    const appName = data.app.name;
    const mergeBy = data.commit.user.name;
    const downloadLinks = data.artifacts?.map(artifact => {
      const extension = artifact.name.split('.').pop().toUpperCase();
      return {
        "text": `Descargar .${extension}`,
        "url": artifact.url
      };
    }) || [];

    // Determina el color basado en el estado
    const stateColor = buildState.toUpperCase() === 'SUCCESS' ? 'GREEN' : 'RED';

    const googleChatPayload = {
      cards: [
        {
          header: {
            title: `Build ${buildNumber} - ${appName}`,
            subtitle: `Estado: ${buildState.toUpperCase()}`,
            imageUrl: "https://developers.google.com/chat/images/quickstart-app-avatar.png",
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
                },
                {
                  keyValue: {
                    topLabel: "Estado",
                    content: buildState.toUpperCase(),
                    contentMultiline: true,
                    bottomLabel: stateColor === 'GREEN' ? "🟢" : "🔴",
                    icon: "DESCRIPTION"
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
      body: JSON.stringify(googleChatPayload),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

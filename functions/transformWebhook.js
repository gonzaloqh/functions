const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async (event) => {
  try {
    const data = JSON.parse(event.body);
    console.info("Origina Received: ", data)


    const buildNumber = data.buildInfo.id;
    const buildState = data.state.toUpperCase();
    const creationDate = data.created;
    const finishedDate = data.finished;
    const appName = data.app.name;
    const mergeBy = data.commit.user.name;
    const branchName = data.commit.ref;  // Extracción del nombre de la rama
    const downloadLinks = data.artifacts?.map(artifact => {
      const extension = artifact.name.split('.').pop().toUpperCase();
      return {
        "text": `Descargar .${extension}`,
        "url": artifact.url
      };
    }) || [];
    const environment = data.automation.environmentName;

    // Determina el emoji basado en el estado
    const stateEmoji = buildState === 'SUCCESS' ? '🟢' : '🔴';

    const googleChatPayload = {
      cards: [
        {
          header: {
            title: `Build ${appName} - ${buildNumber}`,
            subtitle: `Estado: ${stateEmoji} ${buildState}`,
            imageUrl: "https://developers.google.com/chat/images/quickstart-app-avatar.png",
            imageStyle: "AVATAR"
          },
          sections: [
            {
              widgets: [
                {
                  keyValue: {
                    topLabel: "Branch",
                    content: branchName,
                    icon: "FLIGHT_DEPARTURE"
                  }
                },
                {
                  keyValue: {
                    topLabel: "Environment",
                    content: environment,
                    icon: "BOOKMARK"
                  }
                },
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
                    content: buildState,
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

    const googleChatWebhookUrl = 'https://chat.googleapis.com/v1/spaces/AAAAuWppqUQ/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=TeZgmWj_1Gv5FLTIatL3IFw3tmeMR8ym5K7BCfMLvpI';
    console.info("Send to: ", googleChatWebhookUrl)
    console.info("Sending: ", googleChatWebhookUrl)

    const response = await fetch(googleChatWebhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleChatPayload),
    });

    console.info("Response: ", response)


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

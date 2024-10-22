import axios from 'axios';

export const sendMessageWithButtons = async (to: string, text: string, buttons: { title: string, payload: string }[]) => {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: to,
    type: "interactive",
    interactive: {
      type: "button",
      header: {
        type: "text",
        text: "Seleccione una opción",
      },
      body: {
        text: text,
      },
      action: {
        buttons: buttons.map(button => ({
          type: "reply",
          reply: {
            id: button.payload,
            title: button.title,
          },
        })),
      },
    },
  };

  await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
};

export const sendMessage = async (to: string, text: string) => {
  const url = `https://graph.facebook.com/v20.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const body = {
    messaging_product: "whatsapp",
    to: to,
    text: {
      body: text,
    },
  };

  await axios.post(url, body, {
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
};

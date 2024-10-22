import axios from 'axios';

const META_ACCESS_TOKEN = process.env.WHATSAPP_TOKEN;

export const sendMessage = async (to: string, message: string) => {
  const url = `https://graph.facebook.com/v20.0/<your_whatsapp_phone_id>/messages`;

  const data = {
    messaging_product: 'whatsapp',
    to: to,
    text: { body: message },
  };
  console.log(`Sending message to ${to}: ${message}`);

  await axios.post(url, data, {
    headers: {
      Authorization: `Bearer ${META_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
  });
};
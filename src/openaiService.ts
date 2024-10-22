import Configuration, { OpenAI } from 'openai';
import fs from 'fs';
import path from 'path';
require('dotenv').config();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

import { ClientOptions } from 'openai';

const clientOptions: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY,
  // Add other ClientOptions properties as needed
};

const openai = new OpenAI(clientOptions);

const prompts: { [key: string]: string } = {};

// Cargar prompts desde el archivo prompts.txt
const loadPrompts = () => {
  const filePath = path.join(__dirname, 'prompts.txt');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split('\n');
  
  lines.forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value) {
      prompts[key.trim()] = value.trim();
    }
  });
};

loadPrompts();

export const getPrompt = (key: string): string => {
  return prompts[key] || 'Prompt no encontrado';
};

export const openaiResponse = async (prompt: string): Promise<string> => {
    const response = await openai.completions.create({
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 150,
      temperature: 0.7,
    });
  
    return (response as any).data.choices[0].text.trim();
  };

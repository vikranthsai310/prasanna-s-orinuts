import { GoogleGenerativeAI } from '@google/generative-ai';

// SECURITY: Never hardcode API keys! Always use environment variables.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ Gemini API key not configured. AI features will be disabled.');
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface NutritionalData {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  fiber: number;
}

export const getNutritionalInfo = async (productName: string): Promise<NutritionalData | null> => {
  if (!genAI) {
    console.warn('Gemini AI not configured');
    return null;
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a nutritional data expert. Provide accurate nutritional information for "${productName}" per 100g.

Return ONLY a JSON object with these exact keys (no additional text):
{
  "calories": <number in kcal>,
  "protein": <number in grams>,
  "fat": <number in grams>,
  "carbs": <number in grams>,
  "fiber": <number in grams>
}

Use decimal values for precision (e.g., 21.2, 3.3). Return only the JSON, nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const data = JSON.parse(jsonMatch[0]);

    // Validate the data structure
    if (
      typeof data.calories === 'number' &&
      typeof data.protein === 'number' &&
      typeof data.fat === 'number' &&
      typeof data.carbs === 'number' &&
      typeof data.fiber === 'number'
    ) {
      return data;
    }

    throw new Error('Invalid data structure');
  } catch (error) {
    console.error('Error fetching nutritional info:', error);
    return null;
  }
};

export const getProductDescription = async (productName: string): Promise<string | null> => {
  if (!genAI) {
    console.warn('Gemini AI not configured');
    return null;
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `Write a compelling 2-3 sentence product description for "${productName}" for an e-commerce dry fruits website. Focus on quality, taste, and health benefits. Keep it professional and concise.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error generating description:', error);
    return null;
  }
};

export const askAIAssistant = async (question: string): Promise<string | null> => {
  if (!genAI) {
    console.warn('Gemini AI not configured');
    return null;
  }
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `You are a helpful assistant for an admin managing a dry fruits e-commerce store. Answer the following question concisely and accurately:

Question: ${question}

Provide a clear, brief answer focused on nutritional information, product details, or e-commerce best practices for dry fruits.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (error) {
    console.error('Error asking AI assistant:', error);
    return null;
  }
};

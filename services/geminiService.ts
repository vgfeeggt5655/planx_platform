import { GoogleGenAI, Type } from "@google/genai";
import { MCQ, Flashcard } from "../types";

declare global {
  interface Window {
    process?: {
      env?: {
        API_KEY?: string;
      };
    };
  }
}

const API_KEY = window.process?.env?.API_KEY;
if (!API_KEY) {
  console.error("Gemini API key is missing. Please set it in index.html");
}
const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateThumbnail = async (title: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
        model: 'imagen-3.0-generate-002',
        prompt: `Create a professional, visually appealing, and medically accurate educational thumbnail for a lecture titled "${title}". The style should be modern, clean, and engaging for medical students. Avoid any text on the image.`,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/jpeg',
          aspectRatio: '16:9',
        },
    });

    const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Error generating thumbnail:", error);
    throw error;
  }
};


export const generateQuiz = async (pdfText: string): Promise<MCQ[]> => {
  const prompt = `Based on the following medical lecture text, generate a challenging quiz of exactly 20 multiple-choice questions (MCQs). Each question must have 4 options, with only one correct answer. Ensure the questions cover a wide range of topics from the text and are suitable for medical students.

Text:
---
${pdfText.substring(0, 30000)}
---`;
  
  try {
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: prompt,
       config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.STRING },
              },
              required: ["question", "options", "correctAnswer"],
            },
          },
       },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};

export const generateFlashcards = async (pdfText: string): Promise<Flashcard[]> => {
  const prompt = `Analyze the following medical text and extract key concepts to create a set of concise flashcards. Each flashcard should have a "front" (a question or term) and a "back" (the answer or definition). Aim for around 30 high-yield flashcards.

Text:
---
${pdfText.substring(0, 30000)}
---`;
  
  try {
    const response = await ai.models.generateContent({
       model: "gemini-2.5-flash",
       contents: prompt,
       config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                front: { type: Type.STRING },
                back: { type: Type.STRING },
              },
              required: ["front", "back"],
            },
          },
       },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw error;
  }
};

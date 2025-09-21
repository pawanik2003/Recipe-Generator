
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const generateRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }

  if (ingredients.length === 0) {
    throw new Error("Please add at least one ingredient.");
  }

  const prompt = `You are a world-class chef. Based on the following ingredients, generate 3 creative and delicious recipes. Prioritize recipes that heavily feature the provided ingredients. Ingredients: ${ingredients.join(", ")}.`;

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
              recipeName: {
                type: Type.STRING,
                description: 'The name of the recipe.',
              },
              description: {
                type: Type.STRING,
                description: 'A brief, appetizing description of the dish.'
              },
              ingredients: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING,
                },
                description: 'A list of all ingredients required for the recipe.',
              },
              instructions: {
                type: Type.ARRAY,
                items: {
                  type: Type.STRING
                },
                description: 'Step-by-step cooking instructions.'
              },
              imageDescription: {
                type: Type.STRING,
                description: 'A short, descriptive prompt for an image generator to create a picture of the final dish.'
              }
            },
            required: ["recipeName", "description", "ingredients", "instructions", "imageDescription"]
          },
        },
      },
    });

    const jsonText = response.text.trim();
    const recipes: Recipe[] = JSON.parse(jsonText);
    return recipes;

  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. The model may be unavailable or the request was invalid. Please check your ingredients and try again.");
  }
};

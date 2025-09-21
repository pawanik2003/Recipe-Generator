// FIX: Switched from OpenAI to Google Gemini API for recipe and image generation.
import { GoogleGenAI, Type } from "@google/genai";
import type { Recipe } from '../types';

// This is a server-side file. `process.env` will be available in the Vercel/hosting environment.
// FIX: Initialized GoogleGenAI with API_KEY from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// FIX: Defined responseSchema for Gemini API's JSON mode.
const recipeSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            recipeName: { type: Type.STRING, description: "The name of the recipe." },
            description: { type: Type.STRING, description: "A brief, appetizing description of the dish." },
            ingredients: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "A list of all ingredients required for the recipe." 
            },
            instructions: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING }, 
                description: "Step-by-step cooking instructions." 
            },
            imageDescription: { type: Type.STRING, description: "A short, descriptive prompt for an image generator to create a picture of the final dish. Example: \"A steaming bowl of chicken noodle soup with fresh parsley.\"" }
        },
    }
};

export default async function handler(request: Request) {
    if (request.method === 'OPTIONS') {
        return new Response(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });
    }

    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
        });
    }

    try {
        const body = await request.json();
        const { type } = body;

        if (type === 'recipes') {
            const { ingredients } = body;
            if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
                 return new Response(JSON.stringify({ error: 'Ingredients are required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // FIX: Replaced OpenAI prompt with Gemini systemInstruction and contents.
            const systemInstruction = `You are a world-class chef. Your task is to generate 3 creative and delicious recipes based on a list of ingredients. Prioritize recipes that heavily feature the provided ingredients.`;
            const contents = `Generate 3 recipes using the following ingredients: ${ingredients.join(", ")}.`;

            // FIX: Replaced OpenAI call with Gemini's generateContent using the 'gemini-2.5-flash' model.
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: contents,
                config: {
                    systemInstruction: systemInstruction,
                    responseMimeType: "application/json",
                    responseSchema: recipeSchema,
                }
            });

            const jsonText = response.text;
            if (!jsonText) {
                throw new Error("Received an empty response from Gemini.");
            }
            
            // FIX: Parsing the JSON response from Gemini. The responseSchema ensures the output is a valid Recipe array. This fixes the original type error.
            const recipes: Recipe[] = JSON.parse(jsonText);

            return new Response(JSON.stringify(recipes), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });

        } else if (type === 'image') {
            const { prompt } = body;
             if (!prompt || typeof prompt !== 'string') {
                 return new Response(JSON.stringify({ error: 'A prompt is required' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                });
            }

            // FIX: Replaced OpenAI image generation with Gemini's generateImages using the 'imagen-4.0-generate-001' model.
            const imageResponse = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: `A vibrant, professional food photograph of ${prompt}, presented beautifully on a clean background.`,
                config: {
                    numberOfImages: 1,
                    outputMimeType: 'image/jpeg',
                },
            });

            const base64ImageBytes = imageResponse.generatedImages[0]?.image.imageBytes;
            if (!base64ImageBytes) {
                throw new Error("Failed to get base64 image from Gemini.");
            }
            
            const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;

            return new Response(JSON.stringify({ imageUrl }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            return new Response(JSON.stringify({ error: 'Invalid request type' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

    } catch (error: any) {
        console.error("Error in API route:", error);
        return new Response(JSON.stringify({ error: error.message || 'An internal server error occurred.' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
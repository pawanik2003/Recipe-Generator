import OpenAI from 'openai';
import type { Recipe } from '../types';

// This is a server-side file. `process.env` will be available in the Vercel/hosting environment.
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

            const systemPrompt = `You are a world-class chef. Your task is to generate 3 creative and delicious recipes based on a list of ingredients. Prioritize recipes that heavily feature the provided ingredients.
            Respond with a JSON object containing a single key "recipes", which is an array of recipe objects. Each recipe object must have the following structure:
            - recipeName: string
            - description: string
            - ingredients: string[]
            - instructions: string[]
            - imageDescription: string (A short, descriptive prompt for an image generator to create a picture of the final dish. Example: "A steaming bowl of chicken noodle soup with fresh parsley.")
            `;
            const userPrompt = `Generate 3 recipes using the following ingredients: ${ingredients.join(", ")}.`;

            const completion = await openai.chat.completions.create({
                model: "gpt-4o",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: userPrompt },
                ],
                response_format: { type: "json_object" },
            });

            const content = completion.choices[0].message.content;
            if (!content) {
                throw new Error("Received an empty response from OpenAI.");
            }

            const { recipes }: { recipes: Recipe[] } = JSON.parse(content);

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

            const imageResponse = await openai.images.generate({
                model: "dall-e-3",
                prompt: `A vibrant, professional food photograph of ${prompt}, presented beautifully on a clean background.`,
                n: 1,
                size: "1024x1024",
                response_format: 'b64_json',
            });
            
            const b64_json = imageResponse.data[0]?.b64_json;
            if (!b64_json) {
                throw new Error("Failed to get base64 image from OpenAI.");
            }

            const imageUrl = `data:image/png;base64,${b64_json}`;

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
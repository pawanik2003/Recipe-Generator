import { Recipe } from '../types';

const API_ENDPOINT = '/api/generate'; // The new serverless function endpoint

export const generateRecipes = async (ingredients: string[]): Promise<Recipe[]> => {
  if (ingredients.length === 0) {
    throw new Error("Please add at least one ingredient.");
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'recipes',
        ingredients: ingredients,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const recipes: Recipe[] = await response.json();
    return recipes;

  } catch (error) {
    console.error("Error generating recipes:", error);
    throw new Error("Failed to generate recipes. The server might be busy or an error occurred. Please try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'image',
        prompt: prompt,
      }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const { imageUrl } = await response.json();
    if (!imageUrl) {
        throw new Error("Image URL was not returned from the server.");
    }
    return imageUrl;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate an image for the recipe.");
  }
};
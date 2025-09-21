import React, { useState, useCallback } from 'react';
import { Recipe } from './types';
import { generateRecipes, generateImage } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import IngredientInput from './components/IngredientInput';
import IngredientTag from './components/IngredientTag';
import RecipeCard from './components/RecipeCard';
import Spinner from './components/Spinner';

const App: React.FC = () => {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState<string>('');

  const handleAddIngredient = (ingredient: string) => {
    if (!ingredients.find(i => i.toLowerCase() === ingredient.toLowerCase())) {
      setIngredients(prev => [...prev, ingredient]);
    }
  };

  const handleRemoveIngredient = (ingredientToRemove: string) => {
    setIngredients(prev => prev.filter(i => i !== ingredientToRemove));
  };

  const handleGenerateRecipes = useCallback(async () => {
    if (ingredients.length === 0) {
      setError("Please add some ingredients first.");
      return;
    }
    setLoadingMessage("Generating delicious recipes...");
    setIsLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const initialRecipes = await generateRecipes(ingredients);
      
      setLoadingMessage("Creating beautiful images for your recipes...");

      const recipesWithImages = await Promise.all(
        initialRecipes.map(async (recipe) => {
          try {
            const imageUrl = await generateImage(recipe.imageDescription);
            return { ...recipe, imageUrl };
          } catch (imageError) {
            console.error(`Failed to generate image for ${recipe.recipeName}:`, imageError);
            return recipe; // Return recipe without image on failure
          }
        })
      );
      
      setRecipes(recipesWithImages);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  const WelcomeMessage = () => (
    <div className="text-center p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">Welcome to your personal chef!</h2>
        <p className="text-gray-500">Add the ingredients you have on hand, and we'll whip up some recipe ideas for you.</p>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Your Ingredients</h2>
          <IngredientInput onAddIngredient={handleAddIngredient} />
          <div className="flex flex-wrap gap-2 mt-4 min-h-[40px]">
            {ingredients.map(ingredient => (
              <IngredientTag key={ingredient} ingredient={ingredient} onRemove={handleRemoveIngredient} />
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              onClick={handleGenerateRecipes}
              disabled={isLoading || ingredients.length === 0}
              className="px-8 py-4 bg-emerald-600 text-white text-lg font-bold rounded-lg shadow-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition duration-300 ease-in-out transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:scale-100"
            >
              {isLoading ? 'Generating...' : 'Generate Recipes'}
            </button>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8">
          {isLoading && <Spinner message={loadingMessage} />}
          {error && <div className="text-center p-4 bg-red-100 text-red-700 rounded-lg shadow-md">{error}</div>}
          
          {!isLoading && !error && recipes.length === 0 && <WelcomeMessage />}

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mt-6">
            {recipes.map((recipe, index) => (
              <RecipeCard key={index} recipe={recipe} />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default App;

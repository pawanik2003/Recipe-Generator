import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const placeholderImageUrl = `https://picsum.photos/seed/${recipe.recipeName.replace(/\s/g, '')}/400/300`;

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
      <div className="w-full h-56 bg-gray-200 flex items-center justify-center">
        <img 
            className="w-full h-full object-cover" 
            src={recipe.imageUrl || placeholderImageUrl} 
            alt={recipe.imageDescription} 
            onError={(e) => { e.currentTarget.src = placeholderImageUrl; }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{recipe.recipeName}</h3>
        <p className="text-gray-600 mb-4">{recipe.description}</p>
        
        <div className="mb-4">
            <h4 className="font-semibold text-lg text-gray-700 mb-2 border-b pb-1">Ingredients</h4>
            <ul className="list-disc list-inside space-y-1 text-gray-600">
                {recipe.ingredients.map((item, index) => <li key={index}>{item}</li>)}
            </ul>
        </div>

        <div>
            <h4 className="font-semibold text-lg text-gray-700 mb-2 border-b pb-1">Instructions</h4>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
                {recipe.instructions.map((step, index) => <li key={index}>{step}</li>)}
            </ol>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;

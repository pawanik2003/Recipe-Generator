
import React from 'react';

interface IngredientTagProps {
  ingredient: string;
  onRemove: (ingredient: string) => void;
}

const IngredientTag: React.FC<IngredientTagProps> = ({ ingredient, onRemove }) => {
  return (
    <div className="flex items-center bg-gray-200 text-gray-700 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 ease-in-out hover:bg-gray-300">
      <span>{ingredient}</span>
      <button
        onClick={() => onRemove(ingredient)}
        className="ml-2 text-gray-500 hover:text-red-500 focus:outline-none focus:text-red-500"
        aria-label={`Remove ${ingredient}`}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

export default IngredientTag;


import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center space-x-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-emerald-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.6 13.71L12 11.12l-4.6 4.6C6.53 18.19 6 17.63 6 16.71V8c0-1.1.9-2 2-2h8c1.1 0 2 .9 2 2v8.71c0 .92-.53 1.48-1.4 1zM16 8h-2v3.12l2 2V8zm-4 0H8v5.12l2 2V8z"/>
            </svg>
            <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
                AI Recipe Generator
            </h1>
        </div>
        <p className="text-gray-500 mt-1">Discover your next meal with the ingredients you already have.</p>
      </div>
    </header>
  );
};

export default Header;
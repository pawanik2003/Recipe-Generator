import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white mt-auto">
      <div className="container mx-auto px-4 py-6 text-center text-gray-500">
        <p>&copy; {new Date().getFullYear()} AI Recipe Generator. Powered by OpenAI.</p>
      </div>
    </footer>
  );
};

export default Footer;
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-black/70 border-b border-white/10 supports-[backdrop-filter]:bg-black/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center md:justify-start items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-600 shadow-lg shadow-red-500/20"></div>
            <h1 className="text-2xl font-bold tracking-tight text-white font-serif">
              Nexus<span className="text-red-500">News</span>
            </h1>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
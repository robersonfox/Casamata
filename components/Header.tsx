
import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="bg-slate-900 text-white py-6 px-4 shadow-lg border-b-4 border-orange-500">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-orange-500 p-2 rounded-full">
            <i className="fa-solid fa-crosshairs text-2xl"></i>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Casamata - Regulagem de Mira</h1>
            <p className="text-slate-400 text-xs uppercase tracking-widest">Guia de Precisão para Iniciantes</p>
          </div>
        </div>
        <div className="hidden md:block text-right">
          <span className="text-xs text-slate-400">Simplificando a Balística</span>
        </div>
      </div>
    </header>
  );
};

export default Header;

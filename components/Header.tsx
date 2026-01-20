import React from 'react';
import { RefreshCw, FileDown, Moon, Sun } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  onExport: () => void;
  isExporting: boolean;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

const Header: React.FC<HeaderProps> = ({ onReset, onExport, isExporting, isDarkMode, onToggleTheme }) => {
  return (
    <header className="bg-[#1e3a8a] dark:bg-[#111827] text-white p-4 shadow-md transition-colors duration-300">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold">מחשבון ביטוח חיים</h1>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 hide-on-print w-full md:w-auto">
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center bg-white/10 text-white p-2 rounded-md hover:bg-white/20 transition-colors"
            title={isDarkMode ? 'מעבר למצב יום' : 'מעבר למצב לילה'}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button 
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2 bg-white text-[#1e3a8a] px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-sm flex-1 md:flex-none justify-center whitespace-nowrap"
          >
            <FileDown size={18} />
            {isExporting ? 'מייצא...' : 'ייצוא PDF'}
          </button>
          <button 
            onClick={onReset}
            className="flex items-center gap-2 bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors font-medium text-sm border border-blue-500 flex-1 md:flex-none justify-center whitespace-nowrap"
          >
            <RefreshCw size={18} />
            איפוס נתונים
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarOpen, setSidebarOpen }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const context = useContext(DataContext);

  if (!context) return null;
  const { currentUser, logout } = context;

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-gray-800 border-b-4 border-indigo-500">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 focus:outline-none lg:hidden">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20M4 12H20M4 18H11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
      <div className="flex items-center">
        <div className="relative">
          <button onClick={() => setDropdownOpen(!dropdownOpen)} className="relative z-10 block h-8 w-8 overflow-hidden rounded-full shadow focus:outline-none">
             <span className="flex items-center justify-center h-full w-full bg-indigo-500 text-white font-bold text-lg">
                {currentUser?.nama.charAt(0).toUpperCase()}
            </span>
          </button>
          <div
            onClick={() => setDropdownOpen(false)}
            className={`fixed inset-0 h-full w-full z-10 ${dropdownOpen ? 'block' : 'hidden'}`}
          ></div>
          <div
            className={`absolute right-0 mt-2 py-2 w-48 bg-gray-700 rounded-md shadow-xl z-20 ${dropdownOpen ? 'block' : 'hidden'}`}
          >
            <a href="#" className="block px-4 py-2 text-sm text-gray-200">
                {currentUser?.nama} ({currentUser?.user})
            </a>
            <button onClick={logout} className="w-full text-left block px-4 py-2 text-sm text-gray-200 hover:bg-indigo-500 hover:text-white">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
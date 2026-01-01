
import React, { useContext } from 'react';
import { DataContext } from '../context/DataContext';

const Spinner: React.FC = () => {
    const context = useContext(DataContext);
    if (!context?.isLoading) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-50 transition-opacity">
            <div className="w-16 h-16 border-4 border-t-4 border-gray-200 border-t-indigo-500 rounded-full animate-spin"></div>
        </div>
    );
};

export default Spinner;

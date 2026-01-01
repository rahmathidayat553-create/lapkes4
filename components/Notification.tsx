
import React, { useContext, useEffect } from 'react';
import { DataContext } from '../context/DataContext';

const Notification: React.FC = () => {
    const context = useContext(DataContext);

    useEffect(() => {
        if (context?.notification) {
            const timer = setTimeout(() => {
                context.setNotification(null);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [context?.notification, context?.setNotification]);

    if (!context?.notification) return null;

    const { type, message } = context.notification;

    const baseClasses = "fixed top-5 right-5 z-[100] p-4 rounded-lg shadow-lg text-white max-w-sm transition-transform transform";
    const typeClasses = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        warning: 'bg-yellow-600',
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <p className="font-semibold">{message}</p>
        </div>
    );
};

export default Notification;


import React from 'react';

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg';
    text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', text }) => {
    const sizeClasses = {
        sm: 'w-6 h-6',
        md: 'w-12 h-12',
        lg: 'w-24 h-24',
    };

    return (
        <div className="flex flex-col items-center justify-center space-y-4 my-8">
            <div
                className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 border-t-blue-600 ${sizeClasses[size]}`}
            ></div>
            {text && <p className="text-lg text-gray-600 dark:text-gray-300 animate-pulse">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;

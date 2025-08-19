
import React from 'react';
import { Link } from 'react-router-dom';
import { Resource } from '../../types';

interface LectureCardProps {
    resource: Resource;
}

const LectureCard: React.FC<LectureCardProps> = ({ resource }) => {
    return (
        <Link to={`/watch/${resource.id}`} className="block group">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
                <div className="relative">
                    <img 
                        src={resource.image_url} 
                        alt={resource.title} 
                        className="w-full h-40 object-cover" 
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-opacity duration-300"></div>
                </div>
                <div className="p-4">
                    <h3 className="text-lg font-semibold truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {resource.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{resource.Subject_Name}</p>
                </div>
            </div>
        </Link>
    );
};

export default LectureCard;

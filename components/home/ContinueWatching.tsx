
import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Resource } from '../../types';
import { Link } from 'react-router-dom';

interface ContinueWatchingProps {
    resources: Resource[];
}

const ContinueWatching: React.FC<ContinueWatchingProps> = ({ resources }) => {
    const { currentUser } = useAuth();

    const watchedVideos = useMemo(() => {
        if (!currentUser || !currentUser.watched) return [];
        
        return Object.entries(currentUser.watched)
            .map(([resourceId, progress]) => {
                const resource = resources.find(r => r.id === resourceId);
                // We assume progress is stored as percentage
                if (resource && progress > 5 && progress < 95) { 
                    return { ...resource, progress };
                }
                return null;
            })
            .filter((v): v is Resource & { progress: number } => v !== null)
            .sort((a, b) => b.progress - a.progress) // Show most progressed first
            .slice(0, 4); // Limit to 4 videos
    }, [currentUser, resources]);

    if (watchedVideos.length === 0) {
        return null;
    }

    return (
        <section>
            <h2 className="text-2xl font-bold mb-4">Continue Watching</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {watchedVideos.map(video => (
                    <Link to={`/watch/${video.id}`} key={video.id} className="block group">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                            <img src={video.image_url} alt={video.title} className="w-full h-32 object-cover" />
                            <div className="p-4">
                                <h3 className="font-semibold truncate">{video.title}</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{video.Subject_Name}</p>
                                <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                                    <div 
                                        className="bg-blue-600 h-2.5 rounded-full" 
                                        style={{ width: `${video.progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
};

export default ContinueWatching;

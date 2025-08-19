
import React, { useRef, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const WatchPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { resources, loading: dataLoading } = useData();
    const { currentUser, updateUserContext } = useAuth();
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const [resource, setResource] = useState(resources.find(r => r.id === id));
    
    // Debounce timer for updating watch progress
    const progressUpdateTimer = useRef<number | null>(null);

    useEffect(() => {
        if (!resource) {
            setResource(resources.find(r => r.id === id));
        }
    }, [id, resources, resource]);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement && currentUser && resource) {
            const lastTime = currentUser.watched?.[resource.id] || 0;
             // We store percentage, but here we need time. Let's assume duration is available.
             // This is a simplification. A better approach needs video metadata.
             // For now, let's refactor to store time directly.
             // Let's assume the `watched` object stores { resourceId: timeInSeconds }
            videoElement.currentTime = lastTime;
        }
    }, [currentUser, resource]);

    const handleTimeUpdate = () => {
        if (progressUpdateTimer.current) {
            clearTimeout(progressUpdateTimer.current);
        }
        progressUpdateTimer.current = window.setTimeout(() => {
            if (videoRef.current && currentUser && resource) {
                const currentTime = videoRef.current.currentTime;
                const duration = videoRef.current.duration;
                if(duration > 0){
                    const newWatched = { ...currentUser.watched, [resource.id]: currentTime };
                    updateUserContext({ watched: newWatched });
                }
            }
        }, 5000); // Update every 5 seconds
    };

    if (dataLoading) return <LoadingSpinner text="Loading lecture..." />;
    if (!resource) return <div className="text-center text-xl">Lecture not found.</div>;

    const isYoutube = resource.video_link.includes('youtube.com') || resource.video_link.includes('youtu.be');
    let videoId = '';
    if (isYoutube) {
        const url = new URL(resource.video_link);
        videoId = url.searchParams.get('v') || url.pathname.split('/').pop() || '';
    }

    return (
        <div className="max-w-7xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-black">
                    {isYoutube ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${videoId}`}
                            title={resource.title}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    ) : (
                        <video
                            ref={videoRef}
                            src={resource.video_link}
                            controls
                            className="w-full h-full"
                            onTimeUpdate={handleTimeUpdate}
                        ></video>
                    )}
                </div>
                <div className="p-6">
                    <h1 className="text-3xl font-bold mb-2">{resource.title}</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">{resource.Subject_Name}</p>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <a 
                            href={resource.pdf_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex-1 text-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            View Slides (PDF)
                        </a>
                        <Link 
                            to={`/aitools/${resource.id}`}
                            className="flex-1 text-center px-6 py-3 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 transition-colors"
                        >
                           AI Study Tools
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WatchPage;

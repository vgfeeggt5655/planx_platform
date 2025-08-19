
import React, { useState, useMemo } from 'react';
import { useData } from '../hooks/useData';
import LoadingSpinner from '../components/common/LoadingSpinner';
import SubjectSection from '../components/home/SubjectSection';
import ContinueWatching from '../components/home/ContinueWatching';

const HomePage: React.FC = () => {
    const { subjects, resources, loading, error } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubject, setSelectedSubject] = useState<string>('All');

    const filteredResources = useMemo(() => {
        return resources.filter(resource => {
            const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                  resource.Subject_Name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesSubject = selectedSubject === 'All' || resource.Subject_Name === selectedSubject;
            return matchesSearch && matchesSubject;
        });
    }, [resources, searchTerm, selectedSubject]);

    const subjectsToDisplay = useMemo(() => {
        if (selectedSubject === 'All') {
            return subjects;
        }
        return subjects.filter(s => s.Subject_Name === selectedSubject);
    }, [subjects, selectedSubject]);

    if (loading) return <LoadingSpinner text="Loading educational materials..." />;
    if (error) return <div className="text-center text-red-500">Error loading data: {error.message}</div>;

    return (
        <div className="space-y-12">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <h1 className="text-3xl font-bold mb-4">Welcome to Plan X</h1>
                <p className="text-gray-600 dark:text-gray-300">Your central hub for medical education. Explore lectures, test your knowledge with AI quizzes, and master concepts with smart flashcards.</p>
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        placeholder="Search lectures by title or subject..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-grow p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="p-3 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                        <option value="All">All Subjects</option>
                        {subjects.map(subject => (
                            <option key={subject.id} value={subject.Subject_Name}>
                                {subject.Subject_Name}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <ContinueWatching resources={resources} />

            <div className="space-y-8">
                {subjectsToDisplay.map(subject => {
                    const subjectResources = filteredResources.filter(r => r.Subject_Name === subject.Subject_Name);
                    if (subjectResources.length === 0) return null;
                    return (
                        <SubjectSection 
                            key={subject.id} 
                            subject={subject} 
                            resources={subjectResources} 
                        />
                    );
                })}
            </div>
            
            {filteredResources.length === 0 && !loading && (
                <div className="text-center py-12">
                    <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No lectures found.</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default HomePage;

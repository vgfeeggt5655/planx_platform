
import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import * as api from '../../services/apiService';
import { Subject } from '../../types';

const SubjectManager: React.FC = () => {
    const { subjects, refreshData } = useData();
    const [newSubjectName, setNewSubjectName] = useState('');
    
    const handleAddSubject = async () => {
        if (!newSubjectName.trim()) return;
        try {
            await api.addSubject(newSubjectName);
            await refreshData();
            setNewSubjectName('');
        } catch (error) {
            alert('Failed to add subject');
        }
    };
    
    const handleDeleteSubject = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this subject? This might affect existing lectures.')) {
            try {
                await api.deleteSubject(id);
                await refreshData();
            } catch (error) {
                alert('Failed to delete subject');
            }
        }
    };
    
    const handleMove = async (index: number, direction: 'up' | 'down') => {
        const newSubjects = [...subjects];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newSubjects.length) return;

        // Swap positions
        [newSubjects[index], newSubjects[targetIndex]] = [newSubjects[targetIndex], newSubjects[index]];

        // Update 'number' property for all subjects to reflect new order
        const updatedSubjectsWithOrder = newSubjects.map((subject, idx) => ({ ...subject, number: idx }));

        try {
            // Send all update requests
            await Promise.all(updatedSubjectsWithOrder.map(s => api.updateSubject(s)));
            await refreshData();
        } catch (error) {
            alert('Failed to reorder subjects.');
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Subjects</h2>
            <div className="flex gap-2 mb-6">
                <input
                    type="text"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    placeholder="New subject name"
                    className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
                <button onClick={handleAddSubject} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add Subject
                </button>
            </div>
            <ul className="space-y-2">
                {subjects.map((subject, index) => (
                    <li key={subject.id} className="flex items-center justify-between p-3 bg-gray-100 dark:bg-gray-700 rounded-md">
                        <span className="font-medium">{subject.Subject_Name}</span>
                        <div className="flex items-center gap-2">
                             <button onClick={() => handleMove(index, 'up')} disabled={index === 0} className="disabled:opacity-25">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-10.293a1 1 0 00-1.414-1.414l-3 3a1 1 0 000 1.414l3 3a1 1 0 001.414-1.414L9.414 11H13a1 1 0 100-2H9.414l1.293-1.293z" clipRule="evenodd" transform="rotate(90 10 10)" /></svg>
                             </button>
                             <button onClick={() => handleMove(index, 'down')} disabled={index === subjects.length - 1} className="disabled:opacity-25">
                                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.293 9.707a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 12.414V7a1 1 0 112 0v5.414l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3z" clipRule="evenodd" transform="rotate(-90 10 10)" /></svg>
                            </button>
                            <button onClick={() => handleDeleteSubject(subject.id)} className="text-red-500 hover:text-red-700 ml-4">
                                Delete
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SubjectManager;

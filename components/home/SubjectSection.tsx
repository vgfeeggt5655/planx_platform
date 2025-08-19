
import React from 'react';
import { Subject, Resource } from '../../types';
import LectureCard from './LectureCard';

interface SubjectSectionProps {
    subject: Subject;
    resources: Resource[];
}

const SubjectSection: React.FC<SubjectSectionProps> = ({ subject, resources }) => {
    return (
        <section>
            <h2 className="text-3xl font-bold mb-6 pb-2 border-b-2 border-blue-500">
                {subject.Subject_Name}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {resources.map(resource => (
                    <LectureCard key={resource.id} resource={resource} />
                ))}
            </div>
        </section>
    );
};

export default SubjectSection;

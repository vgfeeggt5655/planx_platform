
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';
import ContentManager from '../components/admin/ContentManager';
import SubjectManager from '../components/admin/SubjectManager';
import UserManager from '../components/admin/UserManager';

type AdminTab = 'content' | 'subjects' | 'users';

const AdminDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('content');
    const { currentUser } = useAuth();
    const isSuperAdmin = currentUser?.role === UserRole.SUPER_ADMIN;

    const renderTabContent = () => {
        switch (activeTab) {
            case 'content':
                return <ContentManager />;
            case 'subjects':
                return <SubjectManager />;
            case 'users':
                return isSuperAdmin ? <UserManager /> : <div>You do not have permission to manage users.</div>;
            default:
                return null;
        }
    };

    const tabClasses = (tabName: AdminTab) => 
        `px-4 py-2 font-semibold rounded-t-lg transition-colors duration-200 ${
            activeTab === tabName 
            ? 'bg-white dark:bg-gray-800 border-b-2 border-blue-500' 
            : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
        }`;

    return (
        <div className="space-y-6">
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <div className="flex border-b border-gray-300 dark:border-gray-600">
                <button onClick={() => setActiveTab('content')} className={tabClasses('content')}>
                    Content
                </button>
                <button onClick={() => setActiveTab('subjects')} className={tabClasses('subjects')}>
                    Subjects
                </button>
                {isSuperAdmin && (
                    <button onClick={() => setActiveTab('users')} className={tabClasses('users')}>
                        Users
                    </button>
                )}
            </div>
            <div className="p-6 bg-white dark:bg-gray-800 rounded-b-lg shadow-md">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default AdminDashboardPage;

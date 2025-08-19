
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Subject, Resource, User } from '../types';
import * as api from '../services/apiService';

interface DataContextType {
    subjects: Subject[];
    resources: Resource[];
    users: User[];
    loading: boolean;
    error: Error | null;
    refreshData: () => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [resources, setResources] = useState<Resource[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [subjectsData, resourcesData, usersData] = await Promise.all([
                api.getSubjects(),
                api.getResources(),
                api.getUsers(),
            ]);
            setSubjects(subjectsData);
            setResources(resourcesData);
            setUsers(usersData);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('An unknown error occurred'));
            console.error("Failed to fetch data", err);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const value = { subjects, resources, users, loading, error, refreshData: fetchData };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

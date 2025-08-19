
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types';
import * as api from '../services/apiService';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<User | null>;
    signup: (name: string, email: string, password: string, avatar: string) => Promise<User | null>;
    logout: () => void;
    updateUserContext: (updatedUserData: Partial<User>) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('planx-user');
            if (storedUser) {
                setCurrentUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user from localStorage", error);
            localStorage.removeItem('planx-user');
        } finally {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string): Promise<User | null> => {
        setLoading(true);
        try {
            const users = await api.getUsers();
            const user = users.find(u => u.email === email && u.password === password);
            if (user) {
                const userToStore = { ...user };
                delete userToStore.password;
                localStorage.setItem('planx-user', JSON.stringify(userToStore));
                setCurrentUser(userToStore);
                return userToStore;
            }
            return null;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string, avatar: string): Promise<User | null> => {
        setLoading(true);
        try {
            const users = await api.getUsers();
            if (users.some(u => u.email === email)) {
                throw new Error("User with this email already exists.");
            }
            const newUser: Omit<User, 'id' | 'watched'> = {
                name: `Dr. ${name}`,
                email,
                password,
                avatar,
                role: UserRole.USER,
            };
            const response = await api.createUser(newUser);
            // We need to refetch users to get the new user with their ID
            const allUsers = await api.getUsers();
            const createdUser = allUsers.find(u => u.email === email);

            if (createdUser) {
                const userToStore = { ...createdUser };
                delete userToStore.password;
                localStorage.setItem('planx-user', JSON.stringify(userToStore));
                setCurrentUser(userToStore);
                return userToStore;
            }
            return null;
        } finally {
            setLoading(false);
        }
    };
    
    const logout = () => {
        setCurrentUser(null);
        localStorage.removeItem('planx-user');
    };

    const updateUserContext = async (updatedUserData: Partial<User>) => {
        if (!currentUser) return;

        // Optimistic update
        const updatedUser = { ...currentUser, ...updatedUserData };
        setCurrentUser(updatedUser);
        localStorage.setItem('planx-user', JSON.stringify(updatedUser));

        try {
            await api.updateUser({ ...updatedUserData, id: currentUser.id });
        } catch (error) {
            // Revert on failure
            console.error("Failed to update user:", error);
            setCurrentUser(currentUser);
            localStorage.setItem('planx-user', JSON.stringify(currentUser));
        }
    };

    const value = { currentUser, loading, login, signup, logout, updateUserContext };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

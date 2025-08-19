
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AVATARS } from '../constants';
import * as api from '../services/apiService';

const ProfilePage: React.FC = () => {
    const { currentUser, updateUserContext } = useAuth();
    const [name, setName] = useState(currentUser?.name.replace('Dr. ', '') || '');
    const [avatar, setAvatar] = useState(currentUser?.avatar || AVATARS[0]);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (!currentUser) {
        return <div>Please log in to see your profile.</div>;
    }

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        try {
            const updatedData = {
                id: currentUser.id,
                name: `Dr. ${name}`,
                avatar: avatar,
            };
            await updateUserContext(updatedData);
            setMessage('Profile updated successfully!');
        } catch (err) {
            setError('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            await api.updateUser({ id: currentUser.id, password });
            setMessage('Password changed successfully!');
            setPassword('');
            setConfirmPassword('');
        } catch (err) {
            setError('Failed to change password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            
            {message && <div className="p-3 bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300 rounded-md">{message}</div>}
            {error && <div className="p-3 bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 rounded-md">{error}</div>}

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Update Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                        <div className="mt-1 flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300">Dr.</span>
                            <input type="text" name="name" id="name" value={name} onChange={(e) => setName(e.target.value)} required
                                   className="flex-1 min-w-0 block w-full px-3 py-2 rounded-none rounded-r-md sm:text-sm border-gray-300 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Avatar</label>
                        <div className="mt-2 grid grid-cols-4 sm:grid-cols-8 gap-4">
                            {AVATARS.map(avatarUrl => (
                                <button type="button" key={avatarUrl} onClick={() => setAvatar(avatarUrl)}
                                        className={`rounded-full p-1 transition-all duration-200 ${avatar === avatarUrl ? 'ring-4 ring-blue-500' : 'ring-2 ring-transparent hover:ring-blue-300'}`}>
                                    <img src={avatarUrl} alt="avatar" className="w-16 h-16 rounded-full" />
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                     <input type="password" placeholder="New Password" value={password} onChange={e => setPassword(e.target.value)}
                           className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                     <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                           className="block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                     <div>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;


import React from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import * as api from '../../services/apiService';
import { UserRole } from '../../types';

const UserManager: React.FC = () => {
    const { users, refreshData } = useData();
    const { currentUser } = useAuth();
    
    const handleRoleChange = async (userId: string, newRole: UserRole) => {
        try {
            await api.updateUser({ id: userId, role: newRole });
            await refreshData();
        } catch (error) {
            alert('Failed to change user role.');
        }
    };
    
    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this user?')) {
            try {
                await api.deleteUser(userId);
                await refreshData();
            } catch (error) {
                alert('Failed to delete user.');
            }
        }
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="py-2 px-4 text-left">Name</th>
                            <th className="py-2 px-4 text-left">Email</th>
                            <th className="py-2 px-4 text-left">Role</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id} className="border-b dark:border-gray-700">
                                <td className="py-2 px-4 flex items-center gap-2">
                                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full"/>
                                    {user.name}
                                </td>
                                <td className="py-2 px-4">{user.email}</td>
                                <td className="py-2 px-4">
                                     <select
                                        value={user.role}
                                        onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                                        disabled={user.id === currentUser?.id}
                                        className="p-1 border rounded dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50"
                                    >
                                        <option value={UserRole.USER}>User</option>
                                        <option value={UserRole.ADMIN}>Admin</option>
                                        <option value={UserRole.SUPER_ADMIN}>Super Admin</option>
                                    </select>
                                </td>
                                <td className="py-2 px-4">
                                     <button 
                                        onClick={() => handleDeleteUser(user.id)}
                                        disabled={user.id === currentUser?.id}
                                        className="text-red-500 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
                                     >
                                        Delete
                                     </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManager;


import React, { useState } from 'react';
import { useData } from '../../hooks/useData';
import { Resource } from '../../types';
import LoadingSpinner from '../common/LoadingSpinner';
import Modal from '../common/Modal';
import * as api from '../../services/apiService';
import { uploadToInternetArchive } from '../../services/archiveService';
import { generateThumbnail } from '../../services/geminiService';

const ContentManager: React.FC = () => {
    const { resources, subjects, loading, refreshData } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingResource, setEditingResource] = useState<Partial<Resource> | null>(null);
    const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
    const [isProcessing, setIsProcessing] = useState(false);

    const openModal = (resource: Partial<Resource> | null = null) => {
        setEditingResource(resource || {});
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setEditingResource(null);
        setIsModalOpen(false);
        setUploadProgress({});
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if (!editingResource) return;
        setEditingResource({ ...editingResource, [e.target.name]: e.target.value });
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !editingResource) return;
        const file = e.target.files[0];
        const fieldName = e.target.name; // 'video_link' or 'pdf_link'
        
        try {
            setIsProcessing(true);
            setUploadProgress(prev => ({ ...prev, [fieldName]: 0 }));
            const url = await uploadToInternetArchive(file, (percentage) => {
                setUploadProgress(prev => ({ ...prev, [fieldName]: percentage }));
            });
            setEditingResource(prev => ({ ...prev, [fieldName]: url }));
        } catch (error) {
            console.error('Upload failed:', error);
            alert('File upload failed.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleGenerateThumbnail = async () => {
        if (!editingResource || !editingResource.title) {
            alert("Please enter a title first.");
            return;
        }
        setIsProcessing(true);
        try {
            const imageUrl = await generateThumbnail(editingResource.title);
            setEditingResource(prev => ({ ...prev, image_url: imageUrl }));
        } catch (error) {
            alert('Failed to generate thumbnail.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingResource || !editingResource.title || !editingResource.Subject_Name || !editingResource.video_link || !editingResource.pdf_link || !editingResource.image_url) {
            alert('Please fill all fields');
            return;
        }
        
        setIsProcessing(true);
        try {
            if (editingResource.id) {
                await api.updateResource(editingResource as Resource);
            } else {
                await api.createResource(editingResource as Omit<Resource, 'id'>);
            }
            await refreshData();
            closeModal();
        } catch (error) {
            console.error('Failed to save resource:', error);
            alert('Failed to save resource.');
        } finally {
            setIsProcessing(false);
        }
    };
    
    const handleDelete = async (id: string) => {
        if(window.confirm('Are you sure you want to delete this lecture?')){
            try {
                await api.deleteResource(id);
                await refreshData();
            } catch (error) {
                alert('Failed to delete resource');
            }
        }
    }

    if (loading) return <LoadingSpinner />;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Manage Lectures</h2>
                <button onClick={() => openModal()} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                    Add New Lecture
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full bg-white dark:bg-gray-800">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                            <th className="py-2 px-4 text-left">Title</th>
                            <th className="py-2 px-4 text-left">Subject</th>
                            <th className="py-2 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {resources.map(res => (
                            <tr key={res.id} className="border-b dark:border-gray-700">
                                <td className="py-2 px-4">{res.title}</td>
                                <td className="py-2 px-4">{res.Subject_Name}</td>
                                <td className="py-2 px-4 space-x-2">
                                    <button onClick={() => openModal(res)} className="text-blue-500 hover:underline">Edit</button>
                                    <button onClick={() => handleDelete(res.id)} className="text-red-500 hover:underline">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingResource?.id ? 'Edit Lecture' : 'Add New Lecture'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Form fields here */}
                    <input name="title" placeholder="Title" value={editingResource?.title || ''} onChange={handleFormChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required/>
                    <select name="Subject_Name" value={editingResource?.Subject_Name || ''} onChange={handleFormChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" required>
                        <option value="">Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.Subject_Name}>{s.Subject_Name}</option>)}
                    </select>
                    
                    <div>
                        <label>Video</label>
                        <input name="video_link" placeholder="YouTube or IA URL" value={editingResource?.video_link || ''} onChange={handleFormChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <span className="text-sm">Or upload:</span>
                        <input type="file" name="video_link" accept="video/*" onChange={handleFileChange} className="w-full text-sm"/>
                        {uploadProgress['video_link'] > 0 && <progress value={uploadProgress['video_link']} max="100" className="w-full" />}
                    </div>
                    
                    <div>
                        <label>PDF Slides</label>
                        <input name="pdf_link" placeholder="PDF URL" value={editingResource?.pdf_link || ''} onChange={handleFormChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                        <span className="text-sm">Or upload:</span>
                        <input type="file" name="pdf_link" accept="application/pdf" onChange={handleFileChange} className="w-full text-sm"/>
                         {uploadProgress['pdf_link'] > 0 && <progress value={uploadProgress['pdf_link']} max="100" className="w-full" />}
                    </div>

                     <div>
                        <label>Thumbnail</label>
                        <div className="flex items-center gap-4">
                             <input name="image_url" placeholder="Image URL" value={editingResource?.image_url || ''} onChange={handleFormChange} className="flex-grow p-2 border rounded dark:bg-gray-700 dark:border-gray-600" />
                            <button type="button" onClick={handleGenerateThumbnail} disabled={isProcessing} className="px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-purple-400">Generate with AI</button>
                        </div>
                        {editingResource?.image_url && <img src={editingResource.image_url} alt="thumbnail preview" className="mt-2 w-48 h-auto rounded" />}
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button type="button" onClick={closeModal} className="px-4 py-2 mr-2 bg-gray-300 dark:bg-gray-600 rounded-md">Cancel</button>
                        <button type="submit" disabled={isProcessing} className="px-4 py-2 bg-blue-600 text-white rounded-md disabled:bg-blue-400">
                            {isProcessing ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ContentManager;

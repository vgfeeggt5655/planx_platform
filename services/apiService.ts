
import { API_ENDPOINTS } from '../constants';
import { Resource, Subject, User, UserRole, ApiResponse } from '../types';

// Generic function for POST requests
async function postData<T>(url: string, formData: FormData): Promise<ApiResponse<T>> {
    const response = await fetch(url, {
        method: 'POST',
        body: formData,
    });
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
}

// Resources API
export const getResources = async (): Promise<Resource[]> => {
    const response = await fetch(API_ENDPOINTS.RESOURCES);
    const result: ApiResponse<Resource[]> = await response.json();
    return result.data;
};

export const createResource = async (resource: Omit<Resource, 'id'>) => {
    const formData = new FormData();
    formData.append('action', 'create');
    formData.append('title', resource.title);
    formData.append('Subject_Name', resource.Subject_Name);
    formData.append('video_link', resource.video_link);
    formData.append('pdf_link', resource.pdf_link);
    formData.append('image_url', resource.image_url);
    return postData(API_ENDPOINTS.RESOURCES, formData);
};

export const updateResource = async (resource: Resource) => {
    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('id', resource.id);
    formData.append('title', resource.title);
    formData.append('Subject_Name', resource.Subject_Name);
    formData.append('video_link', resource.video_link);
    formData.append('pdf_link', resource.pdf_link);
    formData.append('image_url', resource.image_url);
    return postData(API_ENDPOINTS.RESOURCES, formData);
};

export const deleteResource = async (id: string) => {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);
    return postData(API_ENDPOINTS.RESOURCES, formData);
};


// Subjects API
export const getSubjects = async (): Promise<Subject[]> => {
    const response = await fetch(`${API_ENDPOINTS.SUBJECTS}?action=get`);
    const result: ApiResponse<Subject[]> = await response.json();
    return result.data.sort((a, b) => a.number - b.number);
};

export const addSubject = async (subjectName: string) => {
    const formData = new FormData();
    formData.append('action', 'create');
    formData.append('Subject_Name', subjectName);
    return postData(API_ENDPOINTS.SUBJECTS, formData);
};

export const updateSubject = async (subject: Subject) => {
    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('id', subject.id);
    formData.append('Subject_Name', subject.Subject_Name);
    formData.append('number', subject.number.toString());
    return postData(API_ENDPOINTS.SUBJECTS, formData);
};

export const deleteSubject = async (id: string) => {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);
    return postData(API_ENDPOINTS.SUBJECTS, formData);
};


// Users API
export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_ENDPOINTS.USERS}?action=get`);
    const result: ApiResponse<User[]> = await response.json();
    // Parse the 'watched' string into an object
    return result.data.map(user => ({
        ...user,
        watched: typeof user.watched === 'string' && user.watched ? JSON.parse(user.watched) : {}
    }));
};

export const createUser = async (user: Omit<User, 'id' | 'watched'>) => {
    const formData = new FormData();
    formData.append('action', 'create');
    formData.append('name', user.name);
    formData.append('email', user.email);
    formData.append('password', user.password!);
    formData.append('role', user.role);
    formData.append('avatar', user.avatar);
    formData.append('watched', '{}');
    return postData(API_ENDPOINTS.USERS, formData);
};

export const updateUser = async (user: Partial<User> & { id: string }) => {
    const formData = new FormData();
    formData.append('action', 'update');
    formData.append('id', user.id);
    if (user.name) formData.append('name', user.name);
    if (user.email) formData.append('email', user.email);
    if (user.password) formData.append('password', user.password);
    if (user.role) formData.append('role', user.role);
    if (user.avatar) formData.append('avatar', user.avatar);
    if (user.watched) formData.append('watched', JSON.stringify(user.watched));
    return postData(API_ENDPOINTS.USERS, formData);
};

export const deleteUser = async (id: string) => {
    const formData = new FormData();
    formData.append('action', 'delete');
    formData.append('id', id);
    return postData(API_ENDPOINTS.USERS, formData);
};

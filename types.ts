
export enum UserRole {
    USER = 'user',
    ADMIN = 'admin',
    SUPER_ADMIN = 'super_admin'
}

export interface User {
    id: string;
    name: string;
    email: string;
    password?: string; // Should not be stored in client state long-term
    role: UserRole;
    avatar: string;
    watched: Record<string, number>; // { resourceId: timestamp }
}

export interface Subject {
    id: string;
    Subject_Name: string;
    number: number;
}

export interface Resource {
    id: string;
    title: string;
    Subject_Name: string;
    video_link: string;
    pdf_link: string;
    image_url: string;
}

export interface MCQ {
    question: string;
    options: string[];
    correctAnswer: string;
}

export interface Flashcard {
    front: string;
    back: string;
}

export interface ApiResponse<T> {
    data: T;
}
